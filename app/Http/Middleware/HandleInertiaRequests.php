<?php

namespace App\Http\Middleware;

use App\Services\AudioService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'is_admin' => (bool) $request->user()->is_admin,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                // Clé unique par redirection avec message : le front n'affiche chaque
                // flash qu'une fois (StrictMode rejoue les effets en dev) et ré-affiche
                // un même message répété par deux actions successives.
                'key' => fn () => ($request->session()->get('success') || $request->session()->get('error'))
                    ? Str::uuid()->toString()
                    : null,
            ],
            'reciters' => (new AudioService)->reciters(),
            'defaultReciter' => (new AudioService)->defaultReciter()['id'] ?? 'husary',
            'r2PublicUrl' => config('services.r2.public_url'),
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
        ];
    }
}
