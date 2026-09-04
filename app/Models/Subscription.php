<?php

namespace App\Models;

use Database\Factories\SubscriptionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Subscription extends Model
{
    /** @use HasFactory<SubscriptionFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'email',
        'frequency',
        'content_type',
        'language',
        'is_active',
        'token',
        'subscribed_at',
        'unsubscribed_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'subscribed_at' => 'datetime',
            'unsubscribed_at' => 'datetime',
        ];
    }

    /**
     * L'utilisateur associé (peut être null pour les abonnements par e-mail)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Générer un token unique pour le désabonnement
     */
    public static function generateToken(): string
    {
        return Str::random(64);
    }

    /**
     * Désabonner
     */
    public function unsubscribe(): void
    {
        $this->update([
            'is_active' => false,
            'unsubscribed_at' => now(),
        ]);
    }

    /**
     * Obtenir le contenu à envoyer (verset, hadith, ou alterné)
     */
    public function shouldSendVerse(): bool
    {
        return $this->content_type === 'verset' ||
               ($this->content_type === 'alterne' && now()->day % 2 === 0);
    }

    public function shouldSendHadith(): bool
    {
        return $this->content_type === 'hadith' ||
               ($this->content_type === 'alterne' && now()->day % 2 !== 0);
    }
}
