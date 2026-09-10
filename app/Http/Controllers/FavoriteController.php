<?php

namespace App\Http\Controllers;

use App\Models\Ayah;
use App\Models\Favorite;
use App\Models\Hadith;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FavoriteController extends Controller
{
    /**
     * Page des favoris (auth requis)
     */
    public function index()
    {
        $user = auth()->user();

        $favorites = Favorite::where('user_id', $user->id)
            ->with('favable')
            ->orderBy('created_at', 'desc')
            ->get();

        $ayahs = $favorites->where('favable_type', Ayah::class)->map(fn ($f) => $f->favable);
        $hadiths = $favorites->where('favable_type', Hadith::class)->map(fn ($f) => $f->favable);

        return Inertia::render('Favoris', [
            'ayahs' => $ayahs->map(fn ($ayah) => [
                'id' => $ayah->id,
                'text_ar' => $ayah->text_ar,
                'text_fr' => $ayah->text_fr,
                'text_en' => $ayah->text_en,
                'number_in_surah' => $ayah->number_in_surah,
                'surah' => [
                    'number' => $ayah->surah->number,
                    'slug' => $ayah->surah->slug,
                    'name_fr' => $ayah->surah->name_fr,
                    'name_en' => $ayah->surah->name_en,
                    'name_ar' => $ayah->surah->name_ar,
                ],
            ]),
            'hadiths' => $hadiths->map(fn ($hadith) => [
                'id' => $hadith->id,
                'hadith_number' => $hadith->hadith_number,
                'title' => $hadith->title,
                'text_ar' => $hadith->text_ar,
                'text_fr' => $hadith->text_fr,
                'text_en' => $hadith->text_en,
                'narrator' => $hadith->narrator,
            ]),
        ]);
    }

    /**
     * API : Liste des favoris de l'utilisateur (auth requis)
     */
    public function list(): JsonResponse
    {
        $user = auth()->user();

        $favorites = Favorite::where('user_id', $user->id)->get();

        $ayahs = [];
        $hadiths = [];

        foreach ($favorites as $fav) {
            if ($fav->favable_type === Ayah::class) {
                $surahNumber = \DB::table('surahs')
                    ->join('ayahs', 'ayahs.surah_id', '=', 'surahs.id')
                    ->where('ayahs.id', $fav->favable_id)
                    ->value('surahs.number');

                $ayahNumber = \DB::table('ayahs')->where('id', $fav->favable_id)->value('number_in_surah');

                if ($surahNumber && $ayahNumber) {
                    $ayahs[] = "{$surahNumber}:{$ayahNumber}";
                }
            } elseif ($fav->favable_type === Hadith::class) {
                $hadiths[] = (int) $fav->favable_id;
            }
        }

        return response()->json([
            'ayahs' => $ayahs,
            'hadiths' => $hadiths,
        ]);
    }

    /**
     * API : Toggle un favori (AJAX)
     */
    public function toggle(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:ayah,hadith',
            'id' => 'required',
        ]);

        $user = auth()->user();

        $favableType = match ($request->type) {
            'ayah' => Ayah::class,
            'hadith' => Hadith::class,
        };

        $favableId = $request->id;

        // Pour un verset, l'id peut être fourni comme "surah:ayah" (ex "2:255") ou comme id DB.
        if ($request->type === 'ayah' && is_string($favableId) && str_contains($favableId, ':')) {
            [$surahNumber, $ayahNumber] = explode(':', $favableId);

            $favableId = \DB::table('ayahs')
                ->join('surahs', 'surahs.id', '=', 'ayahs.surah_id')
                ->where('surahs.number', (int) $surahNumber)
                ->where('ayahs.number_in_surah', (int) $ayahNumber)
                ->value('ayahs.id');

            if (! $favableId) {
                return response()->json(['status' => 'error', 'message' => 'Verset introuvable.'], 404);
            }
        }

        $existing = Favorite::where('user_id', $user->id)
            ->where('favable_type', $favableType)
            ->where('favable_id', $favableId)
            ->first();

        if ($existing) {
            $existing->delete();

            return response()->json(['status' => 'removed']);
        }

        Favorite::create([
            'user_id' => $user->id,
            'favable_type' => $favableType,
            'favable_id' => $favableId,
        ]);

        return response()->json(['status' => 'added']);
    }
}
