<?php

namespace App\Http\Controllers;

use App\Models\Ayah;
use App\Models\Hadith;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ShareController extends Controller
{
    /**
     * Page de partage avec liens sociaux
     */
    public function show(string $type, int $id)
    {
        $item = null;
        $title = '';
        $textAr = '';
        $textTranslation = '';
        $reference = '';
        $narrator = '';
        $url = url()->current();

        if ($type === 'ayah') {
            $ayah = Ayah::with('surah')->find($id);
            if (! $ayah) {
                abort(404);
            }

            $item = $ayah;
            $textAr = $ayah->text_ar;
            $reference = "Sourate {$ayah->surah->number} ({$ayah->surah->name_fr}), verset {$ayah->number_in_surah}";

            // Traduction selon la langue
            $textTranslation = $ayah->text_fr ?? $ayah->text_en ?? '';
            $title = "Mushaf — {$reference}";
        } elseif ($type === 'hadith') {
            $hadith = Hadith::find($id);
            if (! $hadith) {
                abort(404);
            }

            $item = $hadith;
            $textAr = $hadith->text_ar;
            $textTranslation = $hadith->text_fr ?? $hadith->text_en ?? '';
            $reference = "Hadith n°{$hadith->hadith_number} — An-Nawawi";
            $title = "Mushaf — {$reference}";
            $narrator = $hadith->narrator ?? '';
        } else {
            abort(404);
        }

        // Texte tronqué pour les réseaux sociaux
        $shareText = Str::limit(strip_tags($textTranslation), 200);
        $shareTextFull = "{$textAr}\n\n« {$shareText} »\n\n— {$reference}";

        // URLs de partage
        $twitterUrl = 'https://twitter.com/intent/tweet?text='.urlencode($shareTextFull).'&url='.urlencode($url);
        $facebookUrl = 'https://www.facebook.com/sharer/sharer.php?u='.urlencode($url);
        $whatsappUrl = 'https://wa.me/?text='.urlencode($shareTextFull.' '.$url);

        return Inertia::render('Share', [
            'type' => $type,
            'title' => $title,
            'textAr' => $textAr,
            'textTranslation' => $textTranslation,
            'reference' => $reference,
            'url' => $url,
            'twitterUrl' => $twitterUrl,
            'facebookUrl' => $facebookUrl,
            'whatsappUrl' => $whatsappUrl,
            'narrator' => $narrator ?? '',
            'text_fr' => $item?->text_fr ?? '',
            'text_en' => $item?->text_en ?? '',
            'surah_name_fr' => $type === 'ayah' ? ($item->surah->name_fr ?? '') : '',
            'surah_name_en' => $type === 'ayah' ? ($item->surah->name_en ?? '') : '',
            'surah_name_ar' => $type === 'ayah' ? ($item->surah->name_ar ?? '') : '',
        ]);
    }
}
