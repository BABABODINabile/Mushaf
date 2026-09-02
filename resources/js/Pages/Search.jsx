import { useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '../components/AppLayout';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { usePreferences } from '../components/PreferencesContext';
import { pickTranslation, pickSurahName } from '../lib/translation';

export default function Search() {
    const { lang } = usePreferences();
    const [query, setQuery] = useState('');
    const [type, setType] = useState('all');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);

    async function runSearch(q, t) {
        const term = (q ?? query).trim();
        const searchType = t ?? type;

        if (term.length < 2) {
            setResults(null);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ q: term, type: searchType });
            const res = await fetch(`/api/search?${params.toString()}`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            setResults(data);
        } catch (e) {
            setError('Une erreur est survenue lors de la recherche.');
        } finally {
            setLoading(false);
        }
    }

    function handleSubmit(e) {
        e.preventDefault();
        runSearch();
    }

    const total =
        results
            ? (results.ayahs?.length ?? 0) + (results.hadiths?.length ?? 0)
            : 0;

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <PageHeader
                eyebrow="Explorer"
                title="Recherche"
                subtitle="Recherchez dans le Coran et les Hadiths."
            />

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Verset, mot-clé, sourate…"
                        className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-800 shadow-sm placeholder:text-stone-400 focus:border-teal-500 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                    >
                        {loading ? '…' : 'Rechercher'}
                    </button>
                </div>

                <div className="flex gap-2 text-sm">
                    {[
                        { value: 'all', label: 'Tout' },
                        { value: 'ayah', label: 'Coran' },
                        { value: 'hadith', label: 'Hadiths' },
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                                setType(opt.value);
                                if (results) runSearch(query, opt.value);
                            }}
                            className={`rounded-full px-4 py-1.5 ${
                                type === opt.value
                                    ? 'bg-teal-700 text-white'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </form>

            {error && (
                <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">{error}</p>
            )}

            {loading && <p className="text-sm text-stone-500 dark:text-stone-400">Recherche en cours…</p>}

            {results && !loading && total === 0 && (
                <EmptyState
                    title="Aucun résultat"
                    description={`Pour « ${query} »`}
                    action={{ label: 'Effacer la recherche', href: '/search' }}
                />
            )}

            {results && (results.ayahs?.length > 0) && (
                <section className="space-y-3">
                    <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                        Coran ({results.ayahs.length})
                    </h2>
                    {results.ayahs.map((ayah) => (
                        <Link
                            key={ayah.id}
                            href={`/coran/${ayah.surah_number}#ayah-${ayah.number_in_surah}`}
                            className="block rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:border-gold-soft hover:shadow-md dark:border-stone-800 dark:bg-stone-900 dark:hover:border-gold-soft"
                        >
                            <p className="text-right font-arabic text-lg leading-loose text-stone-800 dark:text-stone-100">
                                {ayah.text_ar}
                            </p>
                            {pickTranslation(ayah, lang) && (
                                <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{pickTranslation(ayah, lang)}</p>
                            )}
                            <p className="mt-2 text-xs font-medium text-teal-700 dark:text-teal-300">
                                {pickSurahName(ayah, lang)} · verset {ayah.number_in_surah}
                            </p>
                        </Link>
                    ))}
                </section>
            )}

            {results && (results.hadiths?.length > 0) && (
                <section className="space-y-3">
                    <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                        Hadiths ({results.hadiths.length})
                    </h2>
                    {results.hadiths.map((hadith) => (
                        <Link
                            key={hadith.id}
                            href="/hadiths"
                            className="block rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:border-gold-soft hover:shadow-md dark:border-stone-800 dark:bg-stone-900 dark:hover:border-gold-soft"
                        >
                            <p className="font-medium text-stone-900 dark:text-stone-100">
                                {hadith.title || `Hadith n°${hadith.hadith_number}`}
                            </p>
                            {pickTranslation(hadith, lang) && (
                                <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{pickTranslation(hadith, lang)}</p>
                            )}
                        </Link>
                    ))}
                </section>
            )}
        </div>
    );
}

Search.layout = (page) => <AppLayout>{page}</AppLayout>;