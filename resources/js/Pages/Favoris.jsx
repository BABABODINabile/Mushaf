import { router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../components/AppLayout';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { usePreferences } from '../components/PreferencesContext';
import { pickTranslation, pickName } from '../lib/translation';
import { BookIcon, HadithIcon } from '../components/Icons';

export default function Favoris({ ayahs, hadiths }) {
    const { lang } = usePreferences();
    const [removing, setRemoving] = useState(null);

    async function removeFavorite(type, id) {
        setRemoving(`${type}:${id}`);
        try {
            await fetch('/api/favorites/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ type, id }),
            });
            router.reload();
        } finally {
            setRemoving(null);
        }
    }

    return (
        <div className="mx-auto max-w-3xl space-y-8">
            <PageHeader
                eyebrow="Votre sélection"
                title="Mes favoris"
                subtitle="Les versets et hadiths que vous avez sauvegardés."
            />

            {/* Versets favoris */}
            <section>
                <h2 className="mb-4 text-lg font-semibold text-stone-800 dark:text-stone-200">
                    Versets du Coran ({ayahs.length})
                </h2>
                {ayahs.length === 0 ? (
                <EmptyState
                    icon={BookIcon}
                    title="Aucun verset favori"
                    description="Les versets que vous sauvegardez apparaîtront ici."
                />
            ) : (
                    <div className="space-y-3">
                        {ayahs.map((ayah) => (
                            <article
                                key={ayah.id}
                                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-teal-50 text-sm font-semibold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                                        {ayah.number_in_surah}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-right font-arabic text-2xl leading-[2.2] text-stone-800 dark:text-stone-100">
                                            {ayah.text_ar}
                                        </p>
                                        {pickTranslation(ayah, lang) && (
                                            <p className="mt-2 border-t border-stone-100 pt-2 text-sm text-stone-600 dark:border-stone-800 dark:text-stone-400">
                                                {pickTranslation(ayah, lang)}
                                            </p>
                                        )}
                                        <p className="mt-2 text-xs text-stone-400 dark:text-stone-500">
                                            Sourate {ayah.surah.number} — {pickName(ayah.surah, lang)}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeFavorite('ayah', `${ayah.surah.number}:${ayah.number_in_surah}`)}
                                        disabled={removing === `ayah:${ayah.surah.number}:${ayah.number_in_surah}`}
                                        className="mt-1 shrink-0 rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:hover:bg-red-950/50"
                                        title="Retirer des favoris"
                                    >
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* Hadiths favoris */}
            <section>
                <h2 className="mb-4 text-lg font-semibold text-stone-800 dark:text-stone-200">
                    Hadiths ({hadiths.length})
                </h2>
                {hadiths.length === 0 ? (
                <EmptyState
                    icon={HadithIcon}
                    title="Aucun hadith favori"
                    description="Les hadiths que vous sauvegardez apparaîtront ici."
                />
            ) : (
                    <div className="space-y-3">
                        {hadiths.map((hadith) => (
                            <article
                                key={hadith.id}
                                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-stone-100 text-sm font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                                        {hadith.hadith_number}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-stone-900 dark:text-stone-100">
                                            {hadith.title || `Hadith n°${hadith.hadith_number}`}
                                        </p>
                                        {hadith.text_ar && (
                                            <p className="mt-2 text-right font-arabic text-xl leading-loose text-stone-800 dark:text-stone-100">
                                                {hadith.text_ar}
                                            </p>
                                        )}
                                        {pickTranslation(hadith, lang) && (
                                            <p className="mt-2 border-t border-stone-100 pt-2 text-sm text-stone-600 dark:border-stone-800 dark:text-stone-400">
                                                {pickTranslation(hadith, lang)}
                                            </p>
                                        )}
                                        {hadith.narrator && (
                                            <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">{hadith.narrator}</p>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeFavorite('hadith', hadith.id)}
                                        disabled={removing === `hadith:${hadith.id}`}
                                        className="mt-1 shrink-0 rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:hover:bg-red-950/50"
                                        title="Retirer des favoris"
                                    >
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

Favoris.layout = (page) => <AppLayout>{page}</AppLayout>;