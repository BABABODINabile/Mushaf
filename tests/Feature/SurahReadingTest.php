<?php

namespace Tests\Feature;

use App\Models\Ayah;
use App\Models\Surah;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SurahReadingTest extends TestCase
{
    use RefreshDatabase;

    private const BISMILLAH = "\u{0628}\u{0650}\u{0633}\u{0652}\u{0645}\u{0650}\u{0020}\u{0671}\u{0644}\u{0644}\u{0651}\u{064E}\u{0647}\u{0650}\u{0020}\u{0671}\u{0644}\u{0631}\u{0651}\u{064E}\u{062D}\u{0652}\u{0645}\u{064E}\u{0670}\u{0646}\u{0650}\u{0020}\u{0671}\u{0644}\u{0631}\u{0651}\u{064E}\u{062D}\u{0650}\u{064A}\u{0645}\u{0650}";

    private const BISMILLAH_VARIANT = "\u{0628}\u{0651}\u{0650}\u{0633}\u{0652}\u{0645}\u{0650}\u{0020}\u{0671}\u{0644}\u{0644}\u{0651}\u{064E}\u{0647}\u{0650}\u{0020}\u{0671}\u{0644}\u{0631}\u{0651}\u{064E}\u{062D}\u{0652}\u{0645}\u{064E}\u{0670}\u{0646}\u{0650}\u{0020}\u{0671}\u{0644}\u{0631}\u{0651}\u{064E}\u{062D}\u{0650}\u{064A}\u{0645}\u{0650}";

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedSurah(2, 'البقرة', self::BISMILLAH.'الٓمٓ');
        $this->seedSurah(9, 'التوبة', 'بَرَاءَةٌ مِّنَ ٱللَّهِ');
        $this->seedSurah(95, 'التين', self::BISMILLAH_VARIANT.'وَٱلتِّينِ وَٱلزَّيْتُونِ');
        $this->seedSurah(1, 'الفاتحة', self::BISMILLAH);
    }

    private function seedSurah(int $number, string $nameAr, string $firstAyahText): void
    {
        $surah = Surah::create([
            'number' => $number,
            'name_ar' => $nameAr,
            'name_en' => "Surah $number",
            'name_fr' => "Surah $number",
            'revelation_type' => 'Meccan',
            'ayah_count' => 1,
        ]);

        Ayah::create([
            'surah_id' => $surah->id,
            'number_in_surah' => 1,
            'global_number' => $number,
            'text_ar' => $firstAyahText,
            'text_en' => 'verse',
            'text_fr' => 'verset',
            'juz' => 1,
        ]);
    }

    private function firstAyahOnPage(int $number): string
    {
        return $this->get("/coran/$number")
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Surah'))
            ->viewData('page')['props']['ayahs'][0]['text_ar'];
    }

    public function test_first_verse_strips_the_bismillah_prefix(): void
    {
        $this->assertSame('الٓمٓ', $this->firstAyahOnPage(2));
    }

    public function test_surah_without_bismillah_is_unchanged(): void
    {
        $this->assertSame('بَرَاءَةٌ مِّنَ ٱللَّهِ', $this->firstAyahOnPage(9));
    }

    public function test_bismillah_variant_is_stripped_too(): void
    {
        $this->assertSame('وَٱلتِّينِ وَٱلزَّيْتُونِ', $this->firstAyahOnPage(95));
    }

    public function test_alfatiha_keeps_bismillah_as_its_first_verse(): void
    {
        $this->assertSame(self::BISMILLAH, $this->firstAyahOnPage(1));
    }
}
