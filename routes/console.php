<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ─────────────────────────────────────────────
// Mushaf — Scheduler
// ─────────────────────────────────────────────

// Envoi des rappels quotidiens à 7h00 chaque jour
Schedule::command('mushaf:send-reminders')->dailyAt('07:00');

// Agrégation des stats quotidiennes à 23h55 chaque jour
Schedule::command('mushaf:aggregate-stats')->dailyAt('23:55');

// Nettoyage des jobs échoués une fois par semaine (lundi à 3h)
Schedule::command('queue:prune-failed --hours=168')->weekly();
