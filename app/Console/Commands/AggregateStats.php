<?php

namespace App\Console\Commands;

use App\Models\Favorite;
use App\Models\PageView;
use App\Models\ReadingDay;
use App\Models\StatsDaily;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class AggregateStats extends Command
{
    protected $signature = 'mushaf:aggregate-stats {--days=90 : Supprimer les page_views plus anciennes}';

    protected $description = 'Agrégier les statistiques quotidiennes et nettoyer les anciennes données';

    public function handle(): int
    {
        $date = now()->toDateString();

        $this->info("📊 Mushaf — Agrégation des stats du {$date}");
        $this->newLine();

        // ── Collecte des données ──
        $usersTotal = User::count();
        $usersOnline = User::where('last_seen_at', '>', now()->subMinutes(30))->count();
        $inscriptions = User::whereDate('created_at', $date)->count();
        $abonnes = Subscription::where('is_active', true)->count();

        // Pages vues : compteur cache + échantillon DB
        $pvCache = (int) Cache::pull("pv:{$date}", 0);
        $pvSample = PageView::whereDate('created_at', $date)->count();
        // Estimer le total : cache * 5 (échantillonnage 1/5) + sample pour les dernières
        $pagesVues = ($pvCache * 5) + $pvSample;

        // Visiteurs uniques (estimation basée sur les IP distinctes de l'échantillon)
        $visiteursUniques = PageView::whereDate('created_at', $date)
            ->distinct()
            ->count('ip_address');

        // Favoris ajoutés aujourd'hui
        $favoritesAdded = Favorite::whereDate('created_at', $date)->count();

        // Versets lus aujourd'hui
        $ayahsRead = ReadingDay::whereDate('date', $date)->sum('ayahs');

        // ── Affichage ──
        $this->table(
            ['Métrique', 'Valeur'],
            [
                ['Total users', $usersTotal],
                ['Users en ligne (30min)', $usersOnline],
                ['Inscriptions aujourd\'hui', $inscriptions],
                ['Abonnés actifs', $abonnes],
                ['Pages vues (estimé)', number_format($pagesVues)],
                ['Visiteurs uniques (estimé)', number_format($visiteursUniques)],
                ['Favoris ajoutés', $favoritesAdded],
                ['Versets lus', $ayahsRead],
            ]
        );
        $this->newLine();

        // ── Sauvegarde en base ──
        StatsDaily::updateOrCreate(
            ['date' => $date],
            [
                'users_total' => $usersTotal,
                'users_online' => $usersOnline,
                'inscriptions' => $inscriptions,
                'abonnes_actifs' => $abonnes,
                'pages_vues' => $pagesVues,
                'visiteurs_uniques' => $visiteursUniques,
                'favorites_added' => $favoritesAdded,
                'ayahs_read' => $ayahsRead,
            ]
        );

        $this->info('✅ Stats du jour sauvegardées en base.');

        // ── Nettoyage des anciennes page_views ──
        $days = (int) $this->option('days');
        $deleted = PageView::where('created_at', '<', now()->subDays($days))->delete();

        if ($deleted > 0) {
            $this->info("🗑  {$deleted} page_views supprimées (> {$days} jours).");
        }

        // Purger les counters cache de plus de 2 jours
        for ($i = 2; $i <= 7; $i++) {
            $oldDate = now()->subDays($i)->toDateString();
            Cache::forget("pv:{$oldDate}");
        }

        return Command::SUCCESS;
    }
}
