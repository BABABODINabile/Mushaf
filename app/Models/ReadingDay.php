<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReadingDay extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'ayahs',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'ayahs' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
