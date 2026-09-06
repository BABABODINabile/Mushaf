<?php

namespace App\Http\Controllers;

use App\Models\Surah;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminSurahController extends Controller
{
    use AdminBulkDestroy, AdminCsvExport;

    protected function bulkModel(): string
    {
        return Surah::class;
    }

    /**
     * Liste des sourates avec recherche
     */
    public function index(Request $request)
    {
        $query = Surah::query();

        if ($search = $request->input('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('name_fr', 'LIKE', "%{$search}%")
                    ->orWhere('name_ar', 'LIKE', "%{$search}%")
                    ->orWhere('name_en', 'LIKE', "%{$search}%")
                    ->orWhere('number', $search);
            });
        }

        $query->orderBy('number');

        if ($request->input('export') === 'csv') {
            return $this->downloadCsv(
                $query->get(),
                'sourates',
                ['number', 'name_ar', 'name_en', 'name_fr', 'revelation_type', 'ayah_count']
            );
        }

        $surahs = $query->paginate(20);

        return Inertia::render('Admin/Surahs', compact('surahs'));
    }

    /**
     * Formulaire de création
     */
    public function create()
    {
        return Inertia::render('Admin/SurahForm');
    }

    /**
     * Enregistrer une nouvelle sourate
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'number' => 'required|integer|min:1|max:114|unique:surahs,number',
            'name_ar' => 'required|string|max:64',
            'name_en' => 'required|string|max:64',
            'name_fr' => 'required|string|max:64',
            'revelation_type' => 'required|in:Meccan,Medinan',
            'ayah_count' => 'required|integer|min:1',
        ]);

        Surah::create($validated);

        return redirect()->route('admin.surahs.index')
            ->with('success', 'Sourate créée avec succès.');
    }

    /**
     * Afficher une sourate
     */
    public function show(Surah $surah)
    {
        $ayahs = $surah->ayahs()->orderBy('number_in_surah')->paginate(50);

        return Inertia::render('Admin/SurahShow', compact('surah', 'ayahs'));
    }

    /**
     * Formulaire d'édition
     */
    public function edit(Surah $surah)
    {
        return Inertia::render('Admin/SurahForm', compact('surah'));
    }

    /**
     * Mettre à jour une sourate
     */
    public function update(Request $request, Surah $surah)
    {
        $validated = $request->validate([
            'number' => 'required|integer|min:1|max:114|unique:surahs,number,'.$surah->id,
            'name_ar' => 'required|string|max:64',
            'name_en' => 'required|string|max:64',
            'name_fr' => 'required|string|max:64',
            'revelation_type' => 'required|in:Meccan,Medinan',
            'ayah_count' => 'required|integer|min:1',
        ]);

        $surah->update($validated);

        return redirect()->route('admin.surahs.index')
            ->with('success', 'Sourate mise à jour avec succès.');
    }

    /**
     * Supprimer une sourate
     */
    public function destroy(Surah $surah)
    {
        $surah->delete();

        return redirect()->route('admin.surahs.index')
            ->with('success', 'Sourate supprimée avec succès.');
    }
}
