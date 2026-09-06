<?php

namespace App\Http\Controllers;

use App\Models\Ayah;
use App\Models\Surah;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminAyahController extends Controller
{
    use AdminBulkDestroy, AdminCsvExport;

    protected function bulkModel(): string
    {
        return Ayah::class;
    }

    /**
     * Liste des versets avec recherche et filtre par sourate
     */
    public function index(Request $request)
    {
        $query = Ayah::with('surah');

        if ($surahId = $request->input('surah_id')) {
            $query->where('surah_id', $surahId);
        }

        if ($search = $request->input('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('text_ar', 'LIKE', "%{$search}%")
                    ->orWhere('text_fr', 'LIKE', "%{$search}%")
                    ->orWhere('text_en', 'LIKE', "%{$search}%")
                    ->orWhere('global_number', $search);
            });
        }

        $query->orderBy('global_number');

        if ($request->input('export') === 'csv') {
            return $this->downloadCsv(
                $query->get(),
                'versets',
                ['global_number', 'surah_id', 'number_in_surah', 'text_ar', 'text_fr', 'text_en', 'juz', 'page']
            );
        }

        $ayahs = $query->paginate(50);
        $surahs = Surah::orderBy('number')->get();

        return Inertia::render('Admin/Ayahs', compact('ayahs', 'surahs'));
    }

    /**
     * Formulaire de création
     */
    public function create()
    {
        $surahs = Surah::orderBy('number')->get();

        return Inertia::render('Admin/AyahForm', compact('surahs'));
    }

    /**
     * Enregistrer un nouveau verset
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'surah_id' => 'required|exists:surahs,id',
            'number_in_surah' => 'required|integer|min:1',
            'global_number' => 'required|integer|min:1|unique:ayahs,global_number',
            'text_ar' => 'required|string',
            'text_fr' => 'nullable|string',
            'text_en' => 'nullable|string',
            'juz' => 'nullable|integer|min:1|max:30',
            'page' => 'nullable|integer|min:1',
        ]);

        Ayah::create($validated);

        return redirect()->route('admin.ayahs.index')
            ->with('success', 'Verset créé avec succès.');
    }

    /**
     * Afficher un verset
     */
    public function show(Ayah $ayah)
    {
        $ayah->load('surah');

        return Inertia::render('Admin/AyahShow', compact('ayah'));
    }

    /**
     * Formulaire d'édition
     */
    public function edit(Ayah $ayah)
    {
        $surahs = Surah::orderBy('number')->get();

        return Inertia::render('Admin/AyahForm', compact('ayah', 'surahs'));
    }

    /**
     * Mettre à jour un verset
     */
    public function update(Request $request, Ayah $ayah)
    {
        $validated = $request->validate([
            'surah_id' => 'required|exists:surahs,id',
            'number_in_surah' => 'required|integer|min:1',
            'global_number' => 'required|integer|min:1|unique:ayahs,global_number,'.$ayah->id,
            'text_ar' => 'required|string',
            'text_fr' => 'nullable|string',
            'text_en' => 'nullable|string',
            'juz' => 'nullable|integer|min:1|max:30',
            'page' => 'nullable|integer|min:1',
        ]);

        $ayah->update($validated);

        return redirect()->route('admin.ayahs.index')
            ->with('success', 'Verset mis à jour avec succès.');
    }

    /**
     * Supprimer un verset
     */
    public function destroy(Ayah $ayah)
    {
        $ayah->delete();

        return redirect()->route('admin.ayahs.index')
            ->with('success', 'Verset supprimé avec succès.');
    }
}
