import { usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AppLayout from '../components/AppLayout';
import SeoHead from '../components/SeoHead';
import PageHeader from '../components/PageHeader';
import Medallion from '../components/Medallion';
import { useAudio } from '../components/AudioProvider';
import { surahAudioUrl, savedReciterId, effectiveReciterId } from '../lib/audio';
import { usePreferences } from '../components/PreferencesContext';
import { pickName } from '../lib/translation';

const focusRing =
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600';

function ReciterDropdown({ reciters, value, onChange }) {
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

    const current = reciters.find((r) => r.id === value) ?? reciters[0];

    function handleKeyDown(e) {
        if (!open) return;
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const idx = reciters.findIndex((r) => r.id === value);
            const delta = e.key === 'ArrowDown' ? 1 : -1;
            const next = reciters[(idx + delta + reciters.length) % reciters.length];
            onChange(next.id);
        }
    }

    function select(id) {
        onChange(id);
        setOpen(false);
    }

    return (
        <div className="relative w-full sm:w-auto" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                onKeyDown={handleKeyDown}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={`Récitateur : ${current.name}`}
                className={`flex w-full items-center gap-3 rounded-xl border border-stone-300 bg-white py-2 pl-3 pr-2 shadow-sm transition hover:border-teal-400 hover:shadow active:scale-[0.99] focus:border-teal-500 focus:outline-none sm:min-w-[200px] dark:border-stone-700 dark:bg-stone-900 dark:hover:border-teal-600 ${focusRing}`}
            >
                <span className="text-left leading-tight">
                    <span className="block text-sm font-semibold text-stone-900 dark:text-stone-100">{current.name}</span>
                    <span className="block text-xs text-stone-500 dark:text-stone-400">Voix récitante</span>
                </span>
                <svg
                    className={`ml-auto h-4 w-4 shrink-0 text-stone-400 transition-transform duration-200 dark:text-stone-500 ${
                        open ? 'rotate-180' : ''
                    }`}
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
                    aria-label="Récitateurs"
                    style={{ animation: 'menuIn 0.15s ease' }}
                    className="absolute right-0 z-20 mt-2 max-h-72 min-w-[240px] origin-top-right overflow-hidden overflow-y-auto rounded-xl border border-stone-200 bg-white py-1 shadow-xl dark:border-stone-800 dark:bg-stone-900"
                >
                    <p className="px-3 pb-1 pt-1.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-stone-400 dark:text-stone-500">
                        Récitateurs · {reciters.length}
                    </p>

                    {reciters.map((r) => {
                        const active = r.id === value;
                        return (
                            <button
                                key={r.id}
                                type="button"
                                role="option"
                                aria-selected={active}
                                onClick={() => select(r.id)}
                                onMouseEnter={() => onChange(r.id)}
                                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${
                                    active
                                        ? 'bg-teal-50 dark:bg-teal-900/30'
                                        : 'hover:bg-stone-100 dark:hover:bg-stone-800'
                                }`}
                            >
                                <span className="min-w-0 flex-1 text-left">
                                    <span className="block truncate text-sm font-medium text-stone-900 dark:text-stone-100">
                                        {r.name}
                                    </span>
                                    <span className="block truncate font-arabic text-xs text-stone-500 dark:text-stone-400">
                                        {r.name_ar}
                                    </span>
                                </span>
                                {active && (
                                    <svg
                                        className="h-4 w-4 shrink-0 text-teal-700 dark:text-teal-300"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M16.7 5.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-3-3a1 1 0 011.4-1.4L9 11.6l6.3-6.3a1 1 0 011.4 0z" />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function Ecouter({ surahs }) {
    const { play } = useAudio();
    const { reciters, defaultReciter, r2PublicUrl } = usePage().props;
    const { lang } = usePreferences();

    const [reciterId, setReciterId] = useState(() => savedReciterId(reciters, defaultReciter));
    const [mp3Fallback, setMp3Fallback] = useState(false);

    useEffect(() => {
        window.__mushafReciters = reciters;
    }, [reciters]);

    useEffect(() => {
        const { id, fallbackApplied } = effectiveReciterId(reciters, reciterId, defaultReciter);
        if (fallbackApplied && id !== reciterId) {
            setReciterId(id);
            try {
                localStorage.setItem('mushaf-reciter', id);
            } catch {
                // stockage indisponible : on ignore
            }
        }
        setMp3Fallback(fallbackApplied);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setReciter = (id) => {
        setReciterId(id);
        localStorage.setItem('mushaf-reciter', id);
    };

    const currentReciter = reciters.find((r) => r.id === reciterId) ?? reciters[0];

    return (
        <div className="space-y-6">
            <SeoHead
                title="Écouter le Coran"
                description="Écoutez la récitation du Coran par plusieurs récitateurs, avec lecture continue et téléchargement."
                path="/ecouter"
            />
            {mp3Fallback && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
                    Votre navigateur ne lit pas le format Opus : récitateur MP3 sélectionné automatiquement.
                </p>
            )}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <PageHeader
                    eyebrow="Audio"
                    title="Écouter le Coran"
                    subtitle="Choisissez une sourate pour l'écouter sans interruption."
                />

                <div className="shrink-0 w-full sm:w-auto">
                    <label className="mb-1.5 block text-xs font-medium text-stone-500 dark:text-stone-400">
                        Récitateur
                    </label>
                    <ReciterDropdown reciters={reciters} value={reciterId} onChange={setReciter} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {surahs.map((surah) => (
                    <button
                        key={surah.id}
                        type="button"
                        onClick={() =>
                            play({
                                id: surah.id,
                                url: surahAudioUrl(r2PublicUrl, reciterId, surah.number, currentReciter?.format ?? 'opus'),
                                title: `${pickName(surah, lang)} (${surah.number})`,
                                reciter: currentReciter?.name,
                                surahNumber: surah.number,
                                slug: surah.slug,
                                r2PublicUrl,
                                reciterId,
                                format: currentReciter?.format ?? 'opus',
                            })
                        }
                        className={`group flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:border-gold-soft hover:shadow-md dark:border-stone-800 dark:bg-stone-900 dark:hover:border-gold-soft ${focusRing}`}
                    >
                        <div className="flex items-center gap-3">
                            <Medallion className={`h-10 w-10 shrink-0 font-semibold text-stone-600 transition group-hover:text-gold dark:text-stone-300 ${surah.number >= 100 ? 'text-xs' : 'text-sm'}`}>
                                {surah.number}
                            </Medallion>
                            <div>
                                <p className="font-medium text-stone-900 dark:text-stone-100">{pickName(surah, lang)}</p>
                                <p className="font-arabic text-sm text-stone-500 dark:text-stone-400">{surah.name_ar}</p>
                            </div>
                        </div>
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-teal-700 text-white opacity-90 transition group-hover:scale-105">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

Ecouter.layout = (page) => <AppLayout>{page}</AppLayout>;