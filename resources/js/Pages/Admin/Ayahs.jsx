import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import AdminToolbar from '../../components/AdminToolbar';
import useSelectable from '../../hooks/useSelectable';
import { PlusIcon } from '../../components/Icons';
import { PageHeader, PrimaryButtonLink, SearchInput, TableCard, Table, Thead, Tbody, Pagination, Select } from '../../components/AdminUI';
import RowActions from '../../components/RowActions';

export default function Ayahs({ ayahs, surahs }) {
    const [deleting, setDeleting] = useState(false);
    const [exporting, setExporting] = useState(false);

    const allIds = ayahs.data.map((a) => a.id);
    const sel = useSelectable({ props: { ayahs }, allIds });

    function handleSearch(e) {
        const params = { q: e.target.value };
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('surah_id')) params.surah_id = urlParams.get('surah_id');
        router.get('/admin/ayahs', params, { preserveState: true, replace: true });
    }

    function handleFilterSurah(e) {
        const params = {};
        if (e.target.value) params.surah_id = e.target.value;
        router.get('/admin/ayahs', params, { preserveState: true, replace: true });
    }

    function handleExport() {
        setExporting(true);
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('export', 'csv');
        window.open(`/admin/ayahs?${urlParams.toString()}`, '_blank');
        setTimeout(() => setExporting(false), 2000);
    }

    function handleBulkDelete() {
        if (sel.selectedCount === 0) return;
        setDeleting(true);
        router.delete('/admin/ayahs/bulk', {
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
            <Head title="Admin — Versets" />

            <PageHeader
                title="Versets"
                subtitle="Gérer les versets du Coran"
                actions={
                    <PrimaryButtonLink href="/admin/ayahs/create" icon={PlusIcon}>Ajouter</PrimaryButtonLink>
                }
            />

            <AdminToolbar
                exportLabel="Exporter les versets (CSV)"
                onExport={handleExport}
                exporting={exporting}
                selectedCount={sel.selectedCount}
                onDeleteSelected={handleBulkDelete}
                deleting={deleting}
            />

            <div className="mb-5 flex flex-wrap items-end gap-3">
                <div className="min-w-0 flex-1 max-w-md">
                    <SearchInput
                        placeholder="Rechercher un verset…"
                        value={ayahs.query?.q || ''}
                        onChange={handleSearch}
                    />
                </div>
                <div className="w-56">
                    <Select
                        onChange={handleFilterSurah}
                    >
                        <option value="">Toutes les sourates</option>
                        {surahs.map((s) => (
                            <option key={s.id} value={s.id}>{s.number}. {s.name_fr}</option>
                        ))}
                    </Select>
                </div>
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
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Global #</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Sourate</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Texte arabe</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Actions</th>
                            </tr>
                        </Thead>
                        <Tbody>
                            {ayahs.data.map((a) => (
                                <tr key={a.id} className={`transition-colors ${sel.selected.has(a.id) ? 'bg-teal-50/70 dark:bg-teal-900/20' : 'hover:bg-stone-50 dark:hover:bg-stone-800/50'}`}>
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={sel.selected.has(a.id)}
                                            onChange={() => sel.toggle(a.id)}
                                            className={checkboxClass}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-sm font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-300">{a.global_number}</span>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300">{a.surah?.name_fr}</td>
                                    <td className="px-4 py-3 text-right text-lg leading-relaxed max-w-md truncate">{a.text_ar}</td>
                                    <td className="px-4 py-3">
                                        <RowActions
                                            showUrl={`/admin/ayahs/${a.id}`}
                                            editUrl={`/admin/ayahs/${a.id}/edit`}
                                            itemLabel={`verset ${a.global_number}`}
                                        />
                                    </td>
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
