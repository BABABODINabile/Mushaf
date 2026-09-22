import { Fragment, useEffect, useRef, useState, useCallback } from 'react';
import { Link, usePage } from '@inertiajs/react';
import AppLayout from '../components/AppLayout';
import SeoHead from '../components/SeoHead';
import FavoriteButton from '../components/FavoriteButton';
import ShareButton from '../components/ShareButton';
import { useAudio } from '../components/AudioProvider';
import { surahAudioUrl, savedReciterId, effectiveReciterId } from '../lib/audio';
import { postJson } from '../lib/http';
import { usePreferences } from '../components/PreferencesContext';
import { pickTranslation, pickName } from '../lib/translation';

function AyahStar({ number }) {
    return (
        <span className="relative mx-1.5 inline-flex h-8 w-8 shrink-0 items-center justify-center align-middle">
            <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 h-8 w-8">
                <path
                    d="M50 5 L62 25 L85 20 L78 42 L98 50 L78 58 L85 80 L62 75 L50 95 L38 75 L15 80 L22 58 L2 50 L22 42 L15 20 L38 25 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-gold"
                />
                <circle cx="50" cy="50" r="22" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-gold" />
            </svg>
            <span className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-[0.58rem] font-bold leading-none text-gold">{number}</span>
        </span>
    );
}

