<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    /**
     * Rediriger vers Google pour l'authentification.
     */
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Gérer le callback de Google après authentification.
     */
    public function handleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Chercher ou créer l'utilisateur
            $user = User::updateOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'name' => $googleUser->getName(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'password' => null,
                    'last_seen_at' => now(),
                ]
            );

            // Mettre à jour last_seen_at pour les utilisateurs existants
            $user->update(['last_seen_at' => now()]);

            // Bloquer les comptes désactivés
            if (! $user->is_active) {
                return redirect()->route('login')
                    ->with('error', 'Ce compte a été désactivé. Contactez l\'administrateur.');
            }

            // Connexion
            Auth::login($user);

            return redirect()->intended(route('accueil'));

        } catch (\Exception $e) {
            return redirect()->route('login')
                ->with('error', 'Une erreur est survenue lors de la connexion avec Google.');
        }
    }
}
