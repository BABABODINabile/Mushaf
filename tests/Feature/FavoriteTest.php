<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FavoriteTest extends TestCase
{
    use RefreshDatabase;

    public function test_favorites_page_renders(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/favoris');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Favoris'));
    }

    public function test_favorites_requires_auth(): void
    {
        $response = $this->get('/favoris');

        $response->assertRedirect('/login');
    }

    public function test_api_favorites_list_requires_auth(): void
    {
        $response = $this->getJson('/api/favorites');

        $response->assertStatus(401);
    }

    public function test_api_favorites_toggle_requires_auth(): void
    {
        $response = $this->postJson('/api/favorites/toggle');

        $response->assertStatus(401);
    }
}
