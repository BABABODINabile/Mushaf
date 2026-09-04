<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReadingHistory extends Model
{
    protected $table = 'reading_history';

    protected $fillable = [
        'user_id',
        'surah_id',
        'last_ayah',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
        ];
    }

    /**
     * L'utilisateur
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * La sourate lue
     */
    public function surah(): BelongsTo
    {
        return $this->belongsTo(Surah::class);
    }

    /**
     * Mettre à jour la progression de lecture
     */
    public function updateProgress(int $ayahNumber): void
    {
        $this->update([
            'last_ayah' => $ayahNumber,
            'read_at' => now(),
        ]);
    }
}
