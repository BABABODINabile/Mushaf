<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class UploadToR2 extends Command
{
    protected $signature = 'mushaf:upload-to-r2
        {--reciter= : Uploader un seul récateur}
        {--dry-run : Afficher ce qui serait uploadé sans le faire}';

    protected $description = 'Uploader les fichiers audio vers Cloudflare R2';

    public function handle(): int
    {
        $bucket = config('services.r2.bucket');
        $endpoint = config('services.r2.endpoint');
        $key = config('services.r2.key');
        $secret = config('services.r2.secret');

        if (! $bucket || ! $endpoint || ! $key || ! $secret) {
            $this->error('Configuration R2 manquante. Vérifiez CLOUDFLARE_R2_* dans .env');

            return self::FAILURE;
        }

        $dryRun = $this->option('dry-run');
        $targetReciter = $this->option('reciter');
        $audioDir = storage_path('app/audio');

        if (! is_dir($audioDir)) {
            $this->error("Répertoire introuvable : {$audioDir}");

            return self::FAILURE;
        }

        $reciters = $targetReciter
            ? [$targetReciter]
            : array_filter(scandir($audioDir), fn ($d) => $d !== '.' && $d !== '..' && is_dir("{$audioDir}/{$d}"));

        $totalUploaded = 0;
        $totalErrors = 0;
        $totalSize = 0;

        foreach ($reciters as $reciterId) {
            $reciterDir = "{$audioDir}/{$reciterId}";
            if (! is_dir($reciterDir)) {
                $this->error("Répertoire introuvable : {$reciterDir}");

                continue;
            }

            $this->info("Upload [{$reciterId}]...");

            $files = collect(scandir($reciterDir))
                ->filter(fn ($f) => $f !== '.' && $f !== '..' && (str_ends_with($f, '.opus') || str_ends_with($f, '.mp3')))
                ->sort();

            foreach ($files as $filename) {
                $filepath = "{$reciterDir}/{$filename}";
                $keyName = "{$reciterId}/{$filename}";
                $size = filesize($filepath);
                $contentType = str_ends_with($filename, '.mp3') ? 'audio/mpeg' : 'audio/opus';

                if ($dryRun) {
                    $this->line("  [dry-run] {$keyName} (".$this->formatSize($size).')');
                    $totalUploaded++;
                    $totalSize += $size;

                    continue;
                }

                try {
                    Storage::disk('r2')->put($keyName, File::get($filepath), [
                        'ContentType' => $contentType,
                        'CacheControl' => 'public, max-age=31536000, immutable',
                    ]);

                    $totalUploaded++;
                    $totalSize += $size;
                    $this->line("  {$keyName} OK (".$this->formatSize($size).')');
                } catch (\Exception $e) {
                    $totalErrors++;
                    $this->error("  {$keyName} ERREUR : {$e->getMessage()}");
                }
            }
        }

        $this->newLine();
        $this->info('═══ Résumé ═══');
        $this->info("Uploadés : {$totalUploaded}");
        $this->info("Erreurs  : {$totalErrors}");
        $this->info('Taille totale : '.$this->formatSize($totalSize));

        if ($dryRun) {
            $this->warn('Mode dry-run : aucun fichier n\'a été uploadé.');
        }

        return $totalErrors > 0 ? self::FAILURE : self::SUCCESS;
    }

    private function formatSize(int $bytes): string
    {
        if ($bytes >= 1_048_576) {
            return round($bytes / 1_048_576, 1).' Mo';
        }

        return round($bytes / 1024).' Ko';
    }
}
