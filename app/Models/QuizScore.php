<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizScore extends Model
{
    protected $fillable = [
        'user_id',
        'total_questions',
        'correct_answers',
        'duration_seconds',
    ];

    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'total_questions' => 'integer',
            'correct_answers' => 'integer',
            'duration_seconds' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function percentage(): int
    {
        return $this->total_questions > 0
            ? (int) round(($this->correct_answers / $this->total_questions) * 100)
            : 0;
    }
}
