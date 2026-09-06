import { useState } from 'react';
import { router } from '@inertiajs/react';
import { useConfirm } from './ConfirmDialog';
import { ExportIcon, SpinnerIcon, TrashIcon } from './Icons';

export default function AdminToolbar({
    exportLabel = 'Exporter CSV',
    onExport,
    selectedCount,
    onDeleteSelected,
    deleting,
    exporting,
}) {
    const confirm = useConfirm();
    const [deletingState, setDeletingState] = useState(false);

    function handleExport() {
        if (onExport) {
            onExport();
        }
    }

    async function handleBulkDelete() {
        if (selectedCount === 0) return;
        const ok = await confirm({
            icon: TrashIcon,
            title: 'Confirmer la suppression',
            message: `Supprimer ${selectedCount} élément${selectedCount > 1 ? 's' : ''} ? Cette action est irréversible.`,
            confirmLabel: 'Supprimer',
            cancelLabel: 'Annuler',
            danger: true,
        });
        if (ok) {
            setDeletingState(true);
            onDeleteSelected();
            setDeletingState(false);
        }
    }

    return (
        <div className="mb-5 flex flex-wrap items-center gap-2.5">
            <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                aria-busy={exporting}
                className="group inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm font-medium text-stone-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:text-teal-700 hover:shadow-md hover:shadow-teal-500/5 focus:outline-none focus:ring-2 focus:ring-teal-500/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:border-teal-600 dark:hover:text-teal-300"
            >
                {exporting ? (
                    <SpinnerIcon className="h-4 w-4 animate-spin" />
                ) : (
                    <ExportIcon className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                )}
                {exporting ? 'Export…' : exportLabel}
            </button>

            {selectedCount > 0 && (
                <div className="flex animate-slideInRight items-center gap-2 rounded-xl border border-teal-200 bg-teal-50/80 px-3 py-1.5 dark:border-teal-800 dark:bg-teal-900/30">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white shadow-sm">
                        {selectedCount}
                    </span>
                    <span className="text-sm font-semibold text-teal-800 dark:text-teal-300">
                        sélectionné{selectedCount > 1 ? 's' : ''}
                    </span>
                    <button
                        type="button"
                        onClick={handleBulkDelete}
                        disabled={deleting || deletingState}
                        className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-95 disabled:opacity-50"
                    >
                        <TrashIcon className="h-3.5 w-3.5" />
                        {deleting ? 'Suppression…' : 'Supprimer'}
                    </button>
                </div>
            )}
        </div>
    );
}
