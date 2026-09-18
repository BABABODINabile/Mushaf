<?php

namespace App\Services;

use App\Models\Ayah;

class DailyContent
{
    /**
     * Verset du jour, déterminé de façon déterministe sur la base du jour courant.
     * Liste des versets partagée entre le site et les rappels par email.
     */
    public static function todayAyah(): ?Ayah
    {
        $refs = (array) config('daily-verses');
        $index = intdiv(now()->timestamp, 86400) % count($refs);
        [$surahNumber, $ayahNumber] = $refs[$index];

        return Ayah::query()
            ->where('number_in_surah', $ayahNumber)
            ->whereHas('surah', fn ($q) => $q->where('number', $surahNumber))
            ->with('surah')
            ->first();
    }
}
