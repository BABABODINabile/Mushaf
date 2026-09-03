<?php

namespace Database\Factories;

use App\Models\HadithCollection;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HadithCollection>
 */
class HadithCollectionFactory extends Factory
{
    protected $model = HadithCollection::class;

    public function definition(): array
    {
        $slug = fake()->unique()->slug(3);

        return [
            'slug' => $slug,
            'name_ar' => fake()->word(),
            'name_en' => fake()->word(),
            'description_en' => fake()->optional()->sentence(),
            'total_hadiths' => fake()->numberBetween(0, 500),
            'is_authentic' => fake()->boolean(80),
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }
}
