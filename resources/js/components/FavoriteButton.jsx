import { router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/**
 * Bouton favori (cœur) réutilisable.
 *
 * Props :
 *  - type : 'ayah' | 'hadith'
 *  - id   : identifiant (pour ayah : "surah:ayah", pour hadith : number)
 *  - size : 'sm' | 'md' (défaut 'md')
 *  - className : classes supplémentaires
 */
export default function FavoriteButton({ type, id, size = 'md', className = '' }) {
    const { auth } = usePage().props;
    const isLoggedIn = !!auth?.user;

    const [favs, setFavs] = useState({ ayahs: [], hadiths: [] });
    const [loading, setLoading] = useState(false);

    // Chargement initial des favoris (une seule fois)
    useEffect(() => {
        if (!isLoggedIn) return;
        fetch('/api/favorites', { headers: { Accept: 'application/json' } })
            .then((r) => {
                if (r.status === 401) return null;
                return r.json();
            })
            .then((data) => {
                if (data) setFavs(data);
            })
            .catch(() => {});
    }, [isLoggedIn]);

    const isFav =
        type === 'ayah' ? favs.ayahs.includes(id) : favs.hadiths.includes(id);

    const sizeClasses =
        size === 'sm'
            ? 'h-6 w-6 text-xs'
            : 'h-8 w-8 text-sm';

    function handleToggle(e) {
        e.stopPropagation(); // ne pas déclencher le toggle de l'accordion

        if (!isLoggedIn) {
            router.visit('/login');
            return;
        }

        if (loading) return;
        setLoading(true);

        fetch('/api/favorites/toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-XSRF-TOKEN': decodeURIComponent(
                    document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? ''
                ),
            },
            body: JSON.stringify({ type, id }),
        })
            .then((r) => r.json())
            .then((data) => {
                setFavs((prev) => {
                    if (type === 'ayah') {
                        return {
                            ...prev,
                            ayahs: data.status === 'added'
                                ? [...prev.ayahs, id]
                                : prev.ayahs.filter((x) => x !== id),
                        };
                    }
                    return {
                        ...prev,
                        hadiths: data.status === 'added'
                            ? [...prev.hadiths, id]
                            : prev.hadiths.filter((x) => x !== id),
                    };
                });
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }

    return (
        <button
            type="button"
            onClick={handleToggle}
            title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            className={`inline-flex items-center justify-center rounded-full transition ${
                sizeClasses
            } ${
                isFav
                    ? 'bg-red-50 text-red-500 hover:bg-red-100'
                    : 'bg-stone-100 text-stone-400 hover:bg-stone-200 hover:text-stone-600'
            } ${className}`}
        >
            {isFav ? (
                <svg className="h-3/5 w-3/5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
            ) : (
                <svg className="h-3/5 w-3/5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            )}
        </button>
    );
}
