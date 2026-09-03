<?php

namespace Tests\Unit;

use App\Services\AudioService;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AudioServiceTest extends TestCase
{
    private AudioService $audioService;

    private string $r2PublicUrl;

    protected function setUp(): void
    {
        parent::setUp();

        config(['reciters.default' => 'husary']);
        config(['reciters.reciters' => [
            'husary' => [
                'id' => 'husary',
                'name' => 'Husary',
                'name_ar' => 'محمود خليل الحصري',
                'mualim_slug' => 'mahmoud-khalil-al-husary-mujawwad',
                'bitrate' => 32,
                'format' => 'opus',
            ],
            'sudais' => [
                'id' => 'sudais',
                'name' => 'Sudais',
                'name_ar' => 'عبدالرحمن السديس',
                'mualim_slug' => 'abdul-rahman-al-sudais-murattal',
                'bitrate' => 32,
                'format' => 'opus',
            ],
            'salah-ba-othman' => [
                'id' => 'salah-ba-othman',
                'name' => 'Salah Ba Othman',
                'name_ar' => 'صلاح باعثمان',
                'archive_org_item' => 'HaramainBaUthman',
                'bitrate' => 128,
                'format' => 'mp3',
            ],
        ]]);

        config(['services.r2.public_url' => 'https://pub-0b9b87a2f28045258beb724262d31dde.r2.dev']);

        $this->r2PublicUrl = config('services.r2.public_url');

        $this->audioService = new AudioService;
    }

    #[Test]
    public function get_surah_url_returns_correct_r2_url(): void
    {
        $url = $this->audioService->getSurahUrl('husary', 1);

        $this->assertEquals(
            $this->r2PublicUrl.'/husary/001.opus',
            $url
        );
    }

    #[Test]
    public function get_surah_url_pads_number_to_three_digits(): void
    {
        $url = $this->audioService->getSurahUrl('husary', 114);

        $this->assertEquals(
            $this->r2PublicUrl.'/husary/114.opus',
            $url
        );
    }

    #[Test]
    public function get_surah_url_uses_correct_reciter_id(): void
    {
        $url = $this->audioService->getSurahUrl('sudais', 1);

        $this->assertEquals(
            $this->r2PublicUrl.'/sudais/001.opus',
            $url
        );
    }

    #[Test]
    public function get_surah_url_returns_null_for_unknown_reciter(): void
    {
        $url = $this->audioService->getSurahUrl('nonexistent', 1);

        $this->assertNull($url);
    }

    #[Test]
    public function get_surah_url_returns_opus_extension_for_default_reciter(): void
    {
        $url = $this->audioService->getSurahUrl('husary', 1);

        $this->assertStringEndsWith('.opus', $url);
    }

    #[Test]
    public function get_surah_url_returns_mp3_extension_for_salah_ba_othman(): void
    {
        $url = $this->audioService->getSurahUrl('salah-ba-othman', 1);

        $this->assertEquals(
            $this->r2PublicUrl.'/salah-ba-othman/001.mp3',
            $url
        );
        $this->assertStringEndsWith('.mp3', $url);
    }

    #[Test]
    public function get_reciter_returns_reciter_by_id(): void
    {
        $reciter = $this->audioService->getReciter('husary');

        $this->assertNotNull($reciter);
        $this->assertEquals('Husary', $reciter['name']);
        $this->assertEquals('mahmoud-khalil-al-husary-mujawwad', $reciter['mualim_slug']);
    }

    #[Test]
    public function get_reciter_is_case_insensitive(): void
    {
        $reciter = $this->audioService->getReciter('Husary');

        $this->assertNotNull($reciter);
        $this->assertEquals('husary', $reciter['id']);
    }

    #[Test]
    public function get_reciter_returns_null_for_unknown_id(): void
    {
        $reciter = $this->audioService->getReciter('nonexistent');

        $this->assertNull($reciter);
    }

    #[Test]
    public function get_reciter_defaults_to_configured_default(): void
    {
        $reciter = $this->audioService->getReciter();

        $this->assertNotNull($reciter);
        $this->assertEquals('husary', $reciter['id']);
    }

    #[Test]
    public function default_reciter_returns_husary(): void
    {
        $reciter = $this->audioService->defaultReciter();

        $this->assertEquals('husary', $reciter['id']);
        $this->assertEquals('Husary', $reciter['name']);
    }

    #[Test]
    public function reciters_returns_all_reciters(): void
    {
        $reciters = $this->audioService->reciters();

        $this->assertCount(3, $reciters);
        $this->assertArrayHasKey('id', $reciters[0]);
    }

    #[Test]
    public function reciter_has_format_field(): void
    {
        $reciter = $this->audioService->getReciter('husary');

        $this->assertArrayHasKey('format', $reciter);
        $this->assertEquals('opus', $reciter['format']);
    }

    #[Test]
    public function salah_ba_othman_has_mp3_format(): void
    {
        $reciter = $this->audioService->getReciter('salah-ba-othman');

        $this->assertNotNull($reciter);
        $this->assertEquals('mp3', $reciter['format']);
        $this->assertEquals('HaramainBaUthman', $reciter['archive_org_item']);
    }
}
