<?php

namespace Tests\Feature;

use App\Models\Surah;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FixSurahNamesTest extends TestCase
{
    use RefreshDatabase;

    public function test_la_liste_francaise_contient_les_114_sourates(): void
    {
        $names = json_decode((string) file_get_contents(database_path('data/surah_names_fr.json')), true);

        $this->assertIsArray($names);
        $this->assertCount(114, $names);
        $this->assertSame([1, 114], [min(array_keys($names)), max(array_keys($names))]);

        foreach ($names as $number => $name) {
            $this->assertIsString($name);
            $this->assertNotSame('', $name);
        }

        $this->assertSame('L\'Ouverture', $names[1]);
        $this->assertSame('La Vache', $names[2]);
    }

    public function test_la_commande_reordonne_les_colonnes_anglais_francais(): void
    {
        Surah::create([
            'number' => 1,
            'name_ar' => 'الفاتحة',
            'name_en' => 'Al-Faatiha',
            'name_fr' => 'The Opening',
            'revelation_type' => 'Meccan',
            'ayah_count' => 7,
        ]);
        Surah::create([
            'number' => 2,
            'name_ar' => 'البقرة',
            'name_en' => 'Al-Baqara',
            'name_fr' => 'The Cow',
            'revelation_type' => 'Medinan',
            'ayah_count' => 286,
        ]);

        $this->artisan('mushaf:fix-surah-names')->assertSuccessful();

        $this->assertDatabaseHas('surahs', ['number' => 1, 'name_fr' => 'L\'Ouverture', 'name_en' => 'The Opening']);
        $this->assertDatabaseHas('surahs', ['number' => 2, 'name_fr' => 'La Vache', 'name_en' => 'The Cow']);
    }

    public function test_la_commande_est_idempotente(): void
    {
        Surah::create([
            'number' => 112,
            'name_ar' => 'الإخلاص',
            'name_en' => 'Al-Ikhlas',
            'name_fr' => 'Sincerity',
            'revelation_type' => 'Meccan',
            'ayah_count' => 4,
        ]);

        $this->artisan('mushaf:fix-surah-names')->assertSuccessful();
        $this->artisan('mushaf:fix-surah-names')->assertSuccessful();

        $surah = Surah::where('number', 112)->first();
        $this->assertSame('Le Monothéisme pur', $surah->name_fr);
        $this->assertSame('Sincerity', $surah->name_en);
    }
}
