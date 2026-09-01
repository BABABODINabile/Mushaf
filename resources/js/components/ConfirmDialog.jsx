import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { TrashIcon, AlertIcon } from './Icons';

const ConfirmContext = createContext(null);

/**
 * Fournisseur de boîte de confirmation personnalisée (remplace window.confirm).
 * Expose `confirm({ ... })` qui retourne une promesse se résolvant en booléen.
 */
export function ConfirmProvider({ children }) {
    const [dialog, setDialog] = useState(null);
    const resolverRef = useRef(null);

    const confirm = useCallback((options = {}) => {
        setDialog({
            icon: options.icon || AlertIcon,
            title: options.title || 'Êtes-vous sûr ?',
            message: options.message || '',
            confirmLabel: options.confirmLabel || 'Confirmer',
            cancelLabel: options.cancelLabel || 'Annuler',
            tone: options.tone || (options.danger ? 'danger' : 'default'),
        });

        return new Promise((resolve) => {
            resolverRef.current = resolve;
        });
    }, []);

    const close = useCallback((result) => {
        resolverRef.current?.(result);
        resolverRef.current = null;
        setDialog(null);
    }, []);

    useEffect(() => {
        if (!dialog) return;

        function onKeydown(e) {
            if (e.key === 'Escape') close(false);
        }

        document.addEventListener('keydown', onKeydown);

        return () => document.removeEventListener('keydown', onKeydown);
    }, [dialog, close]);

    const isDanger = dialog?.tone === 'danger';
    const iconWrap = isDanger
        ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/30 ring-red-100 dark:ring-red-900/40'
        : 'bg-gradient-to-br from-teal-500 to-teal-700 shadow-teal-500/30 ring-teal-100 dark:ring-teal-900/40';

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}

            {dialog && (
                <div role="alertdialog" aria-modal="true" className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-stone-950/50 backdrop-blur-sm"
                        style={{ animation: 'overlay-in 0.2s ease-out' }}
                        onClick={() => close(false)}
                    />

                    <div
                        className="admin-animate-in relative w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl shadow-stone-950/30 dark:border-stone-700 dark:bg-stone-900 dark:shadow-black/50"
                        style={{ animation: 'modal-in 0.25s ease-out' }}
                    >
                        <div className="flex items-start gap-4">
                            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br text-white shadow-lg ring-4 ${iconWrap}`}>
                                <dialog.icon className="h-5 w-5" />
                            </span>

                            <div className="min-w-0 flex-1">
                                <h3 className="text-base font-bold tracking-tight text-stone-900 dark:text-stone-100">{dialog.title}</h3>
                                {dialog.message && (
                                    <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-stone-400">{dialog.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => close(false)}
                                className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm transition-all duration-200 hover:bg-stone-50 hover:text-stone-900 active:scale-95 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-stone-100"
                            >
                                {dialog.cancelLabel}
                            </button>

                            <button
                                type="button"
                                autoFocus
                                onClick={() => close(true)}
                                className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110 active:scale-95 ${
                                    isDanger
                                        ? 'from-red-600 to-red-700 shadow-red-700/30'
                                        : 'from-teal-600 to-teal-700 shadow-teal-700/30'
                                }`}
                            >
                                <dialog.icon className="h-4 w-4" />
                                {dialog.confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}

/**
 * Retourne la fonction `confirm({ icon, title, message, confirmLabel, cancelLabel, danger })`
 * qui résout `true`/`false` selon le choix de l'utilisateur.
 */
export function useConfirm() {
    const ctx = useContext(ConfirmContext);

    if (ctx === null) {
        throw new Error('useConfirm doit être utilisé dans un <ConfirmProvider>.');
    }

    return ctx;
}