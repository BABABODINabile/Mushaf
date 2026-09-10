import { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { useAudio } from './AudioProvider';
import { usePreferences } from './PreferencesContext';
import { pickTranslation, pickName } from '../lib/translation';

export default function ReadingSidebar({ open, onClose }) {
    const [readingHistory, setReadingHistory] = useState([]);
    const [audioHistory, setAudioHistory] = useState([]);
    const { play } = useAudio();
    const { lang } = usePreferences();
    const [loading, setLoading] = useState(false);

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const [rhResp, ahResp] = await Promise.all([
                fetch('/api/reading-history'),
                fetch('/api/audio-history'),
            ]);
            if (rhResp.ok) {
                const data = await rhResp.json();
                setReadingHistory(data.slice(0, 5));
            }
            if (ahResp.ok) {
                const data = await ahResp.json();
                setAudioHistory(data.slice(0, 5));
            }
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (open) {
            fetchHistory();
        }
    }, [open, fetchHistory]);

    function handlePlay(surahNumber, surahSlug) {
        router.get(`/coran/${surahSlug ?? surahNumber}`, {}, {
            onSuccess: () => {
                // small delay for page to render
                setTimeout(() => {
                    const audio = document.querySelector('.plyr audio');
                    if (audio) {
                        const trackData = window._pendingTrack;
                    }
                }, 500);
            },
        });
    }

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-sm"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}
            <div
                className={`fixed right-0 top-0 bottom-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-out dark:bg-stone-900 ${
                    open ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-700">
                    <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                        Mes lectures récentes
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1 text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="overflow-y-auto p-4 space-y-6 max-h-[calc(100vh-60px)]">
                    {loading && (
                        <p className="text-sm text-stone-500">Chargement…</p>
                    )}

                    {!loading && readingHistory.length === 0 && audioHistory.length === 0 && (
                        <p className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
                            Aucune lecture récente.
                        </p>
                    )}

                    {readingHistory.length > 0 && (
                        <section>
                            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-400">
                                Lecture
                            </h3>
                            <ul className="space-y-2">
                                {readingHistory.map((item, i) => (
                                    <li key={`reading-${i}`}>
                                        <button
                                            type="button"
                                            onClick={() => handlePlay(item.surah_number, item.surah_slug)}
                                            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-stone-50 dark:hover:bg-stone-800/50"
                                        >
                                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-teal-50 text-xs font-bold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                                                {item.surah_number}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                                    {item.surah_name_fr}
                                                </p>
                                                <p className="text-xs text-stone-400">
                                                    Verset {item.last_ayah}
                                                </p>
                                            </div>
                                            <span className="shrink-0 text-xs text-stone-400">
                                                {new Date(item.read_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : lang === 'en' ? 'en-US' : 'ar-EG')}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {audioHistory.length > 0 && (
                        <section>
                            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-400">
                                Écoute
                            </h3>
                            <ul className="space-y-2">
                                {audioHistory.map((item, i) => (
                                    <li key={`audio-${i}`}>
                                        <button
                                            type="button"
                                            onClick={() => handlePlay(item.surah_number, item.surah_slug)}
                                            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-stone-50 dark:hover:bg-stone-800/50"
                                        >
                                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gold/10 text-xs font-bold text-gold dark:text-gold-soft">
                                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                                    {item.surah_name_fr}
                                                </p>
                                                <p className="text-xs text-stone-400">
                                                    {Math.floor(item.position_seconds)}s / {item.duration_seconds ? `${item.duration_seconds}s` : '…'}
                                                </p>
                                            </div>
                                            <span className="shrink-0 text-xs text-stone-400">
                                                {new Date(item.listened_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : lang === 'en' ? 'en-US' : 'ar-EG')}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            </div>
        </>
    );
}
