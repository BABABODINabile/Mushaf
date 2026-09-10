<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Surah extends Model
{
    use HasFactory;

    protected $fillable = [
        'number', 'slug', 'name_ar', 'name_en', 'name_fr',
        'revelation_type', 'ayah_count',
    ];

    protected function casts(): array
    {
        return [
            'number' => 'integer',
            'ayah_count' => 'integer',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Versets de cette sourate
     */
    public function ayahs(): HasMany
    {
        return $this->hasMany(Ayah::class);
    }

    /**
     * Historique de lecture pour cette sourate
     */
    public function readingHistory(): HasMany
    {
        return $this->hasMany(ReadingHistory::class);
    }

    /**
     * Historique d'écoute pour cette sourate
     */
    public function audioHistory(): HasMany
    {
        return $this->hasMany(AudioHistory::class);
    }

    /**
     * Vérifier si c'est la sourate At-Tawba (pas de Basmala)
     */
    public function isAtTawba(): bool
    {
        return $this->number === 9;
    }

    /**
     * Vérifier si la sourate commence par la Basmala (sauf At-Tawba)
     */
    public function hasBasmala(): bool
    {
        return $this->number !== 9;
    }
}
