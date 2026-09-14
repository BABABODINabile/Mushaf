<?php

namespace Tests\Feature;

use App\Models\Ayah;
use App\Models\QuizScore;
use App\Models\Surah;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class QuizTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedQuranData();
    }

    private function seedQuranData(): void
    {
        $surahData = [
            ['number' => 1, 'name_ar' => 'الفاتحة', 'name_en' => 'Al-Fatiha', 'name_fr' => 'Al-Fatiha', 'revelation_type' => 'Meccan', 'ayah_count' => 7],
            ['number' => 2, 'name_ar' => 'البقرة', 'name_en' => 'Al-Baqara', 'name_fr' => 'La Vache', 'revelation_type' => 'Medinan', 'ayah_count' => 286],
            ['number' => 3, 'name_ar' => 'آل عمران', 'name_en' => 'Ali Imran', 'name_fr' => 'La Famille Imran', 'revelation_type' => 'Medinan', 'ayah_count' => 200],
            ['number' => 4, 'name_ar' => 'النساء', 'name_en' => 'An-Nisa', 'name_fr' => 'Les Femmes', 'revelation_type' => 'Medinan', 'ayah_count' => 176],
            ['number' => 5, 'name_ar' => 'المائدة', 'name_en' => 'Al-Maida', 'name_fr' => 'La Table Servie', 'revelation_type' => 'Medinan', 'ayah_count' => 120],
            ['number' => 6, 'name_ar' => 'الأنعام', 'name_en' => 'Al-Anam', 'name_fr' => 'Les Bestiaux', 'revelation_type' => 'Meccan', 'ayah_count' => 165],
            ['number' => 7, 'name_ar' => 'الأعراف', 'name_en' => 'Al-Araf', 'name_fr' => 'Les Gens de Al-Araf', 'revelation_type' => 'Meccan', 'ayah_count' => 206],
            ['number' => 8, 'name_ar' => 'الأنفال', 'name_en' => 'Al-Anfal', 'name_fr' => 'Le Butin', 'revelation_type' => 'Medinan', 'ayah_count' => 75],
            ['number' => 9, 'name_ar' => 'التوبة', 'name_en' => 'At-Tawba', 'name_fr' => 'Le Pardon', 'revelation_type' => 'Medinan', 'ayah_count' => 129],
            ['number' => 10, 'name_ar' => 'يونس', 'name_en' => 'Yunus', 'name_fr' => 'Jonas', 'revelation_type' => 'Meccan', 'ayah_count' => 109],
            ['number' => 11, 'name_ar' => 'هود', 'name_en' => 'Hud', 'name_fr' => 'Houd', 'revelation_type' => 'Meccan', 'ayah_count' => 123],
            ['number' => 12, 'name_ar' => 'يوسف', 'name_en' => 'Yusuf', 'name_fr' => 'Joseph', 'revelation_type' => 'Meccan', 'ayah_count' => 111],
            ['number' => 13, 'name_ar' => 'الرعد', 'name_en' => 'Ar-Rad', 'name_fr' => 'Le Tonnerre', 'revelation_type' => 'Medinan', 'ayah_count' => 43],
            ['number' => 14, 'name_ar' => 'إبراهيم', 'name_en' => 'Ibrahim', 'name_fr' => 'Abraham', 'revelation_type' => 'Meccan', 'ayah_count' => 52],
            ['number' => 15, 'name_ar' => 'الحجر', 'name_en' => 'Al-Hijr', 'name_fr' => 'Le Rocher', 'revelation_type' => 'Meccan', 'ayah_count' => 99],
            ['number' => 16, 'name_ar' => 'النحل', 'name_en' => 'An-Nahl', 'name_fr' => 'Les Abeilles', 'revelation_type' => 'Meccan', 'ayah_count' => 128],
            ['number' => 17, 'name_ar' => 'الإسراء', 'name_en' => 'Al-Isra', 'name_fr' => 'Le Voyage Nocturne', 'revelation_type' => 'Meccan', 'ayah_count' => 111],
            ['number' => 18, 'name_ar' => 'الكهف', 'name_en' => 'Al-Kahf', 'name_fr' => 'La Caverne', 'revelation_type' => 'Meccan', 'ayah_count' => 110],
            ['number' => 19, 'name_ar' => 'مريم', 'name_en' => 'Maryam', 'name_fr' => 'Marie', 'revelation_type' => 'Meccan', 'ayah_count' => 98],
            ['number' => 20, 'name_ar' => 'طه', 'name_en' => 'Taha', 'name_fr' => 'Ta-Ha', 'revelation_type' => 'Meccan', 'ayah_count' => 135],
            ['number' => 21, 'name_ar' => 'الأنبياء', 'name_en' => 'Al-Anbiya', 'name_fr' => 'Les Prophètes', 'revelation_type' => 'Meccan', 'ayah_count' => 112],
            ['number' => 22, 'name_ar' => 'الحج', 'name_en' => 'Al-Hajj', 'name_fr' => 'Le Pèlerinage', 'revelation_type' => 'Medinan', 'ayah_count' => 78],
            ['number' => 23, 'name_ar' => 'المؤمنون', 'name_en' => 'Al-Muminun', 'name_fr' => 'Les Croyants', 'revelation_type' => 'Meccan', 'ayah_count' => 118],
            ['number' => 24, 'name_ar' => 'النور', 'name_en' => 'An-Nur', 'name_fr' => 'La Lumière', 'revelation_type' => 'Medinan', 'ayah_count' => 64],
            ['number' => 25, 'name_ar' => 'الفرقان', 'name_en' => 'Al-Furqan', 'name_fr' => 'Le Discernement', 'revelation_type' => 'Meccan', 'ayah_count' => 77],
        ];

        foreach ($surahData as $s) {
            $s['slug'] = 'surah-'.$s['number'];
            Surah::create($s);
        }

        foreach ($surahData as $s) {
            $surah = Surah::where('number', $s['number'])->first();
            $count = min((int) $s['ayah_count'], 5);
            for ($i = 2; $i <= $count; $i++) {
                Ayah::create([
                    'surah_id' => $surah->id,
                    'number_in_surah' => $i,
                    'global_number' => $s['number'] * 10 + $i,
                    'text_ar' => 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ آية '.$i,
                    'text_fr' => 'Au nom de Dieu, le Miséricordieux, le Compassionate, verset '.$i,
                    'text_en' => 'In the name of Allah, the Merciful, the Compassionate, verse '.$i,
                    'juz' => min(30, $s['number']),
                ]);
            }
        }
    }

    public function test_quiz_page_returns_ok(): void
    {
        $response = $this->get('/quiz');

        $response->assertOk();
    }

    public function test_quiz_generate_returns_questions(): void
    {
        $response = $this->postJson('/api/quiz/generate', [
            'count' => 5,
        ]);

        $response->assertOk();
        $response->assertJsonStructure(['questions']);
        $response->assertJsonCount(5, 'questions');
    }

    public function test_quiz_generate_with_10_questions(): void
    {
        $response = $this->postJson('/api/quiz/generate', [
            'count' => 10,
        ]);

        $response->assertOk();
        $response->assertJsonCount(10, 'questions');
    }

    public function test_quiz_generate_validates_count(): void
    {
        $response = $this->postJson('/api/quiz/generate', [
            'count' => 7,
        ]);

        $response->assertStatus(422);
    }

    public function test_quiz_generate_questions_have_correct_structure(): void
    {
        $response = $this->postJson('/api/quiz/generate', [
            'count' => 5,
        ]);

        $response->assertOk();

        $questions = $response->json('questions');
        $this->assertCount(5, $questions);

        foreach ($questions as $question) {
            $this->assertArrayHasKey('id', $question);
            $this->assertSame('verse', $question['type']);
            $this->assertArrayHasKey('prompt', $question);
            $this->assertArrayHasKey('correctOptionId', $question);
            $this->assertArrayHasKey('options', $question);
            $this->assertCount(4, $question['options']);
        }
    }

    public function test_quiz_submit_returns_score(): void
    {
        $generateResponse = $this->postJson('/api/quiz/generate', [
            'count' => 5,
        ]);

        $questions = $generateResponse->json('questions');

        $answers = array_map(fn ($q) => [
            'id' => $q['id'],
            'selectedOptionId' => (string) $q['correctOptionId'],
        ], $questions);

        $response = $this->postJson('/api/quiz/submit', [
            'durationSeconds' => 60,
            'answers' => $answers,
        ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'correct',
            'total',
            'percentage',
            'perQuestion',
        ]);
        $response->assertJson(['total' => 5]);
    }

    public function test_quiz_submit_all_correct_answers(): void
    {
        $generateResponse = $this->postJson('/api/quiz/generate', [
            'count' => 5,
        ]);

        $questions = $generateResponse->json('questions');

        $answers = array_map(fn ($q) => [
            'id' => $q['id'],
            'selectedOptionId' => (string) $q['correctOptionId'],
        ], $questions);

        $response = $this->postJson('/api/quiz/submit', [
            'durationSeconds' => 30,
            'answers' => $answers,
        ]);

        $response->assertOk();
        $response->assertJson([
            'correct' => 5,
            'total' => 5,
            'percentage' => 100,
        ]);
    }

    public function test_quiz_submit_validates_answers_required(): void
    {
        $response = $this->postJson('/api/quiz/submit', [
            'durationSeconds' => 60,
        ]);

        $response->assertStatus(422);
    }

    public function test_quiz_submit_saves_score_for_authenticated_user(): void
    {
        $user = User::factory()->create();

        $generateResponse = $this->postJson('/api/quiz/generate', [
            'count' => 5,
        ]);

        $questions = $generateResponse->json('questions');

        $answers = array_map(fn ($q) => [
            'id' => $q['id'],
            'selectedOptionId' => (string) $q['correctOptionId'],
        ], $questions);

        $this->actingAs($user);

        $response = $this->postJson('/api/quiz/submit', [
            'durationSeconds' => 45,
            'answers' => $answers,
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('quiz_scores', [
            'user_id' => $user->id,
            'total_questions' => 5,
            'correct_answers' => 5,
            'duration_seconds' => 45,
        ]);
    }

    public function test_quiz_submit_returns_best_score_for_authenticated_user(): void
    {
        $user = User::factory()->create();

        $generateResponse = $this->postJson('/api/quiz/generate', [
            'count' => 5,
        ]);

        $questions = $generateResponse->json('questions');

        $answers = array_map(fn ($q) => [
            'id' => $q['id'],
            'selectedOptionId' => (string) $q['correctOptionId'],
        ], $questions);

        $this->actingAs($user);

        $response = $this->postJson('/api/quiz/submit', [
            'durationSeconds' => 45,
            'answers' => $answers,
        ]);

        $response->assertOk();
        $response->assertJsonStructure(['bestScore']);
        $this->assertEquals(5, $response->json('bestScore.correct'));
    }

    public function test_quiz_page_shows_best_score_for_authenticated_user(): void
    {
        $user = User::factory()->create();

        QuizScore::create([
            'user_id' => $user->id,
            'total_questions' => 10,
            'correct_answers' => 8,
            'duration_seconds' => 120,
        ]);

        $response = $this->actingAs($user)->get('/quiz');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Quiz')
            ->has('isLoggedIn')
            ->where('bestScore.correct', 8)
            ->where('bestScore.total', 10)
            ->where('bestScore.percentage', 80)
        );
    }

    public function test_quiz_generate_validates_type(): void
    {
        $response = $this->postJson('/api/quiz/generate', [
            'count' => 5,
            'type' => 'unknown_type',
        ]);

        $response->assertStatus(422);
    }

    #[DataProvider('quizTypesProvider')]
    public function test_quiz_generate_supports_each_type(string $type, bool $withOptions): void
    {
        $response = $this->postJson('/api/quiz/generate', [
            'count' => 5,
            'type' => $type,
        ]);

        $response->assertOk();
        $questions = $response->json('questions');
        $this->assertCount(5, $questions);

        foreach ($questions as $question) {
            $this->assertSame($type, $question['type']);
            $this->assertArrayHasKey('prompt', $question);
            $this->assertArrayHasKey('correctOptionId', $question);
            $this->assertArrayHasKey('options', $question);
            $this->assertArrayHasKey('hint', $question);

            if ($withOptions) {
                $this->assertNotEmpty($question['options']);
            }
        }
    }

    public function test_quiz_generate_verse_all_has_empty_options(): void
    {
        $response = $this->postJson('/api/quiz/generate', [
            'count' => 5,
            'type' => 'verse_all',
        ]);

        $response->assertOk();

        foreach ($response->json('questions') as $question) {
            $this->assertSame([], $question['options']);
        }
    }

    public function test_quiz_generate_juz_question_has_juz_hint(): void
    {
        $response = $this->postJson('/api/quiz/generate', [
            'count' => 5,
            'type' => 'juz_surah',
        ]);

        $response->assertOk();

        foreach ($response->json('questions') as $question) {
            $this->assertNotNull($question['hint']);
            $this->assertStringStartsWith('Juz', $question['hint']);
        }
    }

    public function test_quiz_generate_revealed_has_meccan_medinan_options(): void
    {
        $response = $this->postJson('/api/quiz/generate', [
            'count' => 5,
            'type' => 'revealed',
        ]);

        $response->assertOk();

        foreach ($response->json('questions') as $question) {
            $this->assertCount(2, $question['options']);
            $this->assertContains($question['correctOptionId'], ['Meccan', 'Medinan']);
            $this->assertContains($question['correctOptionId'], array_column($question['options'], 'id'));
        }
    }

    #[DataProvider('quizTypesProvider')]
    public function test_quiz_submit_all_correct_for_each_type(string $type): void
    {
        $generateResponse = $this->postJson('/api/quiz/generate', [
            'count' => 5,
            'type' => $type,
        ]);

        $questions = $generateResponse->json('questions');

        $answers = array_map(fn ($q) => [
            'id' => $q['id'],
            'selectedOptionId' => (string) $q['correctOptionId'],
        ], $questions);

        $response = $this->postJson('/api/quiz/submit', [
            'durationSeconds' => 30,
            'answers' => $answers,
        ]);

        $response->assertOk();
        $response->assertJson([
            'correct' => 5,
            'total' => 5,
            'percentage' => 100,
        ]);
    }

    public function test_quiz_submit_wrong_answer_for_revealed(): void
    {
        $generateResponse = $this->postJson('/api/quiz/generate', [
            'count' => 5,
            'type' => 'revealed',
        ]);

        $question = $generateResponse->json('questions.0');
        $wrongAnswer = $question['correctOptionId'] === 'Meccan' ? 'Medinan' : 'Meccan';

        $response = $this->postJson('/api/quiz/submit', [
            'durationSeconds' => 30,
            'answers' => [[
                'id' => $question['id'],
                'selectedOptionId' => $wrongAnswer,
            ]],
        ]);

        $response->assertOk();
        $response->assertJson([
            'correct' => 0,
            'total' => 1,
        ]);
    }

    public static function quizTypesProvider(): array
    {
        return [
            'verse' => ['verse', true],
            'verse_all' => ['verse_all', false],
            'ayah_surah_name' => ['ayah_surah_name', true],
            'surah_first_ayah' => ['surah_first_ayah', true],
            'juz_surah' => ['juz_surah', true],
            'revealed' => ['revealed', true],
        ];
    }
}
