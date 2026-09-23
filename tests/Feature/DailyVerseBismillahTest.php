<?php

namespace Tests\Feature;

use App\Models\Ayah;
use App\Models\Surah;
use App\Services\DailyContent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DailyVerseBismillahTest extends TestCase
{
    use RefreshDatabase;

    private const BISMILLAH = "\u{0628}\u{0650}\u{0633}\u{0652}\u{0645}\u{0650}\u{0020}\u{0671}\u{0644}\u{0644}\u{0651}\u{064E}\u{0647}\u{0650}\u{0020}\u{0671}\u{0644}\u{0631}\u{0651}\u{064E}\u{062D}\u{0652}\u{0645}\u{064E}\u{0670}\u{0646}\u{0650}\u{0020}\u{0671}\u{0644}\u{0631}\u{0651}\u{064E}\u{062D}\u{0650}\u{064A}\u{0645}\u{0650}";

    private const BISMILLAH_VARIANT = "\u{0628}\u{0651}\u{0650}\u{0633}\u{0652}\u{0645}\u{0650}\u{0020}\u{0671}\u{0644}\u{0644}\u{0651}\u{064E}\u{0647}\u{0650}\u{0020}\u{0671}\u{0644}\u{0631}\u{0651}\u{064E}\u{062D}\u{0652}\u{0645}\u{064E}\u{0670}\u{0646}\u{0650}\u{0020}\u{0671}\u{0644}\u{0631}\u{0651}\u{064E}\u{062D}\u{0650}\u{064A}\u{0645}\u{0650}";

    private function seedFirstVerse(int $surahNumber, string $textAr, int $ayahNumber = 1): Ayah
    {
        $surah = Surah::factory()->create([
            'number' => $surahNumber,
            'slug' => 'surah-'.$surahNumber,
            'ayah_count' => max($ayahNumber, 1),
        ]);

        return Ayah::factory()->create([
            'surah_id' => $surah->id,
            'number_in_surah' => $ayahNumber,
            'text_ar' => $textAr,
        ]);
    }

    public function test_daily_verse_strips_bismillah_from_first_verse(): void
    {
        config()->set('daily-verses', [[112, 1]]);

        $this->seedFirstVerse(112, self::BISMILLAH.'قُلْ هُوَ ٱللَّهُ أَحَدٌ');

        $ayah = DailyContent::todayAyah();

        $this->assertNotNull($ayah);
        $this->assertSame('قُلْ هُوَ ٱللَّهُ أَحَدٌ', $ayah->text_ar);
    }

    public function test_daily_verse_strips_bismillah_variant(): void
    {
        config()->set('daily-verses', [[95, 1]]);

        $this->seedFirstVerse(95, self::BISMILLAH_VARIANT.'وَٱلتِّينِ وَٱلزَّيْتُونِ');

        $this->assertSame('وَٱلتِّينِ وَٱلزَّيْتُونِ', DailyContent::todayAyah()?->text_ar);
    }

    public function test_daily_verse_api_strips_bismillah(): void
    {
        config()->set('daily-verses', [[112, 1]]);

        $this->seedFirstVerse(112, self::BISMILLAH.'قُلْ هُوَ ٱللَّهُ أَحَدٌ');

        $this->getJson('/api/verse-of-day')
            ->assertOk()
            ->assertJson(['text_ar' => 'قُلْ هُوَ ٱللَّهُ أَحَدٌ']);
    }

    public function test_daily_verse_keeps_bismillah_for_alfatiha(): void
    {
        config()->set('daily-verses', [[1, 1]]);

        $this->seedFirstVerse(1, self::BISMILLAH);

        $this->assertSame(self::BISMILLAH, DailyContent::todayAyah()?->text_ar);
    }

    public function test_share_page_strips_bismillah_from_first_verse(): void
    {
        $ayah = $this->seedFirstVerse(112, self::BISMILLAH.'قُلْ هُوَ ٱللَّهُ أَحَدٌ');

        $this->get("/share/ayah/{$ayah->id}")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Share')
                ->where('textAr', 'قُلْ هُوَ ٱللَّهُ أَحَدٌ'));
    }
}
