<?php

namespace App\Http\Controllers;

use App\Models\Ayah;
use App\Models\Surah;
use App\Services\QuranText;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CoranController extends Controller
{
    /**
     * Page principale du Coran (liste des sourates + lecteur)
     */
    public function index()
    {
        $surahs = Surah::orderBy('number')
            ->select([
                'id', 'number', 'slug', 'name_ar', 'name_en', 'name_fr', 'revelation_type', 'ayah_count',
                'start_juz' => Ayah::select('juz')
                    ->whereColumn('surah_id', 'surahs.id')
                    ->orderBy('number_in_surah')
                    ->limit(1),
            ])
            ->get();

        return Inertia::render('Coran', compact('surahs'))
            ->toResponse(request())
            ->header('Cache-Control', 'public, max-age=3600');
    }

    /**
     * Lecture d'une sourate spécifique (par slug ou nombre)
     */
    public function show(string $surah)
    {
        $surahModel = ctype_digit($surah)
            ? Surah::where('number', $surah)->firstOrFail()
            : Surah::where('slug', $surah)->firstOrFail();

        if (ctype_digit($surah)) {
            return redirect()->route('coran.surah', $surahModel->slug, 301);
        }

        $ayahs = Ayah::where('surah_id', $surahModel->id)
            ->orderBy('number_in_surah')
            ->select(['id', 'number_in_surah', 'global_number', 'text_ar', 'text_fr', 'text_en', 'juz', 'page'])
            ->get()
            ->map(function (Ayah $ayah) {
                if ($ayah->number_in_surah === 1) {
                    $ayah->text_ar = QuranText::firstAyahLabel($ayah->text_ar);
                }

                return $ayah;
            });

        $prevSurah = Surah::where('number', $surahModel->number - 1)->first(['id', 'number', 'slug']);
        $nextSurah = Surah::where('number', $surahModel->number + 1)->first(['id', 'number', 'slug']);

        return Inertia::render('Surah', [
            'surah' => $surahModel,
            'ayahs' => $ayahs,
            'prevSurah' => $prevSurah,
            'nextSurah' => $nextSurah,
        ])->toResponse(request())->header('Cache-Control', 'public, max-age=86400');
    }

    /**
     * API : Liste des sourates (JSON)
     */
    public function apiSurahs(): JsonResponse
    {
        $surahs = Surah::orderBy('number')
            ->select(['id', 'number', 'slug', 'name_ar', 'name_en', 'name_fr', 'revelation_type', 'ayah_count'])
            ->get();

        return response()->json($surahs);
    }

    /**
     * API : Versets d'une sourate (JSON)
     */
    public function apiAyahs(int $number): JsonResponse
    {
        $surah = Surah::where('number', $number)->firstOrFail();

        $ayahs = Ayah::where('surah_id', $surah->id)
            ->orderBy('number_in_surah')
            ->select(['id', 'number_in_surah', 'global_number', 'text_ar', 'text_fr', 'text_en', 'juz', 'page'])
            ->get()
            ->map(function (Ayah $ayah) {
                if ($ayah->number_in_surah === 1) {
                    $ayah->text_ar = QuranText::firstAyahLabel($ayah->text_ar);
                }

                return $ayah;
            });

        return response()->json([
            'surah' => $surah,
            'ayahs' => $ayahs,
        ]);
    }

    /**
     * API : Recherche de sourates
     */
    public function apiSearch(Request $request): JsonResponse
    {
        $query = $request->input('q', '');

        if (strlen($query) < 1) {
            return response()->json([]);
        }

        $surahs = Surah::where(function ($q) use ($query) {
            $q->where('name_fr', 'LIKE', "%{$query}%")
                ->orWhere('name_en', 'LIKE', "%{$query}%")
                ->orWhere('name_ar', 'LIKE', "%{$query}%")
                ->orWhere('number', $query);
        })
            ->orderBy('number')
            ->select(['id', 'number', 'slug', 'name_ar', 'name_en', 'name_fr', 'revelation_type', 'ayah_count'])
            ->get();

        return response()->json($surahs);
    }
}
