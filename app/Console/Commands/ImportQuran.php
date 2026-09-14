<?php

namespace App\Console\Commands;

use App\Models\Ayah;
use App\Models\Surah;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ImportQuran extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mushaf:import-quran {--limit= : Nombre de sourates à importer (pour tests)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Importer les 114 sourates et 6236 versets depuis l\'API alquran.cloud';

    /**
     * API base URL
     */
    private string $apiBase = 'https://api.alquran.cloud/v1';

    /**
     * Éditions à importer
     */
    private array $editions = [
        'quran-uthmani',  // Texte arabe
        'fr.hamidullah',  // Traduction française
        'en.sahih',       // Traduction anglaise
    ];

    /**
     * Nombre de requêtes effectuées (pour throttle)
     */
    private int $requestCount = 0;

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🕌 Mushaf — Import du Coran');
        $this->newLine();

        // Option --limit pour les tests
        $limit = $this->option('limit') ? (int) $this->option('limit') : null;

        // 1. Récupérer la liste des sourates
        $this->info('📡 Récupération de la liste des sourates...');
        $surahsData = $this->fetchSurahList();

        if (empty($surahsData)) {
            $this->error('❌ Impossible de récupérer la liste des sourates.');

            return Command::FAILURE;
        }

        if ($limit) {
            $surahsData = array_slice($surahsData, 0, $limit);
            $this->info("✅ Limite : import des {$limit} premières sourates.");
        } else {
            $this->info('✅ '.count($surahsData).' sourates trouvées.');
        }
        $this->newLine();

        // 2.Importer chaque sourate
        $bar = $this->output->createProgressBar(count($surahsData));
        $bar->start();

        $totalAyahs = 0;

        foreach ($surahsData as $surahInfo) {
            $surahNumber = $surahInfo['number'];

            // Récupérer les détails avec les 3 éditions
            $surahData = $this->fetchSurahDetail($surahNumber);

            if (! $surahData) {
                $this->newLine();
                $this->warn("⚠️  Échec du chargement de la sourate {$surahNumber}, passage à la suivante.");
                $bar->advance();

                continue;
            }

            // Insérer la sourate
            $this->insertSurah($surahInfo, $surahData);

            // Insérer les versets
            $ayahCount = $this->insertAyahs($surahData, $surahNumber);
            $totalAyahs += $ayahCount;

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        // 3. Résumé
        $this->info('✅ Import terminé !');
        $this->table(
            ['Élément', 'Quantité'],
            [
                ['Sourates', Surah::count()],
                ['Versets', Ayah::count()],
                ['Requêtes API', $this->requestCount],
            ]
        );

        return Command::SUCCESS;
    }

    /**
     * Récupérer la liste des 114 sourates
     */
    private function fetchSurahList(): ?array
    {
        $response = Http::timeout(30)->get("{$this->apiBase}/surah");
        $this->requestCount++;

        if ($response->failed()) {
            return null;
        }

        $data = $response->json();

        return $data['data'] ?? null;
    }

    /**
     * Récupérer les détails d'une sourate avec les 3 éditions
     */
    private function fetchSurahDetail(int $number): ?array
    {
        $editions = implode(',', $this->editions);

        // Throttle : 1 requête toutes les 2 secondes pour respecter l'API
        if ($this->requestCount > 0) {
            usleep(500_000); // 0.5 seconde entre chaque requête
        }

        $response = Http::timeout(30)->get("{$this->apiBase}/surah/{$number}/editions/{$editions}");
        $this->requestCount++;

        if ($response->failed()) {
            return null;
        }

        $data = $response->json();

        return $data['data'] ?? null;
    }

    /**
     * Insérer une sourate en base
     */
    private function insertSurah(array $info, array $editions): void
    {
        $arEdition = collect($editions)->firstWhere('edition.identifier', 'quran-uthmani');

        $frNames = $this->frenchNames();
        $slugs = $this->slugs();

        Surah::updateOrCreate(
            ['number' => $info['number']],
            [
                'name_ar' => $info['name'],
                'name_en' => $info['englishNameTranslation'] ?? $info['englishName'],
                'name_fr' => $frNames[$info['number']] ?? $info['englishNameTranslation'] ?? $info['englishName'],
                'slug' => $slugs[$info['number']] ?? Str::slug($info['englishNameTranslation'] ?? $info['englishName']),
                'revelation_type' => $info['revelationType'],
                'ayah_count' => $info['numberOfAyahs'],
            ]
        );
    }

    /**
     * Insérer les versets d'une sourate
     */
    private function frenchNames(): array
    {
        $data = json_decode((string) file_get_contents(database_path('data/surah_names_fr.json')), true);

        return is_array($data) ? $data : [];
    }

    /**
     * Liste des 114 slugs canoniques des sourates.
     */
    private function slugs(): array
    {
        $data = json_decode((string) file_get_contents(database_path('data/surah_slugs.json')), true);

        return is_array($data) ? $data : [];
    }

    private function insertAyahs(array $editions, int $surahNumber): int
    {
        $arEdition = collect($editions)->firstWhere('edition.identifier', 'quran-uthmani');
        $frEdition = collect($editions)->firstWhere('edition.identifier', 'fr.hamidullah');
        $enEdition = collect($editions)->firstWhere('edition.identifier', 'en.sahih');

        if (! $arEdition) {
            return 0;
        }

        $surah = Surah::where('number', $surahNumber)->first();
        if (! $surah) {
            return 0;
        }

        $ayahsToInsert = [];
        $globalNumber = $surah->ayahs()->max('global_number') ?? 0;

        foreach ($arEdition['ayahs'] as $index => $ayahAr) {
            $globalNumber++;

            $ayahsToInsert[] = [
                'surah_id' => $surah->id,
                'number_in_surah' => $ayahAr['numberInSurah'],
                'global_number' => $globalNumber,
                'text_ar' => $ayahAr['text'],
                'text_fr' => $frEdition['ayahs'][$index]['text'] ?? null,
                'text_en' => $enEdition['ayahs'][$index]['text'] ?? null,
                'juz' => $ayahAr['juz'] ?? null,
                'page' => $ayahAr['page'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Supprimer les versets existants de cette sourate (pour les imports multiples)
        Ayah::where('surah_id', $surah->id)->delete();

        // Insertion en batch (plus rapide)
        Ayah::insert($ayahsToInsert);

        return count($ayahsToInsert);
    }
}
