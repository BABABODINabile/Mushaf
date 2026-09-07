<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class DownloadAudios extends Command
{
    protected $signature = 'mushaf:download-audios
        {--reciter= : Télécharger un seul récateur}
        {--surah= : Télécharger une seule sourate}
        {--force : Re-télécharger même si le fichier existe}';

    protected $description = 'Télécharger les fichiers audio .opus/.mp3 vers storage/app/audio/';

    private const CDN_BASE = 'https://cdn.mualim.app';

    private const HF_BASE = 'https://huggingface.co/datasets/zaibihassan/Quranic-Recitation-Data/resolve/main';

    private const ARCHIVE_ORG_BASE = 'https://ia601806.us.archive.org/1/items';

    public function handle(): int
    {
        $reciters = config('reciters.reciters');
        $targetReciter = $this->option('reciter');
        $targetSurah = $this->option('surah') ? (int) $this->option('surah') : null;
        $force = $this->option('force');

        if ($targetReciter) {
            if (! isset($reciters[$targetReciter])) {
                $this->error("Réciteur introuvable : {$targetReciter}");

                return self::FAILURE;
            }
            $reciters = [$targetReciter => $reciters[$targetReciter]];
        }

        $totalDownloaded = 0;
        $totalSkipped = 0;
        $totalErrors = 0;
        $totalSize = 0;
        $surahs = $targetSurah ? [$targetSurah] : range(1, 114);

        foreach ($reciters as $id => $reciter) {
            $format = $reciter['format'] ?? 'opus';
            $dir = storage_path("app/audio/{$id}");

            if (! is_dir($dir)) {
                mkdir($dir, 0755, true);
            }

            $this->info("Téléchargement [{$id}]...");

            foreach ($surahs as $surah) {
                $num = str_pad($surah, 3, '0', STR_PAD_LEFT);
                $filename = "{$num}.{$format}";
                $filepath = "{$dir}/{$filename}";

                if (! $force && file_exists($filepath) && filesize($filepath) > 0) {
                    $totalSkipped++;

                    continue;
                }

                $urls = $this->buildUrls($reciter, $num, $format);
                $success = false;

                foreach ($urls as $urlIndex => $url) {
                    if ($success) {
                        break;
                    }

                    $retries = 3;
                    while ($retries > 0 && ! $success) {
                        try {
                            $response = Http::timeout(60)
                                ->withHeaders(['User-Agent' => 'Mushaf/1.0'])
                                ->get($url);

                            if ($response->successful()) {
                                file_put_contents($filepath, $response->body());
                                $size = filesize($filepath);
                                $totalSize += $size;
                                $totalDownloaded++;
                                $source = match ($urlIndex) {
                                    0 => 'CDN',
                                    1 => 'HF',
                                    default => 'Archive.org',
                                };
                                $this->line("  [{$id}] {$filename} OK (".$this->formatSize($size).") [{$source}]");
                                $success = true;
                            } else {
                                $retries--;
                                if ($retries > 0) {
                                    usleep(500_000 * (4 - $retries));
                                }
                            }
                        } catch (\Exception $e) {
                            $retries--;
                            if ($retries > 0) {
                                usleep(500_000 * (4 - $retries));
                            }
                        }
                    }
                }

                if (! $success) {
                    $totalErrors++;
                    $this->error("  [{$id}] {$filename} ERREUR après toutes les tentatives");
                }
            }
        }

        $this->newLine();
        $this->info('═══ Résumé ═══');
        $this->info("Téléchargés : {$totalDownloaded}");
        $this->info("Ignorés     : {$totalSkipped}");
        $this->info("Erreurs     : {$totalErrors}");
        $this->info('Taille totale : '.$this->formatSize($totalSize));

        return $totalErrors > 0 ? self::FAILURE : self::SUCCESS;
    }

    /**
     * Construire les URLs candidates pour un réciteur et une sourate.
     *
     * @return list<string>
     */
    private function buildUrls(array $reciter, string $num, string $format): array
    {
        $urls = [];

        // Source archive.org (Salah Ba Othman, etc.)
        if (isset($reciter['archive_org_item'])) {
            $item = $reciter['archive_org_item'];
            $urls[] = self::ARCHIVE_ORG_BASE."/{$item}/{$num}.{$format}";

            return $urls;
        }

        // CDN mualim.app (opus)
        if (isset($reciter['mualim_slug'])) {
            $slug = $reciter['mualim_slug'];
            $urls[] = self::CDN_BASE."/{$slug}/{$num}.{$format}";
        }

        // Fallback HuggingFace
        if (isset($reciter['huggingface_folder'])) {
            $encodedFolder = rawurlencode($reciter['huggingface_folder']);
            $urls[] = self::HF_BASE."/{$encodedFolder}/{$num}/{$num}.{$format}";
        }

        return $urls;
    }

    private function formatSize(int $bytes): string
    {
        if ($bytes >= 1_048_576) {
            return round($bytes / 1_048_576, 1).' Mo';
        }

        return round($bytes / 1024).' Ko';
    }
}
