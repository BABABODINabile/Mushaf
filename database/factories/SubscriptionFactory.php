<?php

namespace Database\Factories;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Subscription>
 */
class SubscriptionFactory extends Factory
{
    protected $model = Subscription::class;

    public function definition(): array
    {
        return [
            'user_id' => null,
            'email' => fake()->unique()->safeEmail(),
            'frequency' => fake()->randomElement(['daily', 'weekly']),
            'content_type' => fake()->randomElement(['verset', 'hadith', 'alterne']),
            'language' => fake()->randomElement(['fr', 'en', 'ar']),
            'is_active' => true,
            'token' => Str::random(64),
            'subscribed_at' => now(),
            'unsubscribed_at' => null,
        ];
    }

    public function forUser(User $user): static
    {
        return $this->state(fn () => [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn () => [
            'is_active' => false,
            'unsubscribed_at' => now(),
        ]);
    }
}
