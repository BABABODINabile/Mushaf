<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Hadith extends Model
{
    use HasFactory;

    protected $fillable = [
        'collection',
        'book_number', 'book_name_ar', 'book_name_en',
        'chapter_number', 'chapter_name_ar', 'chapter_name_en',
        'hadith_number', 'title',
        'text_ar', 'text_en', 'text_fr',
        'grade', 'graded_by',
        'narrator', 'url_source', 'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'book_number' => 'integer',
            'chapter_number' => 'integer',
            'hadith_number' => 'integer',
            'is_featured' => 'boolean',
        ];
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
            'ar' => null,
            default => $this->text_fr ?? $this->text_en,
        };
    }

    /**
     * Obtenir une référence abrégée du hadith
     */
    public function getShortReference(): string
    {
        return "An-Nawawi n°{$this->hadith_number}";
    }
}
