<?php

namespace App\Http\Controllers;

use App\Models\Hadith;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminHadithController extends Controller
{
    use AdminBulkDestroy, AdminCsvExport;

    protected function bulkModel(): string
    {
        return Hadith::class;
    }

    /**
     * Liste des hadiths avec recherche
     */
    public function index(Request $request)
    {
        $query = Hadith::query();

        if ($search = $request->input('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('text_ar', 'LIKE', "%{$search}%")
                    ->orWhere('text_fr', 'LIKE', "%{$search}%")
                    ->orWhere('text_en', 'LIKE', "%{$search}%")
                    ->orWhere('title', 'LIKE', "%{$search}%")
                    ->orWhere('hadith_number', $search);
            });
        }

        if ($collection = $request->input('collection')) {
            $query->where('collection', $collection);
        }

        $query->orderBy('hadith_number');

        if ($request->input('export') === 'csv') {
            return $this->downloadCsv(
                $query->get(),
                'hadiths',
                ['collection', 'hadith_number', 'title', 'text_ar', 'text_en', 'text_fr', 'grade', 'narrator', 'url_source']
            );
        }

        $hadiths = $query->paginate(20);

        return Inertia::render('Admin/Hadiths', compact('hadiths'));
    }

    /**
     * Formulaire de création
     */
    public function create()
    {
        return Inertia::render('Admin/HadithForm');
    }

    /**
     * Enregistrer un nouveau hadith
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'collection' => 'required|string|max:32',
            'hadith_number' => 'required|integer|min:1',
            'title' => 'nullable|string|max:255',
            'text_ar' => 'required|string',
            'text_en' => 'required|string',
            'text_fr' => 'nullable|string',
            'grade' => 'nullable|string|max:64',
            'graded_by' => 'nullable|string|max:128',
            'narrator' => 'nullable|string|max:128',
            'url_source' => 'nullable|string|max:512',
            'is_featured' => 'boolean',
            'book_number' => 'nullable|integer',
            'book_name_ar' => 'nullable|string|max:128',
            'book_name_en' => 'nullable|string|max:128',
            'chapter_number' => 'nullable|integer',
            'chapter_name_ar' => 'nullable|string|max:255',
            'chapter_name_en' => 'nullable|string|max:255',
        ]);

        Hadith::create($validated);

        return redirect()->route('admin.hadiths.index')
            ->with('success', 'Hadith créé avec succès.');
    }

    /**
     * Afficher un hadith
     */
    public function show(Hadith $hadith)
    {
        return Inertia::render('Admin/HadithShow', compact('hadith'));
    }

    /**
     * Formulaire d'édition
     */
    public function edit(Hadith $hadith)
    {
        return Inertia::render('Admin/HadithForm', compact('hadith'));
    }

    /**
     * Mettre à jour un hadith
     */
    public function update(Request $request, Hadith $hadith)
    {
        $validated = $request->validate([
            'collection' => 'required|string|max:32',
            'hadith_number' => 'required|integer|min:1',
            'title' => 'nullable|string|max:255',
            'text_ar' => 'required|string',
            'text_en' => 'required|string',
            'text_fr' => 'nullable|string',
            'grade' => 'nullable|string|max:64',
            'graded_by' => 'nullable|string|max:128',
            'narrator' => 'nullable|string|max:128',
            'url_source' => 'nullable|string|max:512',
            'is_featured' => 'boolean',
            'book_number' => 'nullable|integer',
            'book_name_ar' => 'nullable|string|max:128',
            'book_name_en' => 'nullable|string|max:128',
            'chapter_number' => 'nullable|integer',
            'chapter_name_ar' => 'nullable|string|max:255',
            'chapter_name_en' => 'nullable|string|max:255',
        ]);

        $hadith->update($validated);

        return redirect()->route('admin.hadiths.index')
            ->with('success', 'Hadith mis à jour avec succès.');
    }

    /**
     * Supprimer un hadith
     */
    public function destroy(Hadith $hadith)
    {
        $hadith->delete();

        return redirect()->route('admin.hadiths.index')
            ->with('success', 'Hadith supprimé avec succès.');
    }
}
