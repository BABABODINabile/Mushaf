<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HadithCollection extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name_ar',
        'name_en',
        'description_en',
        'total_hadiths',
        'is_authentic',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'total_hadiths' => 'integer',
            'is_authentic' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /**
     * Hadiths de cette collection
     */
    public function hadiths(): HasMany
    {
        return $this->hasMany(Hadith::class, 'collection', 'slug');
    }
}
