<?php

namespace Database\Factories;

use App\Models\Ayah;
use App\Models\Surah;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Ayah>
 */
class AyahFactory extends Factory
{
    protected $model = Ayah::class;

    public function definition(): array
    {
        return [
            'surah_id' => Surah::factory(),
            'number_in_surah' => fake()->numberBetween(1, 286),
            'global_number' => fake()->unique()->numberBetween(1, 6236),
            'text_ar' => fake()->sentence(),
            'text_fr' => fake()->sentence(),
            'text_en' => fake()->sentence(),
            'juz' => fake()->numberBetween(1, 30),
            'page' => fake()->numberBetween(1, 604),
        ];
    }
}
