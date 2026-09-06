import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../components/AdminLayout';
import { PageHeader, DetailCard } from '../../components/AdminUI';
import { TrashIcon } from '../../components/Icons';
import { useConfirm } from '../../components/ConfirmDialog';

export default function CollectionShow({ collection }) {
    const confirm = useConfirm();

    function handleDelete() {
        confirm({
            icon: TrashIcon,
            title: 'Supprimer la collection',
            message: `Supprimer « ${collection.name_en} » ? Cette action est irréversible.`,
            confirmLabel: 'Supprimer',
            danger: true,
        }).then((ok) => {
            if (ok) router.delete(`/admin/collections/${collection.id}`);
        });
    }

    return (
        <AdminLayout>
            <Head title={`Admin — ${collection.name_en}`} />

            <PageHeader
                title={collection.name_en}
                subtitle={`Slug : ${collection.slug} · ${collection.hadiths_count} hadiths${collection.is_authentic ? ' · Authentique' : ''}`}
                actions={
                    <>
                        <Link
                            href={`/admin/collections/${collection.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-700/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-700/30 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 active:scale-95"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            Éditer
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-700/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-700/30 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-red-500/50 active:scale-95"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                            Supprimer
                        </button>
                    </>
                }
            />

            <DetailCard className="max-w-xl">
                <div className="mb-6 text-center">
                    <p className="text-3xl leading-relaxed">{collection.name_ar}</p>
                </div>

                {collection.description_en && (
                    <p className="mb-6 text-stone-600 dark:text-stone-400">{collection.description_en}</p>
                )}

                <div className="grid grid-cols-2 gap-4 border-t border-stone-200/70 pt-5 dark:border-stone-700/70">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Total hadiths (prévu)</p>
                        <p className="mt-1 text-sm font-medium text-stone-800 dark:text-stone-200">{collection.total_hadiths || '—'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Ordre d'affichage</p>
                        <p className="mt-1 text-sm font-medium text-stone-800 dark:text-stone-200">{collection.sort_order}</p>
                    </div>
                </div>

                {collection.is_authentic && (
                    <div className="mt-4 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800 dark:bg-green-900/40 dark:text-green-300">
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            Collection authentique
                        </span>
                    </div>
                )}
            </DetailCard>
        </AdminLayout>
    );
}
