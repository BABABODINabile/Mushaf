<?php

namespace App\Services;

use App\Models\Ayah;
use App\Models\Surah;

class QuizGenerator
{
    /**
     * Génère une session de questions pour le quiz.
     *
     * @param  int  $count  nombre de questions (5|10|20)
     * @param  string  $type  type de questions
     * @param  string  $lang  langue utilisée pour les libellés (fr|en|ar)
     * @return array<int, array{id:string,type:string,prompt:string,hint:?string,correctOptionId:string,options:array<int,array{id:string,label:string}>}>
     */
    public function generate(int $count, string $type = 'verse', string $lang = 'fr'): array
    {
        $questions = [];
        $used = ['ayahs' => [], 'surahs' => []];

        for ($i = 0; $i < $count; $i++) {
            $question = $this->dispatch($type, $lang, $used);

            if ($question) {
                $questions[] = $question;
            }
        }

        return $questions;
    }

    private function dispatch(string $type, string $lang, array &$used): ?array
    {
        return match ($type) {
            'verse' => $this->generateVerseQuestion($lang, $used, true),
            'verse_all' => $this->generateVerseQuestion($lang, $used, false),
            'ayah_surah_name' => $this->generateAyahSurahNameQuestion($lang, $used),
            'surah_first_ayah' => $this->generateSurahFirstAyahQuestion($lang, $used),
            'juz_surah' => $this->generateJuzSurahQuestion($lang, $used),
            'revealed' => $this->generateRevealedQuestion($lang, $used),
            default => null,
        };
    }

    /**
     * Question "verset → sourate" : on affiche un verset arabe, deviner la sourate.
     * Variante 4 options (build options) ou liste exhaustive (options vides).
     */
    private function generateVerseQuestion(string $lang, array &$used, bool $withOptions): ?array
    {
        $ayah = $this->randomAyah($used['ayahs']);

        if (! $ayah) {
            return null;
        }

        $used['ayahs'][] = $ayah->id;

        $options = $withOptions
            ? $this->buildSurahOptions($ayah->surah->number, $used['surahs'], $lang)
            : [];

        return [
            'id' => "verse:{$ayah->id}",
            'type' => $withOptions ? 'verse' : 'verse_all',
            'prompt' => $ayah->text_ar,
            'hint' => null,
            'correctOptionId' => (string) $ayah->surah->number,
            'options' => $options,
        ];
    }

    /**
     * Question "traduction du verset → nom de la sourate" (4 options).
     */
    private function generateAyahSurahNameQuestion(string $lang, array &$used): ?array
    {
        $ayah = $this->randomAyah($used['ayahs']);

        if (! $ayah) {
            return null;
        }

        $used['ayahs'][] = $ayah->id;

        return [
            'id' => "ayah_name:{$ayah->id}",
            'type' => 'ayah_surah_name',
            'prompt' => $this->ayahTranslation($ayah, $lang),
            'hint' => $ayah->text_ar,
            'correctOptionId' => (string) $ayah->surah->number,
            'options' => $this->buildSurahOptions($ayah->surah->number, $used['surahs'], $lang),
        ];
    }

    /**
     * Question "nom de sourate → premier verset" (4 options).
     */
    private function generateSurahFirstAyahQuestion(string $lang, array &$used): ?array
    {
        $surah = Surah::whereNotIn('number', $used['surahs'])->inRandomOrder()->first();

        if (! $surah) {
            return null;
        }

        $used['surahs'][] = $surah->number;

        $correctAyah = $surah->ayahs()->orderBy('number_in_surah')->first();

        if (! $correctAyah) {
            return null;
        }

        $used['ayahs'][] = $correctAyah->id;

        $distractors = Ayah::whereNotIn('id', $used['ayahs'])
            ->where('number_in_surah', '<=', 2)
            ->whereHas('surah', fn ($q) => $q->where('number', '!=', $surah->number))
            ->inRandomOrder()
            ->limit(3)
            ->get();

        $options = collect([
            ['id' => (string) $correctAyah->id, 'label' => QuranText::firstAyahLabel($correctAyah->text_ar)],
        ]);

        foreach ($distractors as $d) {
            $options->push(['id' => (string) $d->id, 'label' => QuranText::firstAyahLabel($d->text_ar)]);
            $used['ayahs'][] = $d->id;
        }

        return [
            'id' => "first:{$correctAyah->id}",
            'type' => 'surah_first_ayah',
            'prompt' => $this->surahName($surah, $lang),
            'hint' => null,
            'correctOptionId' => (string) $correctAyah->id,
            'options' => $options->shuffle()->values()->all(),
        ];
    }

