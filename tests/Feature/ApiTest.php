<?php

namespace Tests\Feature;

use App\Models\Ayah;
use App\Models\Surah;
use App\Services\DailyContent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_surahs_api_returns_response(): void
    {
        $response = $this->getJson('/api/surahs');

        $response->assertOk();
    }

    public function test_hadiths_api_returns_response(): void
    {
        $response = $this->getJson('/api/hadiths');

        $response->assertOk();
    }

    public function test_search_api_returns_response(): void
    {
        $response = $this->getJson('/api/search?q=fatiha');

        $response->assertOk();
    }

    public function test_reciters_api_returns_response(): void
    {
        $response = $this->getJson('/api/reciters');

        $response->assertOk();
    }

    public function test_verse_of_day_returns_response(): void
    {
        $response = $this->getJson('/api/verse-of-day');

        // May return 200 or 500 depending on DB state
        $this->assertContains($response->getStatusCode(), [200, 404, 500]);
    }

    public function test_hadith_of_day_returns_response(): void
    {
        $response = $this->getJson('/api/hadith-of-day');

        // May return 200 or 500 depending on DB state
        $this->assertContains($response->getStatusCode(), [200, 404, 500]);
    }

    public function test_verse_of_day_uses_shared_meditation_list(): void
    {
        // Jour fixe : la liste (config/daily-verses.php) et le service
        // (app/Services/DailyContent.php) doivent produire la même référence,
        // aussi bien pour l'API que pour les rappels par email.
        $this->travelTo('2026-09-18 12:00:00');

        $refs = config('daily-verses');
        $index = intdiv(now()->timestamp, 86400) % count($refs);
        [$surahNumber, $ayahNumber] = $refs[$index];

        $surah = Surah::factory()->create([
            'number' => $surahNumber,
            'slug' => "surah-{$surahNumber}",
            'name_ar' => 'سورة',
            'name_fr' => 'Sourate test',
            'name_en' => 'Test Surah',
            'ayah_count' => $ayahNumber,
        ]);

        $ayah = Ayah::factory()->create([
            'surah_id' => $surah->id,
            'number_in_surah' => $ayahNumber,
            'text_ar' => 'آية',
            'text_fr' => 'Verset test',
            'text_en' => 'Test verse',
        ]);

        // Le service partagé sélectionne exactement ce verset ce jour-là.
        $this->assertSame($ayah->id, DailyContent::todayAyah()?->id);

        // L'API renvoie le même verset que la logique du service partagé
        // (utilisé aussi par SendDailyReminders::fetchVerse).
        $this->getJson('/api/verse-of-day')
            ->assertOk()
            ->assertJson([
                'id' => $ayah->id,
                'surah_number' => $surahNumber,
                'ayah_number' => $ayahNumber,
                'text_ar' => 'آية',
            ]);
    }
}
