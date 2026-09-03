<?php

namespace App\Http\Controllers;

use App\Models\Hadith;
use App\Models\HadithCollection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HadithController extends Controller
{
    /**
     * Page principale des hadiths
     */
    public function index(Request $request)
    {
        $query = $request->input('q', '');
        $collection = HadithCollection::where('slug', 'nawawi')->first();
        $hadiths = Hadith::where('collection', 'nawawi')
            ->orderBy('hadith_number')
            ->when($query, function ($q) use ($query) {
                $q->where(function ($sub) use ($query) {
                    $sub->where('title', 'LIKE', "%{$query}%")
                        ->orWhere('text_ar', 'LIKE', "%{$query}%")
                        ->orWhere('text_fr', 'LIKE', "%{$query}%")
                        ->orWhere('text_en', 'LIKE', "%{$query}%")
                        ->orWhere('narrator', 'LIKE', "%{$query}%");
                });
            })
            ->select(['id', 'collection', 'hadith_number', 'title', 'text_ar', 'text_fr', 'text_en', 'narrator', 'grade'])
            ->get();

        return Inertia::render('Hadiths', compact('collection', 'hadiths', 'query'));
    }

    /**
     * API : Liste des hadiths (JSON)
     */
    public function apiHadiths(): JsonResponse
    {
        $hadiths = Hadith::where('collection', 'nawawi')
            ->orderBy('hadith_number')
            ->get();

        return response()->json($hadiths);
    }
}
