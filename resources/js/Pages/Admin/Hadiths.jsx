import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import AdminToolbar from '../../components/AdminToolbar';
import useSelectable from '../../hooks/useSelectable';
import { PlusIcon } from '../../components/Icons';
import { PageHeader, PrimaryButtonLink, SearchInput, TableCard, Table, Thead, Tbody, Pagination } from '../../components/AdminUI';
import RowActions from '../../components/RowActions';

export default function Hadiths({ hadiths }) {
    const [deleting, setDeleting] = useState(false);
    const [exporting, setExporting] = useState(false);

    const allIds = hadiths.data.map((h) => h.id);
    const sel = useSelectable({ props: { hadiths }, allIds });

    function handleSearch(e) {
        router.get('/admin/hadiths', { q: e.target.value }, { preserveState: true, replace: true });
    }

    function handleExport() {
        setExporting(true);
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('export', 'csv');
        window.open(`/admin/hadiths?${urlParams.toString()}`, '_blank');
        setTimeout(() => setExporting(false), 2000);
    }

    function handleBulkDelete() {
        if (sel.selectedCount === 0) return;
        setDeleting(true);
        router.delete('/admin/hadiths/bulk', {
            data: { ids: [...sel.selected] },
            preserveState: true,
            onSuccess: () => sel.clear(),
            onError: () => setDeleting(false),
            onFinish: () => setDeleting(false),
        });
    }

    const checkboxClass = 'h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-500';

    return (
        <AdminLayout>
            <Head title="Admin — Hadiths" />

            <PageHeader
                title="Hadiths"
                subtitle="Gérer les hadiths du Prophète ﷺ"
                actions={
                    <PrimaryButtonLink href="/admin/hadiths/create" icon={PlusIcon}>Ajouter</PrimaryButtonLink>
                }
            />

            <AdminToolbar
                exportLabel="Exporter les hadiths (CSV)"
                onExport={handleExport}
                exporting={exporting}
                selectedCount={sel.selectedCount}
                onDeleteSelected={handleBulkDelete}
                deleting={deleting}
            />

            <div className="mb-5 max-w-md">
                <SearchInput
                    placeholder="Rechercher un hadith…"
                    value={hadiths.query?.q || ''}
                    onChange={handleSearch}
                />
            </div>

            <TableCard>
                <div className="overflow-x-auto">
                    <Table>
                        <Thead>
                            <tr>
                                <th className="px-4 py-3.5">
                                    <input
                                        type="checkbox"
                                        checked={sel.allCurrentSelected}
                                        ref={(el) => { if (el) el.indeterminate = sel.someCurrentSelected; }}
                                        onChange={() => sel.toggleAll(sel.currentPageIds)}
                                        className={checkboxClass}
                                    />
                                </th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">N°</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Collection</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Titre</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Grade</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Actions</th>
                            </tr>
                        </Thead>
                        <Tbody>
                            {hadiths.data.map((h) => (
                                <tr key={h.id} className={`transition-colors ${sel.selected.has(h.id) ? 'bg-teal-50/70 dark:bg-teal-900/20' : 'hover:bg-stone-50 dark:hover:bg-stone-800/50'}`}>
                                    <td className="px-4 py-3">
                                        <input type="checkbox" checked={sel.selected.has(h.id)} onChange={() => sel.toggle(h.id)} className={checkboxClass} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-sm font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-300">{h.hadith_number}</span>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">{h.collection}</td>
                                    <td className="px-4 py-3 text-stone-500 dark:text-stone-400 max-w-xs truncate">{h.title || '—'}</td>
                                    <td className="px-4 py-3">
                                        {h.grade ? (
                                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">{h.grade}</span>
                                        ) : (
                                            <span className="text-stone-400 dark:text-stone-500">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <RowActions showUrl={`/admin/hadiths/${h.id}`} editUrl={`/admin/hadiths/${h.id}/edit`} itemLabel={`hadith ${h.hadith_number}`} />
                                    </td>
                                </tr>
                            ))}
                        </Tbody>
                    </Table>
                </div>
            </TableCard>

            <Pagination links={hadiths.links} />
        </AdminLayout>
    );
}
