<?php

namespace App\Http\Middleware;

use App\Models\PageView;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class TrackActivity
{
    /**
     * Pages à exclure du tracking (assets, API, etc.)
     */
    protected array $excludePaths = [
        'css', 'js', 'images', 'icons', 'build',
        'api', 'admin', 'storage', 'favicon.ico',
        'manifest.json', 'sw.js',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Ne track que les requêtes GET sur des pages HTML
        if (! $request->isMethod('GET') || $request->expectsJson()) {
            return $response;
        }

        $path = $request->path();

        // Exclure les chemins techniques
        foreach ($this->excludePaths as $exclude) {
            if (str_starts_with($path, $exclude)) {
                return $response;
            }
        }

        // Mettre à jour last_seen_at de l'utilisateur connecté (1×/min)
        if ($user = $request->user()) {
            if (is_null($user->last_seen_at) || $user->last_seen_at->lt(now()->subMinute())) {
                $user->update(['last_seen_at' => now()]);
            }
        }

        // Incrémenter le compteur quotidien (cache, pas d'INSERT à chaque fois)
        Cache::increment('pv:'.now()->toDateString());

        // Enregistrer le page_view en DB (échantillonnage : 1 sur 5)
        if (rand(1, 5) === 1) {
            try {
                PageView::create([
                    'user_id' => $user?->id,
                    'path' => $path,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'created_at' => now(),
                ]);
            } catch (\Exception $e) {
                // Silencieux — ne pas casser la requête
            }
        }

        return $response;
    }
}
