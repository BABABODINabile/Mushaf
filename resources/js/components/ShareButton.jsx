import { router } from '@inertiajs/react';

/**
 * Bouton partage réutilisable.
 *
 * Props :
 *  - type : 'ayah' | 'hadith'
 *  - id   : identifiant de base de données (PK) du modèle
 *  - size : 'sm' | 'md' (défaut 'md')
 *  - className : classes supplémentaires
 */
export default function ShareButton({ type, id, size = 'md', className = '' }) {
    const sizeClasses = size === 'sm' ? 'h-6 w-6 text-xs' : 'h-8 w-8 text-sm';

    function handleShare(e) {
        e.stopPropagation();
        router.visit(`/share/${type}/${id}`);
    }

    return (
        <button
            type="button"
            onClick={handleShare}
            title="Partager"
            aria-label="Partager"
            className={`inline-flex items-center justify-center rounded-full bg-stone-100 text-stone-400 transition hover:bg-teal-50 hover:text-teal-600 dark:bg-stone-800 dark:text-stone-500 dark:hover:bg-teal-900/40 dark:hover:text-teal-300 ${sizeClasses} ${className}`}
        >
            <svg
                className="h-3/5 w-3/5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
        </button>
    );
}
