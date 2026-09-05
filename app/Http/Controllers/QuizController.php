<?php

namespace App\Http\Controllers;

use App\Models\Ayah;
use App\Models\QuizScore;
use App\Models\Surah;
use App\Services\QuizGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class QuizController extends Controller
{
    public function index(): InertiaResponse
    {
        $user = auth()->user();
        $bestScore = null;

        if ($user) {
            $score = QuizScore::where('user_id', $user->id)
                ->orderByDesc('correct_answers')
                ->orderBy('duration_seconds')
                ->first();

            if ($score) {
                $bestScore = [
                    'correct' => $score->correct_answers,
                    'total' => $score->total_questions,
                    'percentage' => $score->percentage(),
                ];
            }
        }

        return Inertia::render('Quiz', [
            'isLoggedIn' => (bool) $user,
            'bestScore' => $bestScore,
            'weeklyTop' => $this->weeklyLeaderboard(),
            'myRank' => $this->myWeeklyRank(),
            'surahs' => Surah::orderBy('number')
                ->select(['id', 'number', 'name_ar', 'name_en', 'name_fr', 'revelation_type', 'ayah_count'])
                ->get(),
        ]);
    }

    public function generate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'count' => 'required|integer|in:5,10,20',
            'type' => 'sometimes|string|in:verse,verse_all,ayah_surah_name,surah_first_ayah,juz_surah,revealed',
            'lang' => 'sometimes|string|in:fr,en,ar',
        ]);

        $questions = app(QuizGenerator::class)->generate(
            (int) $validated['count'],
            $validated['type'] ?? 'verse',
            $validated['lang'] ?? 'fr',
        );

        return response()->json(['questions' => $questions]);
    }

    public function submit(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'durationSeconds' => 'required|integer',
            'answers' => 'required|array',
            'answers.*.id' => 'required|string',
            'answers.*.selectedOptionId' => 'required|string',
        ]);

        $answers = $validated['answers'];
        $perQuestion = [];

        foreach ($answers as $answer) {
            $correct = $this->validateAnswer($answer['id'], $answer['selectedOptionId']);
            $perQuestion[] = ['index' => $answer['id'], 'correct' => $correct];
        }

        $correct = count(array_filter($perQuestion, fn ($q) => $q['correct']));
        $total = count($answers);
        $percentage = $total > 0 ? (int) round(($correct / $total) * 100) : 0;

        $bestScore = null;
        $weeklyTop = null;
        $myRank = null;

        if (auth()->check()) {
            QuizScore::create([
                'user_id' => auth()->id(),
                'total_questions' => $total,
                'correct_answers' => $correct,
                'duration_seconds' => $validated['durationSeconds'],
            ]);

            $score = QuizScore::where('user_id', auth()->id())
                ->orderByDesc('correct_answers')
                ->orderBy('duration_seconds')
                ->first();

            if ($score) {
                $bestScore = [
                    'correct' => $score->correct_answers,
                    'total' => $score->total_questions,
                    'percentage' => $score->percentage(),
                ];
            }

            $weeklyTop = $this->weeklyLeaderboard();
            $myRank = $this->myWeeklyRank();
        }

        return response()->json([
            'correct' => $correct,
            'total' => $total,
            'percentage' => $percentage,
            'perQuestion' => $perQuestion,
            'bestScore' => $bestScore,
            'weeklyTop' => $weeklyTop,
            'myRank' => $myRank,
        ]);
    }

    /**
     * Valide une réponse côté serveur selon l'id déterministe de la question.
     */
    private function validateAnswer(string $questionId, string $selectedOptionId): bool
    {
        $parts = explode(':', $questionId, 2);

        if (count($parts) !== 2) {
            return false;
        }

        [$type, $entityId] = $parts;

        return match ($type) {
            'verse', 'ayah_name', 'juz' => $this->validateVerseAnswer($entityId, $selectedOptionId),
            'first' => (string) $entityId === $selectedOptionId,
            'revealed' => $this->validateRevealedAnswer($entityId, $selectedOptionId),
            default => false,
        };
    }

    private function validateVerseAnswer(string $ayahId, string $selectedOptionId): bool
    {
        $ayah = Ayah::with('surah')->find($ayahId);

        if (! $ayah) {
            return false;
        }

        return (string) $ayah->surah->number === $selectedOptionId;
    }

    private function validateRevealedAnswer(string $surahId, string $selectedOptionId): bool
    {
        $surah = Surah::find($surahId);

        if (! $surah) {
            return false;
        }

        return $surah->revelation_type === $selectedOptionId;
    }

    private function weeklyLeaderboard(): array
    {
        $startOfWeek = now()->startOfWeek();

        $best = QuizScore::where('created_at', '>=', $startOfWeek)
            ->selectRaw('user_id, MAX(correct_answers) as correct_answers, MIN(duration_seconds) as duration_seconds')
            ->with('user:id,name')
            ->groupBy('user_id')
            ->orderByRaw('MAX(correct_answers) DESC')
            ->orderByRaw('MIN(duration_seconds) ASC')
            ->limit(10)
            ->get();

        return $best->values()
            ->map(fn ($score, $i) => [
                'rank' => $i + 1,
                'user' => $score->user?->name ?: 'Lecteur',
                'correct' => (int) $score->correct_answers,
                'isMe' => auth()->check() && $score->user_id === (int) auth()->id(),
            ])
            ->all();
    }

    private function myWeeklyRank(): ?int
    {
        $user = auth()->user();

        if (! $user) {
            return null;
        }

        $startOfWeek = now()->startOfWeek();

        $myBest = QuizScore::where('user_id', $user->id)
            ->where('created_at', '>=', $startOfWeek)
            ->orderByDesc('correct_answers')
            ->orderBy('duration_seconds')
            ->first();

        if (! $myBest) {
            return null;
        }

        $better = QuizScore::where('created_at', '>=', $startOfWeek)
            ->where('user_id', '!=', $user->id)
            ->selectRaw('user_id')
            ->groupBy('user_id')
            ->havingRaw('MAX(correct_answers) > ? OR (MAX(correct_answers) = ? AND MIN(duration_seconds) < ?)', [
                $myBest->correct_answers,
                $myBest->correct_answers,
                $myBest->duration_seconds,
            ])
            ->get()
            ->count();

        return $better + 1;
    }
}
