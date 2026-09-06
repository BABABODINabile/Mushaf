<?php

namespace App\Http\Controllers;

use App\Models\Ayah;
use App\Models\Favorite;
use App\Models\Hadith;
use App\Models\PageView;
use App\Models\StatsDaily;
use App\Models\Subscription;
use App\Models\Surah;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminController extends Controller
{
    /**
     * Dashboard principal — stats globales + KPIs + charts
     */
    public function index()
    {
        // ── KPIs globaux ──
        $stats = [
            'users' => User::count(),
            'users_online' => User::where('last_seen_at', '>', now()->subMinutes(30))->count(),
            'subscriptions' => Subscription::where('is_active', true)->count(),
            'favorites' => Favorite::count(),
            'ayahs' => Ayah::count(),
            'surahs' => Surah::count(),
            'hadiths' => Hadith::count(),
        ];

        // ── Tendances (comparaison 7j vs 7j précédents) ──
        $thisWeek = now()->subDays(7);
        $lastWeek = now()->subDays(14);

        $trends = [
            'users_delta' => User::where('created_at', '>=', $thisWeek)->count()
                - User::whereBetween('created_at', [$lastWeek, $thisWeek])->count(),
            'subs_delta' => Subscription::where('is_active', true)
                ->where('subscribed_at', '>=', $thisWeek)->count()
                - Subscription::where('is_active', true)
                    ->whereBetween('subscribed_at', [$lastWeek, $thisWeek])->count(),
            'favorites_delta' => Favorite::where('created_at', '>=', $thisWeek)->count()
                - Favorite::where('created_at', '>=', $lastWeek)
                    ->where('created_at', '<', $thisWeek)->count(),
            'pv_delta' => StatsDaily::where('date', '>=', $thisWeek->toDateString())->sum('pages_vues')
                - StatsDaily::whereBetween('date', [$lastWeek->toDateString(), $thisWeek->toDateString()])->sum('pages_vues'),
        ];

        // ── Stats des 30 derniers jours ──
        $chartData = StatsDaily::where('date', '>=', now()->subDays(30))
            ->orderBy('date')
            ->get(['date', 'users_total', 'pages_vues', 'visiteurs_uniques', 'inscriptions', 'abonnes_actifs']);

        // Stats d'aujourd'hui (temps réel)
        $todayPagesVues = (int) Cache::get('pv:'.now()->toDateString(), 0);

        // ── Top pages (7 derniers jours) ──
        $topPages = PageView::where('created_at', '>=', now()->subDays(7))
            ->select('path', DB::raw('COUNT(*) as views'), DB::raw('COUNT(DISTINCT ip_address) as unique_visitors'))
            ->groupBy('path')
            ->orderByDesc('views')
            ->limit(8)
            ->get();

        // ── Dernière activité (page views récentes) ──
        $recentActivity = PageView::where('created_at', '>=', now()->subHours(24))
            ->orderByDesc('created_at')
            ->limit(15)
            ->get(['path', 'ip_address', 'created_at']);

        // ── Répartition des inscriptions (email vs Google) ──
        $emailCount = User::whereNotNull('password')->count();
        $googleCount = User::whereNotNull('google_id')->count();
        $totalUsers = $emailCount + $googleCount;

        // ── Répartition des abonnements ──
        $dailySubs = Subscription::where('is_active', true)->where('frequency', 'daily')->count();
        $weeklySubs = Subscription::where('is_active', true)->where('frequency', 'weekly')->count();
        $totalSubs = $dailySubs + $weeklySubs;

        $verseSubs = Subscription::where('is_active', true)->where('content_type', 'verset')->count();
        $hadithSubs = Subscription::where('is_active', true)->where('content_type', 'hadith')->count();
        $alterneSubs = Subscription::where('is_active', true)->where('content_type', 'alterne')->count();

        // ── Derniers inscrits ──
        $recentUsers = User::orderByDesc('created_at')
            ->limit(8)
            ->get(['id', 'name', 'email', 'created_at', 'last_seen_at', 'is_admin']);

        // ── Derniers abonnements ──
        $recentSubs = Subscription::where('is_active', true)
            ->orderByDesc('subscribed_at')
            ->limit(8)
            ->get();

        // ── Inscriptions par jour de la semaine (7 derniers jours) ──
        // Tableau indexé 0-6 (dim-sam) pour que le chart JS puisse faire .map()
        $weeklySignups = collect();
        $usersThisWeek = User::where('created_at', '>=', now()->subDays(7))
            ->get()
            ->groupBy(fn ($user) => $user->created_at->dayOfWeek);
        for ($day = 0; $day < 7; $day++) {
            $weeklySignups[$day] = isset($usersThisWeek[$day]) ? $usersThisWeek[$day]->count() : 0;
        }
        $weeklySignups = $weeklySignups->values()->toArray();

        return Inertia::render('Admin/Dashboard', compact(
            'stats', 'trends', 'recentUsers', 'recentSubs', 'chartData',
            'todayPagesVues', 'topPages', 'recentActivity',
            'emailCount', 'googleCount', 'totalUsers',
            'dailySubs', 'weeklySubs', 'totalSubs',
            'verseSubs', 'hadithSubs', 'alterneSubs',
            'weeklySignups'
        ));
    }

    /**
     * API : stats pour le dashboard (AJAX refresh)
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            'users' => User::count(),
            'users_online' => User::where('last_seen_at', '>', now()->subMinutes(30))->count(),
            'subscriptions' => Subscription::where('is_active', true)->count(),
            'favorites' => Favorite::count(),
        ]);
    }

    /**
     * Liste des utilisateurs
     */
    public function users(Request $request)
    {
        $users = User::orderByDesc('created_at')
            ->withCount(['favorites', 'subscriptions'])
            ->paginate(20);

        return Inertia::render('Admin/Users', compact('users'));
    }

    /**
     * Activer / désactiver un utilisateur
     */
    public function toggleUser(User $user, Request $request)
    {
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'Vous ne pouvez pas désactiver votre propre compte.');
        }

        $user->update(['is_active' => ! $user->is_active]);

        $message = $user->is_active
            ? "Compte de {$user->name} réactivé."
            : "Compte de {$user->name} désactivé.";

        return redirect()->route('admin.users')
            ->with('success', $message);
    }
}
