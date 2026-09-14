<?php

use App\Http\Middleware\AdminOnly;
use App\Http\Middleware\EnsureUserIsActive;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\TrackActivity;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Derrière le reverse-proxy Nginx hôte (schémas https corrects dans les URLs)
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            EnsureUserIsActive::class,
            TrackActivity::class,
            HandleInertiaRequests::class,
        ]);

        // Redirection explicite après authentification / pour les invités
        $middleware->redirectUsersTo(fn (Request $request) => route('accueil'));
        $middleware->redirectGuestsTo(fn (Request $request) => route('login'));

        $middleware->alias([
            'admin' => AdminOnly::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
