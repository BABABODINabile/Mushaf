import { useMemo, useState, useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '../components/AppLayout';
import PageHeader from '../components/PageHeader';
import Medallion from '../components/Medallion';
import EmptyState from '../components/EmptyState';
import { usePreferences } from '../components/PreferencesContext';
import { pickName } from '../lib/translation';
import { ScrollIcon } from '../components/Icons';

const focusRing =
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600';

function JuzDropdown({ juzList, juzMap, value, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function onPointerDown(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        function onKeyDown(e) {
            if (e.key === 'Escape') setOpen(false);
        }
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, []);

    const label = value ? `Juz ${value}` : 'Tous les juz';

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label="Filtrer par juz"
                className={`flex min-w-[170px] items-center justify-between gap-2 rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-700 shadow-sm transition hover:border-teal-400 focus:border-teal-500 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-teal-600 ${focusRing}`}
            >
                <span className="truncate">{label}</span>
                <svg
                    className={`h-4 w-4 shrink-0 text-stone-400 transition-transform duration-200 dark:text-stone-500 ${open ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div
                    role="listbox"
                    aria-label="Juz"
                    style={{ animation: 'menuIn 0.15s ease' }}
                    className="absolute right-0 z-30 mt-2 max-h-72 min-w-[260px] origin-top-right overflow-hidden overflow-y-auto rounded-xl border border-stone-200 bg-white py-1 shadow-xl dark:border-stone-800 dark:bg-stone-900"
                >
                    <button
                        type="button"
                        role="option"
                        aria-selected={!value}
                        onClick={() => { onChange(''); setOpen(false); }}
                        className={`flex w-full items-center px-3 py-2.5 text-left text-sm transition ${
                            !value
                                ? 'bg-teal-50 font-medium text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                                : 'text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
                        }`}
                    >
                        Tous les juz
                    </button>

                    {juzList.map((j) => {
                        const active = String(value) === String(j);
                        const startSurah = juzMap[j];
                        return (
                            <button
                                key={j}
                                type="button"
                                role="option"
                                aria-selected={active}
                                onClick={() => { onChange(String(j)); setOpen(false); }}
                                className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition ${
                                    active
                                        ? 'bg-teal-50 dark:bg-teal-900/30'
                                        : 'hover:bg-stone-100 dark:hover:bg-stone-800'
                                }`}
                            >
                                <span className={`truncate ${active ? 'font-medium text-teal-700 dark:text-teal-300' : 'text-stone-700 dark:text-stone-300'}`}>
                                    Juz {j}
                                </span>
                                {startSurah && (
                                    <span className="ml-2 shrink-0 text-xs text-stone-400 dark:text-stone-500">
                                        {startSurah}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function Coran({ surahs }) {
    const { lang } = usePreferences();
    const [query, setQuery] = useState('');
    const [juz, setJuz] = useState('');

    const normalized = query.trim().toLowerCase();

    const filtered = useMemo(() => {
        const list = surahs.filter((surah) => {
            if (juz && parseInt(surah.start_juz, 10) !== parseInt(juz, 10)) {
                return false;
            }
            if (!normalized) {
                return true;
            }
            return (
                surah.name_fr.toLowerCase().includes(normalized) ||
                surah.name_en.toLowerCase().includes(normalized) ||
                surah.name_ar.includes(query.trim()) ||
                String(surah.number) === normalized
            );
        });
        return list;
    }, [surahs, query, normalized, juz]);

    const juzList = useMemo(() => {
        const set = new Set(surahs.map((s) => parseInt(s.start_juz, 10)).filter(Number.isFinite));
        return [...set].sort((a, b) => a - b);
    }, [surahs]);

    const juzMap = useMemo(() => {
        const map = {};
        for (const s of surahs) {
            const j = parseInt(s.start_juz, 10);
            if (Number.isFinite(j) && !map[j]) {
                map[j] = s.name_fr;
            }
        }
        return map;
    }, [surahs]);

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Le Coran"
                title="Les sourates"
                subtitle="Les 114 sourates du Saint Coran, classées selon l'ordre du mushaf."
            />

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
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
                        placeholder="Rechercher une sourate…"
                        aria-label="Rechercher une sourate"
                        className={`w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-900 shadow-sm transition placeholder:text-stone-400 hover:border-teal-400 focus:border-teal-500 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500 dark:hover:border-teal-600 ${focusRing}`}
                    />
                </div>

                <JuzDropdown juzList={juzList} juzMap={juzMap} value={juz} onChange={setJuz} />
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400">
                {filtered.length} sourate{filtered.length > 1 ? 's' : ''}
                {juz ? ` · Juz ${juz}` : ''}
                {normalized ? ` · « ${query.trim()} »` : ''}
            </p>

            {filtered.length === 0 ? (
                <EmptyState
                    icon={ScrollIcon}
                    title="Aucune sourate trouvée"
                    description={normalized ? `Pour "${query.trim()}"` : ''}
                    action={normalized ? { label: 'Voir toutes les sourates', href: '/coran' } : undefined}
                />
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((surah) => (
                        <Link
                            key={surah.id}
                            href={`/coran/${surah.number}`}
                            className={`group flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-gold-soft hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-gold-soft`}
                        >
                            <Medallion className="h-10 w-10 shrink-0 text-sm font-semibold text-stone-600 transition group-hover:text-gold dark:text-stone-300">
                                {surah.number}
                            </Medallion>
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium text-stone-900 dark:text-stone-100">{pickName(surah, lang)}</p>
                                <p className="text-xs text-stone-500 dark:text-stone-400">
                                    {surah.ayah_count} versets · {surah.revelation_type}
                                </p>
                            </div>
                            <span className="font-arabic text-lg text-stone-600 dark:text-stone-300">{surah.name_ar}</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

Coran.layout = (page) => <AppLayout>{page}</AppLayout>;
