<?php

namespace App\Http\Controllers;

use App\Models\AudioHistory;
use App\Models\Ayah;
use App\Models\Hadith;
use App\Models\QuizScore;
use App\Models\ReadingDay;
use App\Models\ReadingHistory;
use App\Models\Surah;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PageController extends Controller
{
    /**
     * Page d'accueil
     */
    public function accueil()
    {
        // Verset et hadith du jour (déterministes, comme les endpoints API)
        $verseOfDay = $this->verseOfDayPayload();
        $hadithOfDay = $this->hadithOfDayPayload();

        return Inertia::render('Accueil', compact('verseOfDay', 'hadithOfDay'));
    }

    /**
     * Écouter le Coran (liste des sourates)
     */
    public function ecouter()
    {
        $surahs = Surah::orderBy('number')
            ->select(['id', 'number', 'slug', 'name_ar', 'name_en', 'name_fr', 'revelation_type', 'ayah_count'])
            ->get();

        return Inertia::render('Ecouter', compact('surahs'))
            ->toResponse(request())
            ->header('Cache-Control', 'public, max-age=3600');
    }

    /**
     * API : Verset du jour (lu depuis la base de données locale)
     */
    public function verseOfDay(): JsonResponse
    {
        return response()->json($this->verseOfDayPayload());
    }

    /**
     * Verset du jour, détérminé sur la base du jour courant.
     */
    private function verseOfDayPayload(): array
    {
        $refs = [
            [1, 1], [2, 255], [94, 5], [65, 3], [13, 28],
            [2, 286], [39, 53], [3, 159], [55, 13], [20, 25],
            [16, 97], [29, 69], [3, 139], [2, 152], [9, 40],
        ];

        $index = intdiv(now()->timestamp, 86400) % count($refs);
        [$surahNumber, $ayahNumber] = $refs[$index];

        $ayah = Ayah::query()
            ->where('number_in_surah', $ayahNumber)
            ->whereHas('surah', fn ($q) => $q->where('number', $surahNumber))
            ->with('surah')
            ->first();

        if (! $ayah) {
            abort(404, 'Verset introuvable.');
        }

        return [
            'id' => $ayah->id,
            'surah_number' => $ayah->surah->number,
            'surah_slug' => $ayah->surah->slug,
            'surah_name_fr' => $ayah->surah->name_fr,
            'surah_name_en' => $ayah->surah->name_en,
            'surah_name_ar' => $ayah->surah->name_ar,
            'ayah_number' => $ayah->number_in_surah,
            'text_ar' => $ayah->text_ar,
            'text_fr' => $ayah->text_fr,
            'text_en' => $ayah->text_en,
        ];
    }

    /**
     * API : Hadith du jour (tiré au sort parmi les hadiths d'An-Nawawi)
     */
    public function hadithOfDay(): JsonResponse
    {
        return response()->json($this->hadithOfDayPayload());
    }

    /**
     * Hadith du jour, déterminé de façon déterministe.
     */
    private function hadithOfDayPayload(): array
    {
        // Piocher un hadith de façon déterministe basée sur le jour
        $total = Hadith::where('collection', 'nawawi')->count();

        if ($total === 0) {
            abort(404, 'Aucun hadith disponible.');
        }

        $index = intdiv(now()->timestamp, 86400) % $total;

        $hadith = Hadith::where('collection', 'nawawi')
            ->orderBy('hadith_number')
            ->skip($index)
            ->first();

        return [
            'id' => $hadith->id,
            'hadith_number' => $hadith->hadith_number,
            'title' => $hadith->title,
            'text_ar' => $hadith->text_ar,
            'text_fr' => $hadith->text_fr,
            'text_en' => $hadith->text_en,
            'narrator' => $hadith->narrator,
            'grade' => $hadith->grade,
        ];
    }

    /**
     * API : Historique de lecture de l'utilisateur
     */
    public function readingHistory(): JsonResponse
    {
        $user = auth()->user();

        $history = ReadingHistory::where('user_id', $user->id)
            ->with('surah')
            ->orderBy('read_at', 'desc')
            ->get()
            ->map(fn ($h) => [
                'surah_number' => $h->surah->number,
                'surah_slug' => $h->surah->slug,
                'surah_name_fr' => $h->surah->name_fr,
                'last_ayah' => $h->last_ayah,
                'read_at' => $h->read_at->toIso8601String(),
            ]);

        return response()->json($history);
    }

    /**
     * API : Enregistrer la progression de lecture
     */
    public function saveReadingProgress(Request $request): JsonResponse
    {
        $request->validate([
            'surah_number' => 'required|integer|min:1|max:114',
            'last_ayah' => 'required|integer|min:1',
        ]);

        $user = auth()->user();
        $surah = Surah::where('number', $request->surah_number)->firstOrFail();

        ReadingHistory::updateOrCreate(
            ['user_id' => $user->id, 'surah_id' => $surah->id],
            ['last_ayah' => $request->last_ayah, 'read_at' => now()]
        );

        return response()->json(['status' => 'saved']);
    }

    /**
     * API : Historique d'écoute audio de l'utilisateur
     */
    public function audioHistory(): JsonResponse
    {
        $user = auth()->user();

        $history = AudioHistory::where('user_id', $user->id)
            ->with('surah')
            ->orderBy('listened_at', 'desc')
            ->get()
            ->map(fn ($h) => [
                'surah_number' => $h->surah->number,
                'surah_slug' => $h->surah->slug,
                'surah_name_fr' => $h->surah->name_fr,
                'reciter_id' => $h->reciter_id,
                'position_seconds' => $h->position_seconds,
                'duration_seconds' => $h->duration_seconds,
                'listened_at' => $h->listened_at?->toIso8601String(),
            ]);

        return response()->json($history);
    }

    /**
     * API : Enregistrer la progression d'écoute audio
     */
    public function saveAudioProgress(Request $request): JsonResponse
    {
        $request->validate([
            'surah_number' => 'required|integer|min:1|max:114',
            'reciter_id' => 'nullable|string|max:64',
            'position' => 'nullable|integer|min:0',
            'duration' => 'nullable|integer|min:0',
        ]);

        $user = auth()->user();
        $surah = Surah::where('number', $request->surah_number)->firstOrFail();

        $data = [
            'reciter_id' => $request->reciter_id,
            'position_seconds' => $request->position ?? 0,
            'duration_seconds' => $request->duration ?? 0,
            'listened_at' => now(),
        ];

        AudioHistory::record($user->id, $surah->id, $data);

        return response()->json(['status' => 'saved']);
    }

    public function recordReadingDay(Request $request): JsonResponse
    {
        $request->validate([
            'surah_number' => 'required|integer|min:1|max:114',
            'ayah_number' => 'required|integer|min:1',
        ]);

        $user = auth()->user();

        $row = ReadingDay::firstOrCreate([
            'user_id' => $user->id,
            'date' => now()->toDateString(),
        ]);
        $row->increment('ayahs');

        return response()->json($this->readingStatsPayload($user));
    }

    public function readingStats(): JsonResponse
    {
        return response()->json($this->readingStatsPayload(auth()->user()));
    }

    private function readingStatsPayload($user): array
    {
        $startOfWeek = now()->startOfWeek()->startOfDay();
        $today = now()->toDateString();

        $weekDays = ReadingDay::where('user_id', $user->id)
            ->where('date', '>=', $startOfWeek)
            ->pluck('ayahs', 'date');

        $todayCount = (int) ($weekDays[$today] ?? 0);
        $weekAyahs = (int) $weekDays->sum();

        $weekSurahs = ReadingHistory::where('user_id', $user->id)
            ->where('read_at', '>=', $startOfWeek)
            ->count('surah_id');

        $activeDays = ReadingDay::where('user_id', $user->id)
            ->pluck('ayahs', 'date');

        $streak = 0;
        $cursor = now()->startOfDay();
        if ((int) ($activeDays[$cursor->toDateString()] ?? 0) > 0) {
            $streak = 1;
            $cursor->subDay();
        }
        for ($i = 0; $i < 365; $i++) {
            if ((int) ($activeDays[$cursor->toDateString()] ?? 0) > 0) {
                $streak++;
                $cursor->subDay();
            } else {
                break;
            }
        }

        $bestScore = null;
        $weekBest = QuizScore::where('user_id', $user->id)
            ->where('created_at', '>=', $startOfWeek)
            ->orderByDesc('correct_answers')
            ->orderBy('duration_seconds')
            ->first();

        $best = $weekBest ?? QuizScore::where('user_id', $user->id)
            ->orderByDesc('correct_answers')
            ->orderBy('duration_seconds')
            ->first();

        if ($best) {
            $bestScore = [
                'correct' => $best->correct_answers,
                'total' => $best->total_questions,
                'percentage' => $best->percentage(),
            ];
        }

        return [
            'today' => $todayCount,
            'weekAyahs' => $weekAyahs,
            'weekSurahs' => $weekSurahs,
            'streak' => $streak,
            'bestScore' => $bestScore,
        ];
    }
}
