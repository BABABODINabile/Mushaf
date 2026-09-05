<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StatsDaily extends Model
{
    protected $table = 'stats_daily';

    protected $fillable = [
        'date',
        'users_total',
        'users_online',
        'inscriptions',
        'abonnes_actifs',
        'pages_vues',
        'visiteurs_uniques',
        'ayahs_read',
        'favorites_added',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }
}
