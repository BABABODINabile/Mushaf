import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import AdminToolbar from '../../components/AdminToolbar';
import useSelectable from '../../hooks/useSelectable';
import { ToggleOnIcon, ToggleOffIcon, TrashIcon } from '../../components/Icons';
import { useConfirm } from '../../components/ConfirmDialog';
import { PageHeader, TableCard, Table, Thead, Tbody, Pagination } from '../../components/AdminUI';
import RowActions from '../../components/RowActions';

export default function Subscriptions({ subscriptions }) {
    const confirm = useConfirm();
    const [deleting, setDeleting] = useState(false);
    const [exporting, setExporting] = useState(false);

    const allIds = subscriptions.data.map((s) => s.id);
    const sel = useSelectable({ props: { subscriptions }, allIds });

    function handleToggle(id) {
        router.post(`/admin/subscriptions/${id}/toggle`);
    }

    function handleDelete(id) {
        confirm({
            icon: TrashIcon,
            title: 'Supprimer l’abonnement',
            message: 'Cette action est irréversible.',
            confirmLabel: 'Supprimer',
            danger: true,
        }).then((ok) => {
            if (ok) router.delete(`/admin/subscriptions/${id}`);
        });
    }

    function handleExport() {
        setExporting(true);
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('export', 'csv');
        window.open(`/admin/subscriptions?${urlParams.toString()}`, '_blank');
        setTimeout(() => setExporting(false), 2000);
    }

    function handleBulkDelete() {
        if (sel.selectedCount === 0) return;
        setDeleting(true);
        router.delete('/admin/subscriptions/bulk', {
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
            <Head title="Admin — Abonnements" />

            <PageHeader
                title="Abonnements"
                subtitle="Gérer les abonnements aux contenus du Coran"
            />

            <AdminToolbar
                exportLabel="Exporter les abonnements (CSV)"
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
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Email</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Utilisateur</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Fréquence</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Contenu</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Langue</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Actif</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Actions</th>
                            </tr>
                        </Thead>
                        <Tbody>
                            {subscriptions.data.map((sub) => (
                                <tr key={sub.id} className={`transition-colors ${sel.selected.has(sub.id) ? 'bg-teal-50/70 dark:bg-teal-900/20' : 'hover:bg-stone-50 dark:hover:bg-stone-800/50'}`}>
                                    <td className="px-4 py-3">
                                        <input type="checkbox" checked={sel.selected.has(sub.id)} onChange={() => sel.toggle(sub.id)} className={checkboxClass} />
                                    </td>
                                    <td className="px-4 py-3 font-medium text-stone-800 dark:text-stone-200">{sub.email}</td>
                                    <td className="px-4 py-3 text-stone-600 dark:text-stone-400">{sub.user?.name || '—'}</td>
                                    <td className="px-4 py-3 text-stone-600 dark:text-stone-400">{sub.frequency}</td>
                                    <td className="px-4 py-3 text-stone-600 dark:text-stone-400">{sub.content_type}</td>
                                    <td className="px-4 py-3 text-stone-600 dark:text-stone-400">{sub.language}</td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleToggle(sub.id)}
                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all duration-150 hover:scale-105 active:scale-95 ${
                                                sub.is_active
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/70'
                                                    : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/70'
                                            }`}
                                        >
                                            {sub.is_active ? <ToggleOnIcon className="h-3.5 w-3.5" /> : <ToggleOffIcon className="h-3.5 w-3.5" />}
                                            {sub.is_active ? 'Actif' : 'Inactif'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <RowActions
                                            showUrl={`/admin/subscriptions/${sub.id}`}
                                            onDelete={() => handleDelete(sub.id)}
                                            itemLabel={sub.email}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </Tbody>
                    </Table>
                </div>
            </TableCard>

            <Pagination links={subscriptions.links} />
        </AdminLayout>
    );
}