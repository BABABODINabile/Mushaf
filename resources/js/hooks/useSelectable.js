import { useMemo, useRef, useState } from 'react';

/**
 * Gère la sélection multiple d'IDs dans une liste paginée.
 * La sélection est limitée au dataset visible et se réinitialise dès que la
 * liste change (pagination, recherche, filtre) pour rester synchronisée
 * avec les cases affichées.
 * @param {object} props
 * @param {object} props.props - les props Inertia de la page (contient la pagination)
 * @param {Array<string|number>} props.allIds - la liste des IDs de la page courante
 * @param {string} [props.storageKey] - historique, non utilisé (plus de persistance)
 */
export default function useSelectable({ props, allIds, storageKey }) {
    const [selected, setSelected] = useState(() => new Set());

    const currentPageIds = useMemo(() => allIds, [allIds]);

    // Signature du dataset visible : ordre stable des IDs de la page courante.
    const datasetKey = useMemo(() => currentPageIds.slice().sort((a, b) => a - b).join('|'), [currentPageIds]);
    const lastKeyRef = useRef(datasetKey);

    // Réinitialisation immédiate quand le dataset change (page / recherche / filtre).
    if (lastKeyRef.current !== datasetKey) {
        lastKeyRef.current = datasetKey;
        setSelected(new Set());
    }

    function toggle(id) {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function toggleAll(currentPageIds) {
        setSelected((prev) => {
            const next = new Set(prev);
            const allCurrentSelected = currentPageIds.every((id) => next.has(id));
            if (allCurrentSelected) {
                currentPageIds.forEach((id) => next.delete(id));
            } else {
                currentPageIds.forEach((id) => next.add(id));
            }
            return next;
        });
    }

    function clear() {
        setSelected(new Set());
    }

    const allCurrentSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selected.has(id));
    const someCurrentSelected = currentPageIds.some((id) => selected.has(id)) && !allCurrentSelected;

    return {
        selected,
        toggle,
        toggleAll,
        clear,
        currentPageIds,
        allCurrentSelected,
        someCurrentSelected,
        selectedCount: selected.size,
    };
}