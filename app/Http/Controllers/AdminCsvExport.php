<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;

/**
 * Ajoute une méthode exportCsv() aux contrôleurs d'administration.
 *
 * Usage :
 *   class AdminSurahController extends Controller {
 *       use AdminCsvExport;
 *       ...
 *   }
 *
 * Depuis une méthode index() :
 *   if ($request->input('export') === 'csv') {
 *       return $this->downloadCsv($surahs, 'surahs', ['number', 'name_ar', 'name_en', 'name_fr', 'revelation_type', 'ayah_count']);
 *   }
 */
trait AdminCsvExport
{
    /**
     * Télécharge une collection d'objets Eloquent en fichier CSV.
     *
     * @param  iterable  $items  Collection ou query builder déjà exécuté
     * @param  string  $filename  Nom de fichier (sans extension)
     * @param  array  $columns  Clés des attributs à exporter
     */
    protected function downloadCsv(iterable $items, string $filename, array $columns)
    {
        $this->pruneOldExports();

        $path = 'csv-exports/'.now()->format('Y-m-d_His').'_'.str_replace(['/', '\\'], '_', $filename).'.csv';
        $handle = fopen('php://temp', 'r+');

        // En-tête
        fputcsv($handle, $columns);

        foreach ($items as $item) {
            $row = [];
            foreach ($columns as $col) {
                $value = $item->{$col} ?? null;
                if (is_bool($value)) {
                    $value = $value ? '1' : '0';
                } elseif (is_array($value) || is_object($value)) {
                    $value = json_encode($value, JSON_UNESCAPED_UNICODE);
                }
                $row[] = $value;
            }
            fputcsv($handle, $row);
        }

        rewind($handle);
        $content = stream_get_contents($handle);
        fclose($handle);

        Storage::disk('local')->put($path, $content);

        return response()->file(Storage::disk('local')->path($path), [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="%s"',
        ]);
    }

    /**
     * Supprime les fichiers CSV de plus de 24h pour éviter les fuites de mémoire.
     */
    protected function pruneOldExports(): void
    {
        try {
            $files = Storage::disk('local')->files('csv-exports');
            $cutoff = now()->subHours(24)->getTimestamp();
            foreach ($files as $file) {
                $lastModified = Storage::disk('local')->lastModified($file);
                if ($lastModified < $cutoff) {
                    Storage::disk('local')->delete($file);
                }
            }
        } catch (\Throwable) {
            // Le nettoyage est best-effort : on ne fait pas échouer l'export
        }
    }
}
