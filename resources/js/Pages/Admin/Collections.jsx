import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import AdminToolbar from '../../components/AdminToolbar';
import useSelectable from '../../hooks/useSelectable';
import { PlusIcon } from '../../components/Icons';
import { PageHeader, PrimaryButtonLink, TableCard, Table, Thead, Tbody, Pagination } from '../../components/AdminUI';
import RowActions from '../../components/RowActions';

export default function Collections({ collections }) {
    const [deleting, setDeleting] = useState(false);
    const [exporting, setExporting] = useState(false);

    const allIds = collections.data.map((c) => c.id);
    const sel = useSelectable({ props: { collections }, allIds });

    function handleExport() {
        setExporting(true);
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('export', 'csv');
        window.open(`/admin/collections?${urlParams.toString()}`, '_blank');
        setTimeout(() => setExporting(false), 2000);
    }

    function handleBulkDelete() {
        if (sel.selectedCount === 0) return;
        setDeleting(true);
        router.delete('/admin/collections/bulk', {
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
            <Head title="Admin — Collections" />

            <PageHeader
                title="Collections de hadiths"
                subtitle={`Gérer les collections de hadiths${collections.total ? ` (${collections.total})` : ''}`}
                actions={
                    <PrimaryButtonLink href="/admin/collections/create" icon={PlusIcon}>Ajouter</PrimaryButtonLink>
                }
            />

            <AdminToolbar
                exportLabel="Exporter les collections (CSV)"
                onExport={handleExport}
                exporting={exporting}
                selectedCount={sel.selectedCount}
                onDeleteSelected={handleBulkDelete}
                deleting={deleting}
            />

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
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Slug</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Nom arabe</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Nom EN</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Hadiths</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Authentique</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Ordre</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Actions</th>
                            </tr>
                        </Thead>
                        <Tbody>
                            {collections.data.map((c) => (
                                <tr key={c.id} className={`transition-colors ${sel.selected.has(c.id) ? 'bg-teal-50/70 dark:bg-teal-900/20' : 'hover:bg-stone-50 dark:hover:bg-stone-800/50'}`}>
                                    <td className="px-4 py-3">
                                        <input type="checkbox" checked={sel.selected.has(c.id)} onChange={() => sel.toggle(c.id)} className={checkboxClass} />
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs font-medium text-stone-800 dark:text-stone-200">{c.slug}</td>
                                    <td className="px-4 py-3 text-right text-lg font-medium">{c.name_ar}</td>
                                    <td className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">{c.name_en}</td>
                                    <td className="px-4 py-3 text-stone-600 dark:text-stone-400">{c.hadiths_count}</td>
                                    <td className="px-4 py-3">
                                        {c.is_authentic ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800 dark:bg-green-900/40 dark:text-green-300">
                                                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                Oui
                                            </span>
                                        ) : (
                                            <span className="text-stone-400 dark:text-stone-500">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-stone-400 dark:text-stone-500">{c.sort_order}</td>
                                    <td className="px-4 py-3">
                                        <RowActions showUrl={`/admin/collections/${c.id}`} editUrl={`/admin/collections/${c.id}/edit`} itemLabel={c.name_en} />
                                    </td>
                                </tr>
                            ))}
                        </Tbody>
                    </Table>
                </div>
            </TableCard>

            <Pagination links={collections.links} />
        </AdminLayout>
    );
}