export default function Surah({ surah, ayahs, prevSurah, nextSurah }) {
    const { play, toggle, track, isPlaying } = useAudio();
    const { auth, reciters, defaultReciter, r2PublicUrl } = usePage().props;
    const {
        lang,
        fontSize,
        lineHeight,
        readingMode: mode,
        setFontSize,
        setLineHeight,
        setReadingMode: setMode,
    } = usePreferences();
    const isLoggedIn = !!auth?.user;

    const [goToAyah, setGoToAyah] = useState('');
    const [highlightAyah, setHighlightAyah] = useState(null);
    const [currentAyah, setCurrentAyah] = useState(1);

    const lastSavedAyahRef = useRef(0);
    const saveTimerRef = useRef(null);
    const lastRecordRef = useRef(0);

    const scrollToAyah = useCallback((number) => {
        const el = document.getElementById(`ayah-${number}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setHighlightAyah(number);
            setTimeout(() => setHighlightAyah(null), 1500);
        }
    }, []);

    useEffect(() => {
        const hash = window.location.hash;
        if (!hash.startsWith('#ayah-')) {
            return undefined;
        }
        const number = parseInt(hash.slice(6), 10);
        if (!Number.isFinite(number)) {
            return undefined;
        }
        const timer = window.setTimeout(() => {
            scrollToAyah(number);
        }, 60);
        return () => window.clearTimeout(timer);
    }, [scrollToAyah]);

    useEffect(() => {
        if (!isLoggedIn) {
            return undefined;
        }
        const targets = document.querySelectorAll('[data-ayah]');
        if (!targets.length) {
            return undefined;
        }

        const visible = new Map();
        const onIntersect = (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    visible.set(entry.target, entry.boundingClientRect.top);
                } else {
                    visible.delete(entry.target);
                }
            }
            let topEl = null;
            let topY = Infinity;
            for (const [el, y] of visible) {
                if (y < topY) {
                    topY = y;
                    topEl = el;
                }
            }
            if (!topEl) {
                return;
            }
            const ayahNumber = parseInt(topEl.dataset.ayah, 10);
            if (!Number.isFinite(ayahNumber)) {
                return;
            }
            setCurrentAyah(ayahNumber);
            if (ayahNumber === lastSavedAyahRef.current) {
                return;
            }
            lastSavedAyahRef.current = ayahNumber;
            window.clearTimeout(saveTimerRef.current);
            saveTimerRef.current = window.setTimeout(() => {
                postJson('/api/reading-history', {
                    surah_number: surah.number,
                    last_ayah: ayahNumber,
                });
                const now = Date.now();
                if (now - lastRecordRef.current > 60000) {
                    lastRecordRef.current = now;
                    postJson('/api/reading/record', {
                        surah_number: surah.number,
                        ayah_number: ayahNumber,
                    });
                }
            }, 2000);
        };

        const observer = new IntersectionObserver(onIntersect, {
            rootMargin: '-15% 0px -15% 0px',
            threshold: 0,
        });
        targets.forEach((el) => observer.observe(el));
        return () => {
            window.clearTimeout(saveTimerRef.current);
            observer.disconnect();
        };
    }, [isLoggedIn, mode, ayahs, surah.number]);

    const reciterId = savedReciterId(reciters, defaultReciter);

    useEffect(() => {
        window.__mushafReciters = reciters;
    }, [reciters]);

    const fontRem = 1.05 + (fontSize - 1) * 0.2875;

    const handleGoToAyah = (e) => {
        e.preventDefault();
        const number = parseInt(goToAyah, 10);
        if (Number.isFinite(number) && number >= 1 && number <= ayahs.length) {
            scrollToAyah(number);
            setGoToAyah('');
        }
    };

    const progressPct = ayahs.length > 0 ? (currentAyah / ayahs.length) * 100 : 0;

    const playingThis = track && String(track.surahNumber) === String(surah.number) && isPlaying;

    const handlePlay = () => {
        if (playingThis) {
            toggle();
            return;
        }
        const { id: effectiveId } = effectiveReciterId(reciters, reciterId, defaultReciter);
        const currentReciter = reciters.find((r) => r.id === effectiveId);
        play({
            id: surah.id,
            url: surahAudioUrl(r2PublicUrl, effectiveId, surah.number, currentReciter?.format ?? 'opus'),
            title: `${pickName(surah, lang)} (${surah.number})`,
            reciter: currentReciter?.name,
            surahNumber: surah.number,
            slug: surah.slug,
            r2PublicUrl,
            reciterId: effectiveId,
            format: currentReciter?.format ?? 'opus',
        });
    };

    const prev = prevSurah ?? null;
    const next = nextSurah ?? null;

    return (
        <>
        <SeoHead
            title={`${pickName(surah, lang)} — Sourate ${surah.number}`}
            description={`Lisez la sourate ${pickName(surah, lang)} (${surah.ayah_count} versets) en arabe avec traduction française et anglaise.`}
            path={`/coran/${surah.slug}`}
            schema={{
                '@context': 'https://schema.org',
                '@type': 'Book',
                name: surah.name_ar,
                alternateName: [surah.name_en, surah.name_fr],
                position: surah.number,
                numberOfPages: surah.ayah_count,
                inLanguage: ['ar', 'fr', 'en'],
                genre: 'Religious text',
                publisher: { '@type': 'Organization', name: 'Mushaf' },
            }}
        />
        <div className="mx-auto max-w-3xl space-y-6">
            <div
                className="fixed top-0 left-0 right-0 h-1 z-50 bg-stone-200 dark:bg-stone-700"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
            >
                <div
                    className="h-full bg-gradient-to-r from-gold to-gold-soft transition-all duration-500 ease-out"
                    style={{ width: `${progressPct}%` }}
                />
            </div>
            <nav className="flex flex-wrap items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                <Link
                    href="/coran"
                    className="font-medium text-teal-700 transition hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:text-teal-300"
                >
                    Coran
                </Link>
                <span aria-hidden="true" className="text-stone-300 dark:text-stone-600">
                    ›
                </span>
                <span className="text-stone-700 dark:text-stone-200">
                    Sourate {surah.number} · {pickName(surah, lang)}
                </span>
            </nav>

            {/* En-tête */}
            <div className="rounded-3xl bg-gradient-to-br from-teal-700 to-emerald-800 p-8 text-center text-white shadow-lg">
                <div className="flex items-center justify-between">
                    {prev ? (
                        <Link
                            href={`/coran/${prev.slug}`}
                            className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                            ← Sourate {prev.number}
                        </Link>
                    ) : (
                        <span className="w-24" />
                    )}
                    {next ? (
                        <Link
                            href={`/coran/${next.slug}`}
                            className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                            Sourate {next.number} →
                        </Link>
                    ) : (
                        <span className="w-24" />
                    )}
                </div>

                <p className="mt-2 font-arabic text-4xl text-emerald-100">{surah.name_ar}</p>
                <h1 className="mt-2 text-2xl font-bold">{pickName(surah, lang)}</h1>
                <p className="mt-1 text-sm text-emerald-100">
                    Sourate {surah.number} · {surah.ayah_count} versets · {surah.revelation_type}
                </p>

                <button
                    type="button"
                    onClick={handlePlay}
                    className="mt-6 flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-teal-800 shadow hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                    {playingThis ? (
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
                        </svg>
                    ) : (
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                    {playingThis ? 'Pause' : `Écouter la sourate ${surah.number}`}
                </button>

                {/* Outils de lecture */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    <label className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-2" title="Taille du texte">
                        <span className="font-serif text-sm italic">A</span>
                        <input
                            type="range"
                            min={1}
                            max={5}
                            step={0.5}
                            value={fontSize}
                            onChange={(e) => setFontSize(parseFloat(e.target.value))}
                            className="w-24 cursor-pointer accent-white"
                        />
                        <span className="font-serif text-lg">A</span>
                    </label>

                    {mode === 'reading' && (
                        <label
                            className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-2"
                            title="Interligne"
                        >
                            <span className="text-xs">↕</span>
                            <input
                                type="range"
                                min={1.2}
                                max={3.5}
                                step={0.1}
                                value={lineHeight}
                                onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                                className="w-16 cursor-pointer accent-white"
                            />
                        </label>
                    )}

                    <button
                        type="button"
                        onClick={() => setMode(mode === 'verse' ? 'reading' : 'verse')}
                        title="Basculer le mode d'affichage"
                        className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                            mode === 'reading'
                                ? 'bg-white text-teal-800'
                                : 'border-white/40 text-white hover:bg-white/15'
                        }`}
                    >
                        {mode === 'reading' ? 'Lecture' : 'Verset'}
                    </button>
                </div>
            </div>

            {/* Contenu */}
            {mode === 'reading' ? (
                <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8 dark:border-stone-800 dark:bg-stone-900">
                    {surah.number !== 9 && surah.number !== 1 && (
                        <p dir="rtl" className="font-arabic text-center text-2xl text-gold" style={{ margin: '0 0 28px' }}>
                            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                        </p>
                    )}
                    <div
                        dir="rtl"
                        className="text-justify font-arabic text-stone-800 dark:text-stone-100"
                        style={{ lineHeight, wordSpacing: '2px' }}
                    >
                        {ayahs.map((ayah, i) => {
                            const pageBreak = i > 0 && ayah.page !== ayahs[i - 1].page;
                            return (
                                <Fragment key={ayah.id}>
                                    {pageBreak && (
                                        <div className="my-9 flex select-none items-center gap-3.5">
                                            <span className="h-px flex-1 bg-[linear-gradient(90deg,transparent,var(--color-gold-soft)_20%,var(--color-gold-soft)_80%,transparent)]" />
                                            <span className="whitespace-nowrap text-xs font-bold tracking-wider text-gold">
                                                — Page {ayah.page} —
                                            </span>
                                            <span className="h-px flex-1 bg-[linear-gradient(90deg,transparent,var(--color-gold-soft)_20%,var(--color-gold-soft)_80%,transparent)]" />
                                        </div>
                                    )}
                                    <span
                                        id={`ayah-${ayah.number_in_surah}`}
                                        data-ayah={ayah.number_in_surah}
                                        style={{ scrollMarginTop: '6rem', ...(highlightAyah === ayah.number_in_surah ? { boxShadow: '0 0 0 3px rgba(14,116,144,0.5)', borderRadius: '1rem' } : {}) }}
                                    >
                                        <span style={{ fontSize: `${fontRem}rem` }}>{ayah.text_ar}</span>
                                        <AyahStar number={ayah.number_in_surah} />
                                    </span>
                                </Fragment>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {ayahs.map((ayah) => (
                        <article
                            key={ayah.id}
                            id={`ayah-${ayah.number_in_surah}`}
                            data-ayah={ayah.number_in_surah}
                            className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900"
                            style={{ scrollMarginTop: '6rem' }}
                        >
                            <div className="flex items-start gap-3">
                                <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-teal-50 text-sm font-semibold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                                    {ayah.number_in_surah}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-right font-arabic leading-[2.2] text-stone-800 dark:text-stone-100" style={{ fontSize: `${fontRem}rem` }}>
                                        {ayah.text_ar}
                                    </p>
                                    {pickTranslation(ayah, lang) && (
                                        <p className="mt-2 border-t border-stone-100 pt-2 text-sm text-stone-600 dark:border-stone-800 dark:text-stone-400">
                                            {pickTranslation(ayah, lang)}
                                        </p>
                                    )}
                                </div>
                                <div className="flex shrink-0 flex-col gap-2">
                                    <FavoriteButton
                                        type="ayah"
                                        id={`${surah.number}:${ayah.number_in_surah}`}
                                        size="sm"
                                        className="shrink-0"
                                    />
                                    <ShareButton type="ayah" id={ayah.id} size="sm" className="shrink-0" />
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>

        <form
            onSubmit={handleGoToAyah}
            className="fixed bottom-28 right-4 z-40 flex items-center gap-2 rounded-xl bg-white shadow-xl ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-stone-700"
        >
            <input
                type="number"
                min={1}
                max={ayahs.length}
                value={goToAyah}
                onChange={(e) => setGoToAyah(e.target.value)}
                placeholder="Verset #"
                aria-label="Aller au verset"
                className="w-24 rounded-l-xl bg-transparent px-3 py-2 text-sm text-stone-800 shadow-sm outline-none dark:text-stone-100 dark:placeholder:text-stone-500"
            />
            <button
                type="submit"
                className="rounded-r-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
            >
                →
            </button>
        </form>
        </>
    );
}

Surah.layout = (page) => <AppLayout>{page}</AppLayout>;