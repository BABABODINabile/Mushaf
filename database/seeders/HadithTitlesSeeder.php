<?php

namespace Database\Seeders;

use App\Models\Hadith;
use Illuminate\Database\Seeder;

class HadithTitlesSeeder extends Seeder
{
    public function run(): void
    {
        $titles = [
            1 => 'Les fondements de l\'Islam',
            2 => 'Les piliers de l\'Islam',
            3 => 'Les piliers de la foi',
            4 => 'Les actes de vertu',
            5 => 'La religion correcte',
            6 => 'Les branches de la foi',
            7 => 'La purification',
            8 => 'Le voyage rituel',
            9 => 'Le jeûne',
            10 => 'Le pèlerinage',
            11 => 'Les actes acceptés',
            12 => 'La sincérité',
            13 => 'La véracité',
            14 => 'La gardienneté du cœur',
            15 => 'L\'intention',
            16 => 'L\'acceptation',
            17 => 'La bonté',
            18 => 'La patience',
            19 => 'La recherche du licite',
            20 => 'L\'adoration',
            21 => 'La clémence',
            22 => 'L\'envie',
            23 => 'La fraternité',
            24 => 'L\'isolement',
            25 => 'La colère',
            26 => 'L\'intérêt',
            27 => 'La générosité',
            28 => 'L\'ingratitude',
            29 => 'La médisance',
            30 => 'L\'obéissance',
            31 => 'L\'interdiction',
            32 => 'Les pieux',
            33 => 'La méfiance',
            34 => 'L\'humilité',
            35 => 'La confiance',
            36 => 'La richesse',
            37 => 'La pauvreté',
            38 => 'L\'aide',
            39 => 'La mécréance',
            40 => 'La sincérité finale',
        ];

        $updated = 0;

        foreach ($titles as $number => $title) {
            $hadith = Hadith::where('collection', 'nawawi')
                ->where('hadith_number', $number)
                ->first();

            if ($hadith) {
                $hadith->update(['title' => $title]);
                $updated++;
            }
        }

        $this->command->info("✅ {$updated} hadiths mis à jour avec un titre.");
    }
}
