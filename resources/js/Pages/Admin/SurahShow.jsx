import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../components/AdminLayout';
import { PageHeader, TableCard, Table, Thead, Tbody, Pagination } from '../../components/AdminUI';
import { useConfirm } from '../../components/ConfirmDialog';

export default function SurahShow({ surah, ayahs }) {
    const confirm = useConfirm();

    function handleDelete() {
        confirm({
            title: 'Supprimer la sourate',
            message: `Supprimer « ${surah.name_fr} » ? Cette action est irréversible.`,
            confirmLabel: 'Supprimer',
            danger: true,
        }).then((ok) => {
            if (ok) router.delete(`/admin/surahs/${surah.id}`);
        });
    }

    return (
        <AdminLayout>
            <Head title={`Admin — ${surah.name_fr}`} />

            <PageHeader
                title={`${surah.name_ar} — ${surah.name_fr}`}
                subtitle={`Sourate n°${surah.number} · ${surah.revelation_type} · ${surah.ayah_count} versets`}
                actions={
                    <>
                        <Link href={`/admin/surahs/${surah.id}/edit`} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-700/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110 active:scale-95">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            Éditer
                        </Link>
                        <button onClick={handleDelete} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-700/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110 active:scale-95">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                            Supprimer
                        </button>
                    </>
                }
            />

            <TableCard>
                <div className="overflow-x-auto">
                    <Table>
                        <Thead>
                            <tr>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">#</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Texte arabe</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Traduction FR</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Juz</th>
                            </tr>
                        </Thead>
                        <Tbody>
                            {ayahs.data.map((a) => (
                                <tr key={a.id} className="transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/50">
                                    <td className="px-4 py-3">
                                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-sm font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-300">{a.number_in_surah}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-lg leading-relaxed">{a.text_ar}</td>
                                    <td className="max-w-md truncate px-4 py-3 text-stone-600 dark:text-stone-400">{a.text_fr || a.text_en}</td>
                                    <td className="px-4 py-3 text-stone-400 dark:text-stone-500">{a.juz}</td>
                                </tr>
                            ))}
                        </Tbody>
                    </Table>
                </div>
            </TableCard>

            <Pagination links={ayahs.links} />
        </AdminLayout>
    );
}
