<?php

namespace App\Console\Commands;

use App\Models\Hadith;
use App\Models\HadithCollection;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;

class ImportHadiths extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mushaf:import-hadiths';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Importer les 42 hadiths d\'An-Nawawi depuis l\'API fawazahmed0 + traductions FR';

    /**
     * URLs de l'API
     */
    private string $apiBase = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('📖 Mushaf — Import des Hadiths d\'An-Nawawi');
        $this->newLine();

        // 1. Récupérer les hadiths arabes
        $this->info('📡 Récupération des hadiths arabes...');
        $arabicData = $this->fetchHadiths('ara-nawawi');

        if (! $arabicData) {
            $this->error('❌ Impossible de récupérer les hadiths arabes.');

            return Command::FAILURE;
        }

        // 2. Récupérer les hadiths anglais
        $this->info('📡 Récupération des hadiths anglais...');
        $englishData = $this->fetchHadiths('eng-nawawi');

        if (! $englishData) {
            $this->error('❌ Impossible de récupérer les hadiths anglais.');

            return Command::FAILURE;
        }

        // 3. Charger les traductions FR
        $this->info('📄 Chargement des traductions françaises...');
        $frenchData = $this->loadFrenchTranslations();

        if (! $frenchData) {
            $this->warn('⚠️  Traductions FR non trouvées. Import sans traduction française.');
            $frenchData = [];
        }

        // 4. Créer ou mettre à jour la collection
        HadithCollection::updateOrCreate(
            ['slug' => 'nawawi'],
            [
                'name_ar' => 'الأربعون النووية',
                'name_en' => 'Forty Hadith of an-Nawawi',
                'description_en' => 'A collection of 42 hadiths compiled by Imam an-Nawawi, covering the foundations of Islamic belief and practice.',
                'total_hadiths' => count($arabicData['hadiths']),
                'is_authentic' => true,
                'sort_order' => 1,
            ]
        );

        // 5. Importer chaque hadith
        $bar = $this->output->createProgressBar(count($arabicData['hadiths']));
        $bar->start();

        $inserted = 0;
        $updated = 0;

        foreach ($arabicData['hadiths'] as $arabicHadith) {
            $hadithNumber = $arabicHadith['hadithnumber'];

            // Trouver le hadith anglais correspondant
            $englishHadith = collect($englishData['hadiths'])
                ->firstWhere('hadithnumber', $hadithNumber);

            // Trouver la traduction FR correspondante
            $frenchHadith = collect($frenchData)
                ->firstWhere('hadith_number', $hadithNumber);

            // Insérer ou mettre à jour
            $result = Hadith::updateOrCreate(
                [
                    'collection' => 'nawawi',
                    'hadith_number' => $hadithNumber,
                ],
                [
                    'book_number' => $arabicHadith['reference']['book'] ?? null,
                    'chapter_number' => 1,
                    'chapter_name_ar' => 'الأربعون النووية',
                    'chapter_name_en' => 'Forty Hadith of an-Nawawi',
                    'title' => $this->cleanText($frenchHadith['title'] ?? null),
                    'text_ar' => $this->cleanText($arabicHadith['text']),
                    'text_en' => $this->cleanText($englishHadith['text'] ?? ''),
                    'text_fr' => $this->cleanText($frenchHadith['text_fr'] ?? null),
                    'grade' => $frenchHadith['grade'] ?? null,
                    'narrator' => $frenchHadith['narrator'] ?? null,
                    'is_featured' => $hadithNumber <= 5, // Les 5 premiers mis en avant
                ]
            );

            if ($result->wasRecentlyCreated) {
                $inserted++;
            } else {
                $updated++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        // 6. Résumé
        $this->info('✅ Import terminé !');
        $this->table(
            ['Élément', 'Quantité'],
            [
                ['Hadiths importés', $inserted],
                ['Hadiths mis à jour', $updated],
                ['Total en base', Hadith::where('collection', 'nawawi')->count()],
            ]
        );

        return Command::SUCCESS;
    }

    /**
     * Récupérer les hadiths depuis l'API
     */
    private function fetchHadiths(string $edition): ?array
    {
        $response = Http::timeout(30)->get("{$this->apiBase}/{$edition}.json");

        if ($response->failed()) {
            return null;
        }

        return $response->json();
    }

    /**
     * Charger les traductions françaises depuis le fichier JSON
     */
    private function loadFrenchTranslations(): ?array
    {
        $path = database_path('data/hadiths_nawawi_fr.json');

        if (! File::exists($path)) {
            return null;
        }

        $content = File::get($path);
        $data = json_decode($content, true);

        return json_last_error() === JSON_ERROR_NONE ? $data : null;
    }

    /**
     * Nettoyer un texte importé (balises <br>, HTML résiduel, entités, espaces multiples)
     */
    private function cleanText(?string $text): ?string
    {
        if ($text === null) {
            return null;
        }

        $text = preg_replace('#<br\s*/?>#i', ' ', $text);
        $text = strip_tags($text);
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/\s+/u', ' ', $text);

        return trim($text);
    }
}
