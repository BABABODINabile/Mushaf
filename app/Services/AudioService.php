<?php

namespace App\Services;

class AudioService
{
    /**
     * Récupérer un récateur par son id.
     */
    public function getReciter(?string $id = null): ?array
    {
        $id = strtolower($id ?: config('reciters.default'));

        return config('reciters.reciters')[$id] ?? null;
    }

    /**
     * Liste de tous les récitateurs (format tableau indexé pour l'API JSON).
     */
    public function reciters(): array
    {
        return array_values(config('reciters.reciters'));
    }

    /**
     * Récitateur par défaut.
     */
    public function defaultReciter(): array
    {
        return $this->getReciter(config('reciters.default'));
    }

    /**
     * URL audio d'une sourate complète (Cloudflare R2).
     */
    public function getSurahUrl(string $reciterId, int $surahNumber): ?string
    {
        $reciter = $this->getReciter($reciterId);

        if (! $reciter) {
            return null;
        }

        $num = str_pad($surahNumber, 3, '0', STR_PAD_LEFT);
        $base = config('services.r2.public_url');
        $format = $reciter['format'] ?? 'opus';

        return "{$base}/{$reciter['id']}/{$num}.{$format}";
    }
}
