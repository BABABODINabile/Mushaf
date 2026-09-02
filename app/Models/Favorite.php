<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Favorite extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'favable_type',
        'favable_id',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    /**
     * L'utilisateur qui a ajouté ce favori
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Le favori polymorphique (ayah ou hadith)
     */
    public function favable(): MorphTo
    {
        return $this->morphTo();
    }
}
