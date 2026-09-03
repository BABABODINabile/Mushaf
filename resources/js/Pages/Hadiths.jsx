import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '../components/AppLayout';
import FavoriteButton from '../components/FavoriteButton';
import ShareButton from '../components/ShareButton';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { usePreferences } from '../components/PreferencesContext';
import { pickTranslation } from '../lib/translation';
import { HadithIcon } from '../components/Icons';

const focusRing =
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600';

export default function Hadiths({ collection, hadiths, query: serverQuery }) {
    const { lang } = usePreferences();
    const [openId, setOpenId] = useState(null);
    const [query, setQuery] = useState(serverQuery ?? '');

    function handleSearch(e) {
        e.preventDefault();
        router.get('/hadiths', { q: query.trim() || undefined }, { preserveState: true });
    }

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="La Sunna"
                title="Hadiths"
                subtitle={collection?.name_en ?? 'Recueil des 40 hadiths de l\'imam An-Nawawi'}
            />

            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                    <svg
                        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-stone-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Rechercher un hadith…"
                        aria-label="Rechercher un hadith"
                        className={`w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-900 shadow-sm transition placeholder:text-stone-400 hover:border-teal-400 focus:border-teal-500 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500 dark:hover:border-teal-600 ${focusRing}`}
                    />
                </div>
                <button
                    type="submit"
                    className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
                >
                    Rechercher
                </button>
            </form>

            {serverQuery && (
                <p className="text-xs text-stone-500 dark:text-stone-400">
                    {hadiths.length} résultat{hadiths.length > 1 ? 's' : ''} pour « {serverQuery} »
                </p>
            )}

            {hadiths.length === 0 ? (
                <EmptyState
                    icon={HadithIcon}
                    title={serverQuery ? 'Aucun hadith trouvé' : 'Aucun hadith pour l\'instant'}
                    description={serverQuery ? `Pour "${serverQuery}"` : 'Les hadiths apparaîtront ici quand ils seront disponibles.'}
                    action={serverQuery ? { label: 'Voir tous les hadiths', href: '/hadiths' } : undefined}
                />
            ) : (
                <div className="space-y-3">
                    {hadiths.map((hadith) => {
                        const open = openId === hadith.id;

                        return (
                            <article
                                key={hadith.id}
                                className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900"
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpenId(open ? null : hadith.id)}
                                    className="w-full px-5 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-stone-100 text-sm font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                                                {hadith.hadith_number}
                                            </span>
                                            <div>
                                                <p className="font-medium text-stone-900 dark:text-stone-100">
                                                    {hadith.title || `Hadith n°${hadith.hadith_number}`}
                                                </p>
                                                {hadith.narrator && (
                                                    <p className="text-xs text-stone-500 dark:text-stone-400">{hadith.narrator}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FavoriteButton
                                                type="hadith"
                                                id={hadith.hadith_number}
                                                size="sm"
                                            />
                                            <ShareButton type="hadith" id={hadith.id} size="sm" />
                                            <svg
                                                className={`h-5 w-5 shrink-0 text-stone-400 transition dark:text-stone-500 ${open ? 'rotate-180' : ''}`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </button>

                                {open && (
                                    <div className="animate-[menuIn_0.25s_ease-out] border-t border-stone-100 px-5 py-4 dark:border-stone-800">
                                        {hadith.text_ar && (
                                            <p className="text-right font-arabic text-xl leading-loose text-stone-800 dark:text-stone-100">
                                                {hadith.text_ar}
                                            </p>
                                        )}
                                        {pickTranslation(hadith, lang) && (
                                            <p className="mt-3 text-stone-700 dark:text-stone-300">{pickTranslation(hadith, lang)}</p>
                                        )}
                                        {hadith.grade && (
                                            <span className="mt-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                                                {hadith.grade}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

Hadiths.layout = (page) => <AppLayout>{page}</AppLayout>;
