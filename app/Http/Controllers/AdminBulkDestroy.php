<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Suppression groupée d'une liste d'IDs.
 *
 * Chaque contrôleur doit implémenter bulkModel() pour retourner la classe du modèle.
 */
trait AdminBulkDestroy
{
    /**
     * @return class-string
     */
    abstract protected function bulkModel();

    public function bulkDestroy(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        if (! is_array($ids) || empty($ids)) {
            return response()->json(['message' => 'Aucun ID fourni.'], 422);
        }

        $model = $this->bulkModel();
        $deleted = $model::whereIn('id', $ids)->delete();

        return response()->json(['message' => "$deleted élément(s) supprimé(s).", 'deleted' => $deleted]);
    }
}
