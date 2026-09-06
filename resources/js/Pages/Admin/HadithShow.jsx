import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../components/AdminLayout';
import { PageHeader, DetailCard } from '../../components/AdminUI';
import { TrashIcon } from '../../components/Icons';
import { useConfirm } from '../../components/ConfirmDialog';

export default function HadithShow({ hadith }) {
    const confirm = useConfirm();

    function handleDelete() {
        confirm({
            icon: TrashIcon,
            title: 'Supprimer le hadith',
            message: 'Cette action est irréversible.',
            confirmLabel: 'Supprimer',
            danger: true,
        }).then((ok) => {
            if (ok) router.delete(`/admin/hadiths/${hadith.id}`);
        });
    }

    return (
        <AdminLayout>
            <Head title={`Admin — Hadith ${hadith.hadith_number}`} />

            <PageHeader
                title={`Hadith n°${hadith.hadith_number}${hadith.title ? ` — ${hadith.title}` : ''}`}
                subtitle={`Collection : ${hadith.collection} · Grade : ${hadith.grade || '—'}`}
                actions={
                    <>
                        <Link
                            href={`/admin/hadiths/${hadith.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110 active:scale-95"
                        >
                            Éditer
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110 active:scale-95"
                        >
                            Supprimer
                        </button>
                    </>
                }
            />

            <DetailCard className="max-w-3xl">
                <div className="text-center text-3xl leading-relaxed text-stone-800 dark:text-stone-100" dir="rtl">
                    {hadith.text_ar}
                </div>

                {hadith.text_fr && (
                    <div className="mt-6 rounded-xl bg-stone-50 p-5 dark:bg-stone-800/60">
                        <span className="inline-block rounded-full bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">FR</span>
                        <p className="mt-2 text-stone-700 dark:text-stone-300">{hadith.text_fr}</p>
                    </div>
                )}

                {hadith.text_en && (
                    <div className="mt-4 rounded-xl bg-stone-50 p-5 dark:bg-stone-800/60">
                        <span className="inline-block rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">EN</span>
                        <p className="mt-2 text-stone-600 dark:text-stone-400">{hadith.text_en}</p>
                    </div>
                )}

                {(hadith.narrator || hadith.graded_by) && (
                    <div className="mt-6 flex flex-wrap gap-4 text-sm text-stone-500 dark:text-stone-400">
                        {hadith.narrator && (
                            <div>
                                <span className="font-medium text-stone-700 dark:text-stone-300">Narrateur :</span> {hadith.narrator}
                            </div>
                        )}
                        {hadith.graded_by && (
                            <div>
                                <span className="font-medium text-stone-700 dark:text-stone-300">Classé par :</span> {hadith.graded_by}
                            </div>
                        )}
                    </div>
                )}

                {hadith.url_source && (
                    <div className="mt-4 text-sm">
                        <a
                            href={hadith.url_source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-600 underline decoration-teal-300 underline-offset-2 transition hover:text-teal-700 dark:text-teal-400 dark:decoration-teal-700 dark:hover:text-teal-300"
                        >
                            Source
                        </a>
                    </div>
                )}
            </DetailCard>
        </AdminLayout>
    );
}
