import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import AdminToolbar from '../../components/AdminToolbar';
import useSelectable from '../../hooks/useSelectable';
import { PlusIcon } from '../../components/Icons';
import { PageHeader, PrimaryButtonLink, SearchInput, TableCard, Table, Thead, Tbody, Pagination } from '../../components/AdminUI';
import RowActions from '../../components/RowActions';

export default function Surahs({ surahs }) {
    const [deleting, setDeleting] = useState(false);
    const [exporting, setExporting] = useState(false);

    const allIds = surahs.data.map((s) => s.id);
    const sel = useSelectable({ props: { surahs }, allIds });

    function handleSearch(e) {
        router.get('/admin/surahs', { q: e.target.value }, { preserveState: true, replace: true });
    }

    function handleExport() {
        setExporting(true);
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('export', 'csv');
        window.open(`/admin/surahs?${urlParams.toString()}`, '_blank');
        setTimeout(() => setExporting(false), 2000);
    }

    function handleBulkDelete() {
        if (sel.selectedCount === 0) return;
        setDeleting(true);
        router.delete('/admin/surahs/bulk', {
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
            <Head title="Admin — Sourates" />

            <PageHeader
                title="Sourates"
                subtitle="Gérer les 114 sourates du Coran"
                actions={
                    <PrimaryButtonLink href="/admin/surahs/create" icon={PlusIcon}>Ajouter</PrimaryButtonLink>
                }
            />

            <AdminToolbar
                exportLabel="Exporter les sourates (CSV)"
                onExport={handleExport}
                exporting={exporting}
                selectedCount={sel.selectedCount}
                onDeleteSelected={handleBulkDelete}
                deleting={deleting}
            />

            <div className="mb-5 max-w-md">
                <SearchInput
                    placeholder="Rechercher une sourate…"
                    value={surahs.query?.q || ''}
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
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">#</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Nom arabe</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Nom FR</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Nom EN</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Type</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Versets</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Actions</th>
                            </tr>
                        </Thead>
                        <Tbody>
                            {surahs.data.map((s) => (
                                <tr key={s.id} className={`transition-colors ${sel.selected.has(s.id) ? 'bg-teal-50/70 dark:bg-teal-900/20' : 'hover:bg-stone-50 dark:hover:bg-stone-800/50'}`}>
                                    <td className="px-4 py-3">
                                        <input type="checkbox" checked={sel.selected.has(s.id)} onChange={() => sel.toggle(s.id)} className={checkboxClass} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-sm font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-300">{s.number}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-lg font-medium">{s.name_ar}</td>
                                    <td className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">{s.name_fr}</td>
                                    <td className="px-4 py-3 text-stone-500 dark:text-stone-400">{s.name_en}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                                            s.revelation_type === 'Meccan' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                                        }`}>
                                            {s.revelation_type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-stone-600 dark:text-stone-400">{s.ayah_count}</td>
                                    <td className="px-4 py-3">
                                        <RowActions showUrl={`/admin/surahs/${s.id}`} editUrl={`/admin/surahs/${s.id}/edit`} itemLabel={s.name_fr} />
                                    </td>
                                </tr>
                            ))}
                        </Tbody>
                    </Table>
                </div>
            </TableCard>

            <Pagination links={surahs.links} />
        </AdminLayout>
    );
}
