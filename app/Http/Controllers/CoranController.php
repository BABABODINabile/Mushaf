<?php

namespace App\Http\Controllers;

use App\Models\Ayah;
use App\Models\Surah;
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
                'id', 'number', 'name_ar', 'name_en', 'name_fr', 'revelation_type', 'ayah_count',
                'start_juz' => Ayah::select('juz')
                    ->whereColumn('surah_id', 'surahs.id')
                    ->orderBy('number_in_surah')
                    ->limit(1),
            ])
            ->get();

        return Inertia::render('Coran', compact('surahs'));
    }

    /**
     * Lecture d'une sourate spécifique
     */
    public function show(int $number)
    {
        $surah = Surah::where('number', $number)->firstOrFail();

        $ayahs = Ayah::where('surah_id', $surah->id)
            ->orderBy('number_in_surah')
            ->select(['id', 'number_in_surah', 'global_number', 'text_ar', 'text_fr', 'text_en', 'juz', 'page'])
            ->get();

        return Inertia::render('Surah', compact('surah', 'ayahs'));
    }

    /**
     * API : Liste des sourates (JSON)
     */
    public function apiSurahs(): JsonResponse
    {
        $surahs = Surah::orderBy('number')
            ->select(['id', 'number', 'name_ar', 'name_en', 'name_fr', 'revelation_type', 'ayah_count'])
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
            ->get();

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
            ->select(['id', 'number', 'name_ar', 'name_en', 'name_fr', 'revelation_type', 'ayah_count'])
            ->get();

        return response()->json($surahs);
    }
}
