import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../components/AdminLayout';
import { PageHeader, DetailCard } from '../../components/AdminUI';
import { ToggleOnIcon, ToggleOffIcon, TrashIcon } from '../../components/Icons';
import { useConfirm } from '../../components/ConfirmDialog';

export default function SubscriptionShow({ subscription }) {
    const confirm = useConfirm();

    function handleToggle() {
        router.post(`/admin/subscriptions/${subscription.id}/toggle`);
    }

    function handleDelete() {
        confirm({
            icon: TrashIcon,
            title: 'Supprimer l’abonnement',
            message: 'Cette action est irréversible.',
            confirmLabel: 'Supprimer',
            danger: true,
        }).then((ok) => {
            if (ok) router.delete(`/admin/subscriptions/${subscription.id}`);
        });
    }

    return (
        <AdminLayout>
            <Head title={`Admin — Abonnement ${subscription.email}`} />

            <PageHeader
                title="Abonnement"
                subtitle={subscription.email}
                actions={
                    <>
                        <button
                            onClick={handleToggle}
                            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110 focus:outline-none focus:ring-2 active:scale-95 ${
                                subscription.is_active
                                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 shadow-amber-600/25 hover:shadow-amber-600/30 focus:ring-amber-500/50'
                                    : 'bg-gradient-to-r from-green-500 to-green-600 shadow-green-600/25 hover:shadow-green-600/30 focus:ring-green-500/50'
                            }`}
                        >
                            {subscription.is_active ? <ToggleOffIcon className="h-4 w-4" /> : <ToggleOnIcon className="h-4 w-4" />}
                            {subscription.is_active ? 'Désactiver' : 'Réactiver'}
                        </button>
                        <button
                            onClick={handleDelete}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-xl hover:shadow-red-600/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 active:scale-95"
                        >
                            <TrashIcon className="h-4 w-4" />
                            Supprimer
                        </button>
                    </>
                }
            />

            <DetailCard className="max-w-xl">
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="block text-xs font-medium text-stone-400 dark:text-stone-500">Email</span>
                            <p className="text-stone-800 dark:text-stone-200">{subscription.email}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="block text-xs font-medium text-stone-400 dark:text-stone-500">Utilisateur</span>
                            <p className="text-stone-800 dark:text-stone-200">{subscription.user?.name || 'Non associé'}</p>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="block text-xs font-medium text-stone-400 dark:text-stone-500">Statut</span>
                        <p>
                            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                                subscription.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                            }`}>
                                {subscription.is_active ? 'Actif' : 'Inactif'}
                            </span>
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <span className="block text-xs font-medium text-stone-400 dark:text-stone-500">Fréquence</span>
                            <p className="text-stone-800 dark:text-stone-200">{subscription.frequency}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="block text-xs font-medium text-stone-400 dark:text-stone-500">Contenu</span>
                            <p className="text-stone-800 dark:text-stone-200">{subscription.content_type}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="block text-xs font-medium text-stone-400 dark:text-stone-500">Langue</span>
                            <p className="text-stone-800 dark:text-stone-200">{subscription.language}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="block text-xs font-medium text-stone-400 dark:text-stone-500">Abonné le</span>
                            <p className="text-stone-800 dark:text-stone-200">
                                {subscription.subscribed_at
                                    ? new Date(subscription.subscribed_at).toLocaleString('fr-FR')
                                    : '—'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <span className="block text-xs font-medium text-stone-400 dark:text-stone-500">Désabonné le</span>
                            <p className="text-stone-800 dark:text-stone-200">
                                {subscription.unsubscribed_at
                                    ? new Date(subscription.unsubscribed_at).toLocaleString('fr-FR')
                                    : '—'}
                            </p>
                        </div>
                    </div>
                </div>
            </DetailCard>
        </AdminLayout>
    );
}