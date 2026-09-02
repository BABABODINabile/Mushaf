<?php

namespace Database\Factories;

use App\Models\Surah;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Surah>
 */
class SurahFactory extends Factory
{
    protected $model = Surah::class;

    public function definition(): array
    {
        return [
            'number' => fake()->unique()->numberBetween(115, 10114),
            'name_ar' => fake()->word(),
            'name_en' => fake()->word(),
            'name_fr' => fake()->word(),
            'revelation_type' => fake()->randomElement(['Meccan', 'Medinan']),
            'ayah_count' => fake()->numberBetween(3, 286),
        ];
    }
}
