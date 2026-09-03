<?php

namespace Database\Factories;

use App\Models\Hadith;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Hadith>
 */
class HadithFactory extends Factory
{
    protected $model = Hadith::class;

    public function definition(): array
    {
        return [
            'collection' => fake()->randomElement(['riyad-as-salihin', 'bukhari', 'muslim']),
            'hadith_number' => fake()->unique()->numberBetween(1, 1000),
            'title' => fake()->sentence(),
            'text_ar' => fake()->sentence(),
            'text_en' => fake()->sentence(),
            'text_fr' => fake()->sentence(),
            'grade' => fake()->randomElement(['Sahih', 'Hasan', 'Daif', null]),
            'narrator' => fake()->name(),
            'url_source' => fake()->optional()->url(),
            'is_featured' => false,
            'book_number' => fake()->optional()->numberBetween(1, 10),
            'book_name_ar' => fake()->optional()->word(),
            'book_name_en' => fake()->optional()->word(),
            'chapter_number' => fake()->optional()->numberBetween(1, 50),
            'chapter_name_ar' => fake()->optional()->word(),
            'chapter_name_en' => fake()->optional()->word(),
        ];
    }
}
