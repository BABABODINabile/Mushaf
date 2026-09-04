<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    /**
     * Page d'abonnement aux rappels
     */
    public function index()
    {
        return Inertia::render('Rappels');
    }

    /**
     * Enregistrer un abonnement
     */
    public function subscribe(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'frequency' => 'required|in:daily,weekly',
            'content_type' => 'required|in:verset,hadith,alterne',
            'language' => 'required|in:fr,en,ar',
        ]);

        // Vérifier si déjà abonné
        $existing = Subscription::where('email', $request->email)
            ->where('is_active', true)
            ->first();

        if ($existing) {
            return response()->json([
                'status' => 'already_subscribed',
                'message' => 'Vous êtes déjà abonné avec cette adresse e-mail.',
            ]);
        }

        // Créer l'abonnement
        Subscription::create([
            'user_id' => auth()->id(),
            'email' => $request->email,
            'frequency' => $request->frequency,
            'content_type' => $request->content_type,
            'language' => $request->language,
            'token' => Subscription::generateToken(),
            'subscribed_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Inscription enregistrée ! Vous recevrez un rappel '.
                         ($request->frequency === 'daily' ? 'quotidien' : 'hebdomadaire').
                         ' contenant un '.
                         ($request->content_type === 'verset' ? 'verset' : ($request->content_type === 'hadith' ? 'hadith' : 'contenu alterné')).'.',
        ]);
    }

    /**
     * Désabonnement via lien unique
     */
    public function unsubscribe(string $token)
    {
        $subscription = Subscription::where('token', $token)
            ->where('is_active', true)
            ->firstOrFail();

        $subscription->unsubscribe();

        return Inertia::render('Unsubscribed');
    }
}
