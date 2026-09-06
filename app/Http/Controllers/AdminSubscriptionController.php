<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminSubscriptionController extends Controller
{
    use AdminBulkDestroy, AdminCsvExport;

    protected function bulkModel(): string
    {
        return Subscription::class;
    }

    /**
     * Liste des abonnements avec recherche
     */
    public function index(Request $request)
    {
        $query = Subscription::with('user');

        if ($search = $request->input('q')) {
            $query->where('email', 'LIKE', "%{$search}%");
        }

        if ($status = $request->input('status')) {
            $query->where('is_active', $status === 'active');
        }

        $query->orderByDesc('subscribed_at');

        if ($request->input('export') === 'csv') {
            return $this->downloadCsv(
                $query->get(),
                'abonnements',
                ['email', 'frequency', 'content_type', 'language', 'is_active', 'subscribed_at', 'unsubscribed_at']
            );
        }

        $subscriptions = $query->paginate(20);

        return Inertia::render('Admin/Subscriptions', compact('subscriptions'));
    }

    /**
     * Afficher un abonnement
     */
    public function show(Subscription $subscription)
    {
        $subscription->load('user');

        return Inertia::render('Admin/SubscriptionShow', compact('subscription'));
    }

    /**
     * Activer / désactiver un abonnement
     */
    public function toggle(Subscription $subscription)
    {
        if ($subscription->is_active) {
            $subscription->unsubscribe();
            $message = 'Abonnement désactivé.';
        } else {
            $subscription->update([
                'is_active' => true,
                'unsubscribed_at' => null,
                'subscribed_at' => $subscription->subscribed_at ?? now(),
            ]);
            $message = 'Abonnement réactivé.';
        }

        return redirect()->route('admin.subscriptions.index')
            ->with('success', $message);
    }

    /**
     * Supprimer un abonnement
     */
    public function destroy(Subscription $subscription)
    {
        $subscription->delete();

        return redirect()->route('admin.subscriptions.index')
            ->with('success', 'Abonnement supprimé avec succès.');
    }
}
