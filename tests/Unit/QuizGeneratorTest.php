<?php

namespace Tests\Unit;

use App\Models\Ayah;
use App\Models\Surah;
use App\Services\QuizGenerator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class QuizGeneratorTest extends TestCase
{
    use RefreshDatabase;

    private QuizGenerator $generator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedQuranData();
        $this->generator = new QuizGenerator;
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
                ]);
            }
        }
    }

    #[Test]
    public function generate_returns_correct_number_of_questions(): void
    {
        $questions = $this->generator->generate(5);

        $this->assertCount(5, $questions);
    }

    #[Test]
    public function generate_with_10_returns_10_questions(): void
    {
        $questions = $this->generator->generate(10);

        $this->assertCount(10, $questions);
    }

    #[Test]
    public function each_question_has_required_fields(): void
    {
        $questions = $this->generator->generate(5);

        foreach ($questions as $question) {
            $this->assertArrayHasKey('id', $question);
            $this->assertArrayHasKey('type', $question);
            $this->assertArrayHasKey('prompt', $question);
            $this->assertArrayHasKey('correctOptionId', $question);
            $this->assertArrayHasKey('options', $question);
            $this->assertCount(4, $question['options']);
        }
    }

    #[Test]
    public function all_questions_are_verse_type(): void
    {
        $questions = $this->generator->generate(10);

        foreach ($questions as $question) {
            $this->assertSame('verse', $question['type']);
        }
    }

    #[Test]
    public function options_have_string_ids(): void
    {
        $questions = $this->generator->generate(5);

        foreach ($questions as $question) {
            foreach ($question['options'] as $option) {
                $this->assertIsString($option['id']);
                $this->assertArrayHasKey('label', $option);
            }
        }
    }

    #[Test]
    public function correct_option_id_is_string(): void
    {
        $questions = $this->generator->generate(5);

        foreach ($questions as $question) {
            $this->assertIsString($question['correctOptionId']);
        }
    }

    #[Test]
    public function correct_option_id_is_one_of_the_options(): void
    {
        $questions = $this->generator->generate(5);

        foreach ($questions as $question) {
            $optionIds = array_column($question['options'], 'id');
            $this->assertContains($question['correctOptionId'], $optionIds);
        }
    }

    #[Test]
    public function options_have_arabic_labels(): void
    {
        $questions = $this->generator->generate(10);

        foreach ($questions as $question) {
            foreach ($question['options'] as $option) {
                $this->assertNotEmpty($option['label']);
            }
        }
    }

    #[Test]
    public function prompt_is_arabic_verse(): void
    {
        $questions = $this->generator->generate(10);

        foreach ($questions as $question) {
            $this->assertNotEmpty($question['prompt']);
        }
    }

    #[Test]
    public function no_duplicate_ids_across_questions(): void
    {
        $questions = $this->generator->generate(5);
        $ids = array_column($questions, 'id');

        $this->assertCount(count($ids), array_unique($ids));
    }

    #[Test]
    public function options_have_distinct_ids(): void
    {
        $questions = $this->generator->generate(5);

        foreach ($questions as $question) {
            $optionIds = array_column($question['options'], 'id');
            $this->assertCount(count($optionIds), array_unique($optionIds));
        }
    }
}
