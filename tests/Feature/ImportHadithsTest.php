<?php

namespace Tests\Feature;

use App\Models\Hadith;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ImportHadithsTest extends TestCase
{
    use RefreshDatabase;

    public function test_import_uses_official_french_translations(): void
    {
        $french = json_decode((string) file_get_contents(database_path('data/hadiths_nawawi_fr.json')), true);
        $sample = collect($french)->firstWhere('hadith_number', 1);

        $this->assertNotNull($sample, 'Le fichier des traductions FR doit contenir le hadith 1.');

        Http::fake([
            '*/editions/ara-nawawi.json' => Http::response([
                'hadiths' => [
                    [
                        'hadithnumber' => 1,
                        'text' => 'عَنْ أَمِيرِ الْمُؤْمِنِينَ عُمَرَ بْنِ الْخَطَّابِ...',
                        'reference' => ['book' => 1, 'hadith' => 1],
                    ],
                ],
            ]),
            '*/editions/eng-nawawi.json' => Http::response([
                'hadiths' => [
                    [
                        'hadithnumber' => 1,
                        'text' => 'It is narrated on the authority of Umar bin al-Khattab...',
                        'reference' => ['book' => 1, 'hadith' => 1],
                    ],
                ],
            ]),
        ]);

        $this->artisan('mushaf:import-hadiths')->assertSuccessful();

        $hadith = Hadith::where('collection', 'nawawi')->where('hadith_number', 1)->first();

        $this->assertNotNull($hadith);
        $this->assertNotEmpty($hadith->text_ar);
        $this->assertStringContainsString('Umar', $hadith->text_en);
        $this->assertSame($sample['text_fr'], $hadith->text_fr);
        $this->assertSame($sample['narrator'], $hadith->narrator);
        $this->assertSame($sample['grade'], $hadith->grade);
    }
}
