<?php

namespace App\Console\Commands;

use App\Models\Surah;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('mushaf:fix-surah-names')]
#[Description('Corriger les noms français (liste Hamidullah) et anglais des 114 sourates')]
class FixSurahNames extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $frNames = $this->frenchNames();

        if (count($frNames) !== 114) {
            $this->error('Le fichier des noms français est invalide ou incomplet.');

            return Command::FAILURE;
        }

        $updated = 0;
        $skipped = 0;

        foreach ($frNames as $number => $nameFr) {
            $surah = Surah::where('number', $number)->first(['id', 'name_fr']);

            if (! $surah) {
                continue;
            }

            // Déjà corrigé : inchangé (idempotent).
            if ($surah->name_fr === $nameFr) {
                $skipped++;

                continue;
            }

            $surah->name_en = $surah->name_fr; // la traduction anglaise actuellement stockée
            $surah->name_fr = $nameFr;
            $surah->save();

            $updated++;
        }

        $this->info("✅ {$updated} sourate(s) corrigée(s), {$skipped} déjà à jour.");

        return Command::SUCCESS;
    }

    /**
     * Charger la liste des 114 noms français (titres Hamidullah).
     */
    private function frenchNames(): array
    {
        $path = database_path('data/surah_names_fr.json');
        $data = json_decode((string) file_get_contents($path), true);

        return is_array($data) ? $data : [];
    }
}
