<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AudioHistory extends Model
{
    protected $table = 'audio_history';

    protected $fillable = [
        'user_id',
        'surah_id',
        'reciter_id',
        'position_seconds',
        'duration_seconds',
        'listened_at',
    ];

    protected function casts(): array
    {
        return [
            'position_seconds' => 'integer',
            'duration_seconds' => 'integer',
            'listened_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function surah(): BelongsTo
    {
        return $this->belongsTo(Surah::class);
    }

    /**
     * Mettre à jour la progression d'écoute d'une sourate.
     */
    public static function record(int $userId, int $surahId, array $data = []): void
    {
        self::updateOrCreate(
            ['user_id' => $userId, 'surah_id' => $surahId],
            array_merge([
                'position_seconds' => 0,
                'duration_seconds' => 0,
                'listened_at' => now(),
            ], $data)
        );
    }
}
