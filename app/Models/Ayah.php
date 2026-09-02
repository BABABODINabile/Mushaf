<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Ayah extends Model
{
    use HasFactory;

    protected $fillable = [
        'surah_id',
        'number_in_surah',
        'global_number',
        'text_ar',
        'text_fr',
        'text_en',
        'juz',
        'page',
    ];

    protected function casts(): array
    {
        return [
            'surah_id' => 'integer',
            'number_in_surah' => 'integer',
            'global_number' => 'integer',
            'juz' => 'integer',
            'page' => 'integer',
        ];
    }

    /**
     * La sourate de ce verset
     */
    public function surah(): BelongsTo
    {
        return $this->belongsTo(Surah::class);
    }

    /**
     * Favoris polymorphiques
     */
    public function favorites(): MorphMany
    {
        return $this->morphMany(Favorite::class, 'favable');
    }

    /**
     * Récupérer le texte traduit selon la langue choisie
     */
    public function getTranslatedText(string $lang = 'fr'): ?string
    {
        return match ($lang) {
            'fr' => $this->text_fr ?? $this->text_en,
            'en' => $this->text_en,
            'ar' => null, // L'arabe est toujours affiché séparément
            default => $this->text_fr ?? $this->text_en,
        };
    }
}
