<?php

namespace App\Http\Controllers;

use App\Models\HadithCollection;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminCollectionController extends Controller
{
    use AdminBulkDestroy, AdminCsvExport;

    protected function bulkModel(): string
    {
        return HadithCollection::class;
    }

    /**
     * Liste des collections
     */
    public function index(Request $request)
    {
        $query = HadithCollection::query()->withCount('hadiths')->orderBy('sort_order');

        if ($request->input('export') === 'csv') {
            return $this->downloadCsv(
                $query->get(),
                'collections',
                ['slug', 'name_ar', 'name_en', 'description_en', 'total_hadiths', 'is_authentic', 'sort_order']
            );
        }

        $collections = $query->paginate(20);

        return Inertia::render('Admin/Collections', compact('collections'));
    }

    /**
     * Formulaire de création
     */
    public function create()
    {
        return Inertia::render('Admin/CollectionForm');
    }

    /**
     * Enregistrer une nouvelle collection
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'slug' => 'required|string|max:32|unique:hadith_collections,slug',
            'name_ar' => 'required|string|max:128',
            'name_en' => 'required|string|max:128',
            'description_en' => 'nullable|string',
            'total_hadiths' => 'nullable|integer|min:0',
            'is_authentic' => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        HadithCollection::create($validated);

        return redirect()->route('admin.collections.index')
            ->with('success', 'Collection créée avec succès.');
    }

    /**
     * Afficher une collection
     */
    public function show(HadithCollection $collection)
    {
        $collection->loadCount('hadiths');

        return Inertia::render('Admin/CollectionShow', compact('collection'));
    }

    /**
     * Formulaire d'édition
     */
    public function edit(HadithCollection $collection)
    {
        return Inertia::render('Admin/CollectionForm', compact('collection'));
    }

    /**
     * Mettre à jour une collection
     */
    public function update(Request $request, HadithCollection $collection)
    {
        $validated = $request->validate([
            'slug' => 'required|string|max:32|unique:hadith_collections,slug,'.$collection->id,
            'name_ar' => 'required|string|max:128',
            'name_en' => 'required|string|max:128',
            'description_en' => 'nullable|string',
            'total_hadiths' => 'nullable|integer|min:0',
            'is_authentic' => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $collection->update($validated);

        return redirect()->route('admin.collections.index')
            ->with('success', 'Collection mise à jour avec succès.');
    }

    /**
     * Supprimer une collection
     */
    public function destroy(HadithCollection $collection)
    {
        $collection->delete();

        return redirect()->route('admin.collections.index')
            ->with('success', 'Collection supprimée avec succès.');
    }
}
