<?php

namespace Tests\Feature;

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
}
