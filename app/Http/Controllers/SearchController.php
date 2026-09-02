<?php

namespace App\Http\Controllers;

use App\Models\Ayah;
use App\Models\Hadith;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SearchController extends Controller
{
    /**
     * Page de recherche
     */
    public function index()
    {
        return Inertia::render('Search');
    }

    /**
     * API : Recherche FULLTEXT dans le Coran et les Hadiths
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->input('q', '');
        $type = $request->input('type', 'all'); // all, ayah, hadith

        if (strlen($query) < 2) {
            return response()->json(['ayahs' => [], 'hadiths' => []]);
        }

        $results = [
            'ayahs' => [],
            'hadiths' => [],
        ];

        // Recherche dans le Coran (FULLTEXT si MySQL, LIKE si SQLite)
        if ($type === 'all' || $type === 'ayah') {
            $isMysql = config('database.default') === 'mysql';

            $results['ayahs'] = Ayah::where(function ($q) use ($query, $isMysql) {
                if ($isMysql) {
                    $raw = 'MATCH(text_ar, text_fr, text_en) AGAINST(? IN BOOLEAN MODE)';
                    $q->whereRaw($raw, [$query]);
                } else {
                    $q->where('text_ar', 'LIKE', "%{$query}%")
                        ->orWhere('text_fr', 'LIKE', "%{$query}%")
                        ->orWhere('text_en', 'LIKE', "%{$query}%");
                }
            })
                ->with('surah')
                ->limit(20)
                ->get()
                ->map(fn ($ayah) => [
                    'id' => $ayah->id,
                    'number_in_surah' => $ayah->number_in_surah,
                    'global_number' => $ayah->global_number,
                    'text_ar' => $ayah->text_ar,
                    'text_fr' => $ayah->text_fr,
                    'text_en' => $ayah->text_en,
                    'surah_number' => $ayah->surah->number,
                    'surah_name_fr' => $ayah->surah->name_fr,
                    'surah_name_en' => $ayah->surah->name_en,
                    'surah_name_ar' => $ayah->surah->name_ar,
                    'juz' => $ayah->juz,
                    'page' => $ayah->page,
                ]);
        }

        // Recherche dans les Hadiths
        if ($type === 'all' || $type === 'hadith') {
            $isMysql = config('database.default') === 'mysql';

            $results['hadiths'] = Hadith::where(function ($q) use ($query, $isMysql) {
                if ($isMysql) {
                    $raw = 'MATCH(text_ar, text_fr, text_en) AGAINST(? IN BOOLEAN MODE)';
                    $q->whereRaw($raw, [$query]);
                } else {
                    $q->where('text_ar', 'LIKE', "%{$query}%")
                        ->orWhere('text_fr', 'LIKE', "%{$query}%")
                        ->orWhere('text_en', 'LIKE', "%{$query}%");
                }
            })
                ->limit(20)
                ->get()
                ->map(fn ($hadith) => [
                    'id' => $hadith->id,
                    'hadith_number' => $hadith->hadith_number,
                    'title' => $hadith->title,
                    'text_ar' => $hadith->text_ar,
                    'text_fr' => $hadith->text_fr,
                    'text_en' => $hadith->text_en,
                    'narrator' => $hadith->narrator,
                    'grade' => $hadith->grade,
                ]);
        }

        return response()->json($results);
    }
}