    /**
     * Question "verset + juz → sourate" (4 options).
     */
    private function generateJuzSurahQuestion(string $lang, array &$used): ?array
    {
        $ayah = $this->randomAyah($used['ayahs'], true);

        if (! $ayah) {
            return null;
        }

        $used['ayahs'][] = $ayah->id;

        return [
            'id' => "juz:{$ayah->id}",
            'type' => 'juz_surah',
            'prompt' => $ayah->text_ar,
            'hint' => "Juz {$ayah->juz}",
            'correctOptionId' => (string) $ayah->surah->number,
            'options' => $this->buildSurahOptions($ayah->surah->number, $used['surahs'], $lang),
        ];
    }

    /**
     * Question "nom de sourate → révélation" (Meccan/Medinan).
     */
    private function generateRevealedQuestion(string $lang, array &$used): ?array
    {
        $surah = Surah::whereNotIn('number', $used['surahs'])->inRandomOrder()->first();

        if (! $surah) {
            return null;
        }

        $used['surahs'][] = $surah->number;

        return [
            'id' => "revealed:{$surah->id}",
            'type' => 'revealed',
            'prompt' => $this->surahName($surah, $lang),
            'hint' => null,
            'correctOptionId' => $surah->revelation_type,
            'options' => collect([
                ['id' => 'Meccan', 'label' => 'Meccan'],
                ['id' => 'Medinan', 'label' => 'Medinan'],
            ])->shuffle()->values()->all(),
        ];
    }

    /**
     * Tire un verset aléatoire (excluant ceux déjà utilisés), et exige un juz si demandé.
     */
    private function randomAyah(array $excludeIds, bool $requireJuz = false): ?Ayah
    {
        return Ayah::with('surah')
            ->where('number_in_surah', '>', 1)
            ->where('text_ar', '!=', '')
            ->when($requireJuz, fn ($q) => $q->whereNotNull('juz'))
            ->whereNotIn('id', $excludeIds)
            ->inRandomOrder()
            ->first();
    }

    /**
     * Construit 4 options sourates (bonne + 3 distracteurs), mélangées, dans la langue choisie.
     */
    private function buildSurahOptions(int $correctNumber, array &$usedSurahNumbers, string $lang): array
    {
        $usedSurahNumbers[] = $correctNumber;

        $correct = Surah::where('number', $correctNumber)->first();

        $distractors = Surah::whereNotIn('number', $usedSurahNumbers)
            ->inRandomOrder()
            ->limit(3)
            ->get();

        $options = collect([
            ['id' => (string) $correct->number, 'label' => $this->surahName($correct, $lang)],
        ]);

        foreach ($distractors as $d) {
            $options->push(['id' => (string) $d->number, 'label' => $this->surahName($d, $lang)]);
            $usedSurahNumbers[] = $d->number;
        }

        return $options->shuffle()->values()->all();
    }

    private function surahName(Surah $surah, string $lang): string
    {
        return match ($lang) {
            'ar' => $surah->name_ar,
            'en' => $surah->name_en ?: $surah->name_fr,
            default => $surah->name_fr ?: $surah->name_en,
        };
    }

    private function ayahTranslation(Ayah $ayah, string $lang): string
    {
        return match ($lang) {
            'en' => $ayah->text_en ?: $ayah->text_fr,
            default => $ayah->text_fr ?: $ayah->text_en,
        };
    }
}
