<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PushNotification extends Model
{
    protected $table = 'notifications_push';

    protected $fillable = [
        'user_id',
        'endpoint',
        'keys_json',
    ];

    protected function casts(): array
    {
        return [
            'keys_json' => 'array',
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
     * Obtenir la clé p256dh
     */
    public function getP256dhKey(): ?string
    {
        return $this->keys_json['p256dh'] ?? null;
    }

    /**
     * Obtenir la clé auth
     */
    public function getAuthKey(): ?string
    {
        return $this->keys_json['auth'] ?? null;
    }
}
