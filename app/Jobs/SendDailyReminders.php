<?php

namespace App\Jobs;

use App\Mail\ReminderMail;
use App\Models\Hadith;
use App\Models\Subscription;
use App\Services\DailyContent;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;

class SendDailyReminders
{
    public function handle(): void
    {
        $today = now();

        // Récupérer tous les abonnements actifs
        $subscriptions = Subscription::where('is_active', true)
            ->whereNotNull('email')
            ->get();

        foreach ($subscriptions as $sub) {
            // Vérifier si c'est le bon jour pour cet abonnement
            if (! $this->shouldSendToday($sub, $today)) {
                continue;
            }

            // Déterminer le type de contenu à envoyer
            $contentType = $this->resolveContentType($sub);

            // Récupérer le contenu
            $content = $this->fetchContent($contentType, $sub->language);

            if (! $content) {
                continue; // Pas de contenu disponible, on saute
            }

            // Envoyer l'email
            try {
                Mail::to($sub->email)->send(
                    new ReminderMail($sub, $contentType, $content)
                );
            } catch (\Throwable $e) {
                \Log::warning("Échec d'envoi du rappel à {$sub->email}: {$e->getMessage()}");
            }
        }
    }

    /**
     * Déterminer si l'abonnement doit recevoir un mail aujourd'hui.
     */
    private function shouldSendToday(Subscription $sub, Carbon $today): bool
    {
        if ($sub->frequency === 'daily') {
            return true;
        }

        // Hebdomadaire : envoyer le lundi
        return $today->isMonday();
    }

    /**
     * Déterminer le type de contenu (verset ou hadith) selon la préférence et le jour.
     */
    private function resolveContentType(Subscription $sub): string
    {
        return match ($sub->content_type) {
            'verset' => 'verset',
            'hadith' => 'hadith',
            'alterne' => now()->day % 2 === 0 ? 'verset' : 'hadith',
            default => 'verset',
        };
    }

    /**
     * Récupérer un contenu aléatoire (verset ou hadith) selon la langue.
     */
    private function fetchContent(string $type, string $lang): ?array
    {
        if ($type === 'verset') {
            return $this->fetchVerse($lang);
        }

        return $this->fetchHadith($lang);
    }

    /**
     * Récupérer le verset du jour (liste partagée avec le site).
     */
    private function fetchVerse(string $lang): ?array
    {
        $ayah = DailyContent::todayAyah();

        if (! $ayah) {
            return null;
        }

        $translation = match ($lang) {
            'en' => $ayah->text_en ?? $ayah->text_fr,
            'ar' => null,
            default => $ayah->text_fr ?? $ayah->text_en,
        };

        return [
            'text_ar' => $ayah->text_ar,
            'translation' => $translation,
            'ref' => "Sourate {$ayah->surah->number} ({$ayah->surah->name_ar} — {$ayah->surah->name_fr}), verset {$ayah->number_in_surah}",
        ];
    }

    /**
     * Récupérer un hadith aléatoire d'An-Nawawi.
     */
    private function fetchHadith(string $lang): ?array
    {
        $hadith = Hadith::where('collection', 'nawawi')
            ->inRandomOrder()
            ->first();

        if (! $hadith) {
            return null;
        }

        $translation = match ($lang) {
            'en' => $hadith->text_en ?? $hadith->text_fr,
            'ar' => null,
            default => $hadith->text_fr ?? $hadith->text_en,
        };

        return [
            'text_ar' => $hadith->text_ar,
            'translation' => $translation,
            'ref' => $hadith->getShortReference(),
            'narrator' => $hadith->narrator,
            'title' => $hadith->title,
        ];
    }
}
