<?php

namespace Tests\Feature;

use App\Models\Subscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionTest extends TestCase
{
    use RefreshDatabase;

    public function test_rappels_page_renders(): void
    {
        $response = $this->get('/rappels');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Rappels'));
    }

    public function test_user_can_subscribe(): void
    {
        $response = $this->postJson('/rappels/subscribe', [
            'email' => 'subscriber@example.com',
            'frequency' => 'daily',
            'content_type' => 'verset',
            'language' => 'fr',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('subscriptions', [
            'email' => 'subscriber@example.com',
            'is_active' => true,
        ]);
    }

    public function test_duplicate_subscription_returns_already_subscribed(): void
    {
        $this->postJson('/rappels/subscribe', [
            'email' => 'subscriber@example.com',
            'frequency' => 'daily',
            'content_type' => 'verset',
            'language' => 'fr',
        ]);

        $response = $this->postJson('/rappels/subscribe', [
            'email' => 'subscriber@example.com',
            'frequency' => 'daily',
            'content_type' => 'verset',
            'language' => 'fr',
        ]);

        $response->assertOk();
    }

    public function test_unsubscribe_with_valid_token(): void
    {
        $subscription = Subscription::factory()->create([
            'token' => 'valid-token-123',
        ]);

        $response = $this->get('/rappels/unsubscribe/valid-token-123');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Unsubscribed'));
    }
}
