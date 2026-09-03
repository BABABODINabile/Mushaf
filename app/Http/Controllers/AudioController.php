<?php

namespace App\Http\Controllers;

use App\Services\AudioService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AudioController extends Controller
{
    public function __construct(private readonly AudioService $audio) {}

    /**
     * Liste des récitateurs.
     */
    public function reciters(): JsonResponse
    {
        return response()->json($this->audio->reciters());
    }

    /**
     * Navigation par Juz et par page (ranges de versets).
     */
    public function navigation(): JsonResponse
    {
        $ayahs = \DB::table('ayahs')
            ->join('surahs', 'surahs.id', '=', 'ayahs.surah_id')
            ->select('ayahs.global_number', 'ayahs.number_in_surah', 'ayahs.juz', 'ayahs.page', 'surahs.number as surah_number')
            ->whereNotNull('ayahs.juz')
            ->orderBy('ayahs.global_number')
            ->get();

        $juzGroups = [];
        $pageGroups = [];

        foreach ($ayahs as $a) {
            $point = ['surah' => (int) $a->surah_number, 'ayah' => (int) $a->number_in_surah];

            if (! isset($juzGroups[$a->juz])) {
                $juzGroups[$a->juz] = ['start' => $point, 'end' => $point];
            } else {
                $juzGroups[$a->juz]['end'] = $point;
            }

            if (! isset($pageGroups[$a->page])) {
                $pageGroups[$a->page] = ['start' => $point, 'end' => $point];
            } else {
                $pageGroups[$a->page]['end'] = $point;
            }
        }

        ksort($juzGroups);
        ksort($pageGroups);

        return response()->json([
            'juz' => $juzGroups,
            'pages' => $pageGroups,
        ]);
    }

    /**
     * URL MP3 d'une sourate complète.
     */
    public function surahUrl(Request $request, int $number): JsonResponse
    {
        $url = $this->audio->getSurahUrl($request->query('reciter'), $number);

        if (! $url) {
            return response()->json(['error' => 'Reciter introuvable'], 404);
        }

        return response()->json(['url' => $url]);
    }
}
