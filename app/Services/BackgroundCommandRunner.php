<?php

namespace App\Services;

use App\Models\CommandRun;
use Illuminate\Support\Str;
use Symfony\Component\Process\Process;

class BackgroundCommandRunner
{
    /**
     * Lancer une commande artisan en arrière-plan (détachée du process web).
     * Lève une exception si la clé ou une option n'est pas dans la liste blanche.
     */
    public function launch(string $key, array $options = []): CommandRun
    {
        $definition = $this->definition($key);
        $options = $this->validatedOptions($key, $options);

        $logDir = storage_path('logs/commands');
        if (! is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }

        $logPath = $logDir.'/'.Str::slug($key).'-'.now()->format('Ymd-His').'.log';

        $command = $this->buildCommand($definition, $options, $logPath);

        $process = Process::fromShellCommandline($command);
        $process->setTimeout(0)->run();

        return CommandRun::create([
            'command_key' => $key,
            'status' => 'running',
            'log_path' => $logPath,
            'started_at' => now(),
        ]);
    }

    /**
     * Résoudre la définition d'une commande depuis la liste blanche.
     */
    public function definition(string $key): array
    {
        $definition = config("commands.{$key}");

        if (! $definition) {
            throw new \InvalidArgumentException("Commande inconnue : {$key}");
        }

        return $definition;
    }

    /**
     * Ne conserver que les options présentes dans la liste blanche, avec leurs valeurs valides.
     * Les options inconnues sont rejetées (strict) pour éviter toute dérive.
     */
    public function validatedOptions(string $key, array $options): array
    {
        $allowed = $this->definition($key)['options'] ?? [];

        $filtered = collect($options)
            ->filter(fn ($value, $name) => isset($allowed[$name]))
            ->map(function ($value, $name) use ($allowed) {
                $spec = $allowed[$name];
                $type = $spec['type'] ?? 'boolean';

                if ($type === 'boolean') {
                    return (bool) $value;
                }

                if ($type === 'select') {
                    return in_array($value, $spec['choices'] ?? [], true) ? $value : $spec['default'];
                }

                if ($type === 'number') {
                    $value = (int) $value;

                    return max($spec['min'] ?? 0, min($value, $spec['max'] ?? PHP_INT_MAX));
                }

                return $value;
            })
            ->all();

        $unknown = array_diff(array_keys($options), array_keys($allowed));
        if ($unknown) {
            throw new \InvalidArgumentException(
                'Option non autorisée : '.implode(', ', $unknown)
            );
        }

        return $filtered;
    }

    /**
     * Relire la sortie d'un run et synchroniser son statut avec l'exit_code du log.
     */
    public function refresh(CommandRun $run): CommandRun
    {
        if (! $run->isRunning()) {
            return $run;
        }

        $result = $this->resultFromLog($run->log_path);

        if ($result) {
            $run->update($result);
        }

        return $run->fresh();
    }

    /**
     * Extraire statut + exit_code depuis la dernière ligne `exit:N` d'un log.
     * Retourne null tant que la commande n'a pas écrit sa ligne de fin.
     */
    public function resultFromLog(string $path): ?array
    {
        if (! file_exists($path)) {
            return null;
        }

        if (! preg_match('/^exit:\s*(\d+)$/m', $this->tail($path, 4096), $matches)) {
            return null;
        }

        return [
            'status' => $matches[1] === '0' ? 'success' : 'failed',
            'exit_code' => (int) $matches[1],
            'finished_at' => now(),
        ];
    }

    /**
     * Dernier contenu d'un fichier de log (en octets, pas en lignes),
     * sans codes ANSI ni emojis.
     */
    public function tail(string $path, int $bytes = 16384): string
    {
        if (! file_exists($path)) {
            return '';
        }

        $size = filesize($path);
        $offset = max(0, $size - $bytes);

        $content = (string) substr((string) file_get_contents($path), $offset);

        $content = preg_replace('/\e\[[0-9;]*m/', '', $content) ?: $content;

        return $this->stripEmojis($content);
    }

    /**
     * Retirer les emojis et les selecteurs de variante de la sortie console.
     */
    private function stripEmojis(string $content): string
    {
        $pattern = '/[\x{1F000}-\x{1FAFF}\x{2600}-\x{27BF}\x{FE00}-\x{FE0F}\x{23E9}-\x{23FA}]/u';

        return preg_replace($pattern, '', $content) ?: $content;
    }

    /**
     * Générer la ligne de commande nohup qui écrit l'exit code en fin de log.
     */
    private function buildCommand(array $definition, array $options, string $logPath): string
    {
        $php = escapeshellarg(PHP_BINARY);
        $artisan = escapeshellarg(base_path('artisan'));
        $log = escapeshellarg($logPath);

        $signature = $definition['command'];

        foreach ($options as $name => $value) {
            if ($value === true) {
                $signature .= " --{$name}";
            } elseif ($value !== false && $value !== null && $value !== '') {
                $signature .= " --{$name}=".escapeshellarg((string) $value);
            }
        }

        return "nohup {$php} {$artisan} {$signature} --no-interaction --no-ansi > {$log} 2>&1; echo exit:\$? >> {$log} &";
    }
}
