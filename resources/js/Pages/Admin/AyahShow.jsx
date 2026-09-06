import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../components/AdminLayout';
import { PageHeader, DetailCard } from '../../components/AdminUI';
import { TrashIcon } from '../../components/Icons';
import { useConfirm } from '../../components/ConfirmDialog';

export default function AyahShow({ ayah }) {
    const confirm = useConfirm();

    function handleDelete() {
        confirm({
            icon: TrashIcon,
            title: 'Supprimer le verset',
            message: 'Cette action est irréversible.',
            confirmLabel: 'Supprimer',
            danger: true,
        }).then((ok) => {
            if (ok) router.delete(`/admin/ayahs/${ayah.id}`);
        });
    }

    return (
        <AdminLayout>
            <Head title={`Admin — Verset ${ayah.global_number}`} />

            <PageHeader
                title={`Verset n°${ayah.global_number}`}
                subtitle={`${ayah.surah?.name_fr} — Verset ${ayah.number_in_surah}`}
                actions={
                    <>
                        <Link
                            href={`/admin/ayahs/${ayah.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-700/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 active:scale-95"
                        >
                            Éditer
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-700/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-red-500/50 active:scale-95"
                        >
                            Supprimer
                        </button>
                    </>
                }
            />

            <DetailCard>
                <div className="mb-8 text-center text-3xl leading-relaxed" dir="rtl">
                    {ayah.text_ar}
                </div>

                {ayah.text_fr && (
                    <div className="mb-4 rounded-xl bg-stone-50 p-4 dark:bg-stone-800">
                        <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">FR</span>
                        <p className="mt-1 text-stone-700 dark:text-stone-300">{ayah.text_fr}</p>
                    </div>
                )}

                {ayah.text_en && (
                    <div className="rounded-xl bg-stone-50 p-4 dark:bg-stone-800">
                        <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">EN</span>
                        <p className="mt-1 text-stone-600 dark:text-stone-400">{ayah.text_en}</p>
                    </div>
                )}
            </DetailCard>
        </AdminLayout>
    );
}
