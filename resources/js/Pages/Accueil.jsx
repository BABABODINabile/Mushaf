import { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import AppLayout from '../components/AppLayout';
import SeoHead from '../components/SeoHead';
import ShareButton from '../components/ShareButton';
import { useAudio } from '../components/AudioProvider';
import { usePreferences } from '../components/PreferencesContext';
import { surahAudioUrl, savedReciterId } from '../lib/audio';
import { pickTranslation, pickSurahName } from '../lib/translation';
import { formatTime, timeAgo } from '../lib/time';
import { shareOrDownload } from '../lib/shareCard';

function HeroCorners({ className }) {
    return (
        <>
            {['tl', 'tr', 'bl', 'br'].map((pos) => (
                <svg
                    key={pos}
                    className={`absolute h-16 w-16 opacity-40 ${className ?? ''} ${
                        pos === 'tl'
                            ? 'left-4 top-4'
                            : pos === 'tr'
                              ? 'right-4 top-4 -scale-x-100'
                              : pos === 'bl'
                                ? 'bottom-4 left-4 -scale-y-100'
                                : 'bottom-4 right-4 -scale-100'
                    }`}
                    viewBox="0 0 64 64"
                    aria-hidden="true"
                >
                    <path d="M4 60 V20 Q4 4 20 4 H60" />
                    <path d="M4 44 Q4 24 24 24" />
                </svg>
            ))}
        </>
    );
}

const reasons = [
    {
        title: 'Un guide pour la journée',
        text: "Ouvrir le Coran quelques minutes, c'est se donner un point de repère clair avant que la journée n'emporte tout.",
    },
    {
        title: 'Une récompense pour chaque lettre',
        text: 'La tradition rapporte que chaque lettre lue du Coran est comptée comme une bonne action multipliée — un effort jamais perdu.',
    },
    {
        title: 'Un cœur apaisé',
        text: "Le rappel régulier de Dieu est décrit dans le Coran lui-même comme ce qui apaise les cœurs (sourate Ar-Ra'd, 13:28).",
    },
    {
        title: 'Une intercession au Jour dernier',
        text: "Le Coran est décrit comme un compagnon qui intercédera en faveur de celui qui l'a lu et pratiqué.",
    },
];

const features = [
    {
        title: 'Recherche instantanée',
        text: 'Retrouvez une sourate par son nom français ou arabe en tapant simplement quelques lettres.',
    },
    {
        title: 'Confort de lecture',
        text: "Agrandissez le texte arabe, basculez en mode nuit — votre lecture s'adapte à vous, pas l'inverse.",
    },
    {
        title: 'Favoris personnels',
        text: 'Marquez les versets et hadiths qui vous touchent pour les retrouver en un instant.',
    },
    {
        title: 'Rappel quotidien',
        text: 'Un mail bref, chaque jour, pour ne jamais laisser passer une journée sans un mot du Coran.',
    },
];

function Stat({ value, label }) {
    return (
        <div className="text-center">
            <p className="font-serif text-4xl font-semibold text-gold">{value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400">{label}</p>
        </div>
    );
}

function CardGrid({ section, title, cards }) {
    return (
        <>
            <div className="mx-auto mt-16 max-w-2xl text-center">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">{section}</p>
                <h2 className="mt-2 font-serif text-2xl font-semibold text-stone-900 sm:text-3xl dark:text-stone-100">
                    {title}
                </h2>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card, i) => (
                    <div
                        key={card.title}
                        className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
                    >
                        <p className="font-serif text-xl italic text-gold-soft">{String(i + 1).padStart(2, '0')}</p>
                        <h3 className="mt-2 font-serif text-lg font-semibold text-stone-900 dark:text-stone-100">
                            {card.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">{card.text}</p>
                    </div>
                ))}
            </div>
        </>
    );
}

export default function Accueil({ verseOfDay, hadithOfDay }) {
    const { lang } = usePreferences();
    const { auth, reciters, defaultReciter, r2PublicUrl } = usePage().props;
    const { play, seekTo } = useAudio();
    const isLoggedIn = !!auth?.user;

    const [reading, setReading] = useState(null);
    const [audio, setAudio] = useState(null);
    const [readingStats, setReadingStats] = useState(null);
    const [goal, setGoal] = useState(() => {
        const saved = parseInt(localStorage.getItem('mushaf-daily-goal') ?? '5', 10);
        return [5, 10, 20].includes(saved) ? saved : 5;
    });

    const setDailyGoal = (g) => {
        setGoal(g);
        localStorage.setItem('mushaf-daily-goal', String(g));
    };

    useEffect(() => {
        if (!isLoggedIn) {
            return undefined;
        }
        let alive = true;
        Promise.all([
            fetch('/api/reading-history', { headers: { Accept: 'application/json' } }),
            fetch('/api/audio-history', { headers: { Accept: 'application/json' } }),
            fetch('/api/reading/stats', { headers: { Accept: 'application/json' } }),
        ])
            .then(([r1, r2, r3]) => Promise.all([r1.json(), r2.json(), r3.json()]))
            .then(([readingRows, audioRows, stats]) => {
                if (!alive) {
                    return;
                }
                if (Array.isArray(readingRows) && readingRows.length) {
                    setReading(readingRows[0]);
                }
                if (Array.isArray(audioRows) && audioRows.length) {
                    setAudio(audioRows[0]);
                }
                if (stats) {
                    setReadingStats(stats);
                }
            })
            .catch(() => {});
        return () => {
            alive = false;
        };
    }, [isLoggedIn]);

    const resumeAudio = () => {
        if (!audio) {
            return;
        }
        const reciterId =
            audio.reciter_id || savedReciterId(reciters, defaultReciter);
        const reciter = reciters.find((r) => r.id === reciterId) ?? reciters[0];
        if (!reciter || !r2PublicUrl) {
            return;
        }
        play({
            title: `Sourate ${audio.surah_number} — ${audio.surah_name_fr}`,
            reciter: reciter.name,
            surahNumber: audio.surah_number,
            r2PublicUrl,
            reciterId: reciter.id,
            format: reciter.format ?? 'opus',
            url: surahAudioUrl(r2PublicUrl, reciter.id, audio.surah_number, reciter.format ?? 'opus'),
            position: audio.position_seconds,
        });
    };

    const shareWeek = () => {
        if (!readingStats) {
            return;
        }
        shareOrDownload({
            type: 'stats',
            reference: 'Ma semaine de lecture',
            stats: readingStats,
        });
    };

    const goalPct =
        goal > 0 ? Math.min(100, Math.round(((readingStats?.today ?? 0) / goal) * 100)) : 0;

    return (
        <div className="space-y-10">
            <SeoHead
                title="Lire et comprendre le Coran"
                description="Le Coran complet et les hadiths authentiques, pour une lecture posée — et un rappel qui vous retrouve chaque jour."
                path="/"
                schema={{
                    '@context': 'https://schema.org',
                    '@type': 'WebSite',
                    name: 'Mushaf',
                    url: 'https://mushaf.app',
                    potentialAction: {
                        '@type': 'SearchAction',
                        target: 'https://mushaf.app/search?q={search_term_string}',
                        'query-input': 'required name=search_term_string',
                    },
                }}
            />
            {/* Hero */}
            <section className="relative overflow-hidden rounded-3xl border border-stone-200 bg-white p-8 shadow-sm sm:p-10 dark:border-stone-800 dark:bg-stone-900">
                <HeroCorners className="stroke-gold" />

                {verseOfDay && (
                    <>
                        <p className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-gold">
                            <span>—</span> Verset du jour <span>—</span>
                        </p>
                        <Link href={`/coran/${verseOfDay.surah_number}`} className="block px-3 py-2">
                            <p className="text-center font-arabic text-2xl leading-loose text-stone-800 sm:text-3xl dark:text-stone-100">
                                {verseOfDay.text_ar}
                            </p>
                            {pickTranslation(verseOfDay, lang) && (
                                <p className="mx-auto mt-5 max-w-2xl text-center font-serif text-lg italic text-stone-500 dark:text-stone-400">
                                    {pickTranslation(verseOfDay, lang)}
                                </p>
                            )}
                            <p className="mt-4 text-center text-sm font-semibold text-stone-400 transition dark:text-stone-500">
                                Sourate {verseOfDay.surah_number} — {pickSurahName(verseOfDay, lang)}, verset{' '}
                                {verseOfDay.ayah_number}
                            </p>
                        </Link>
                        <div className="mt-2 flex justify-center">
                            <ShareButton type="ayah" id={verseOfDay.id} size="sm" />
                        </div>
                    </>
                )}

                <h1 className="mt-8 text-center font-serif text-3xl font-semibold leading-tight text-stone-900 sm:text-4xl dark:text-stone-100">
                    Un espace calme pour lire, comprendre, revenir.
                </h1>
                <p className="mx-auto mt-3 max-w-xl text-center text-stone-500 dark:text-stone-400">
                    Sakîna réunit le Coran complet et une sélection de hadiths authentiques, pensés pour une lecture
                    posée — et un rappel qui vous retrouve chaque jour, sans bruit.
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <Link
                        href="/coran"
                        className="rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
                    >
                        Ouvrir le Coran
                    </Link>
                    <Link
                        href="/hadiths"
                        className="rounded-xl border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-700 transition hover:border-gold hover:text-gold dark:border-stone-600 dark:text-stone-300"
                    >
                        Parcourir les hadiths
                    </Link>
                </div>
            </section>

            {/* Reprendre la lecture / l'écoute */}
            {isLoggedIn && (reading || audio) && (
                <section className="space-y-5">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">
                            <span>—</span> Reprendre <span>—</span>
                        </p>
                        <h2 className="mt-2 font-serif text-2xl font-semibold text-stone-900 sm:text-3xl dark:text-stone-100">
                            Continuez là où vous vous étiez arrêté
                        </h2>
                    </div>
                    <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
                        {reading && (
                            <Link
                                href={`/coran/${reading.surah_number}#ayah-${reading.last_ayah}`}
                                className="group rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
                            >
                                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    Continuer la lecture
                                </p>
                                <p className="mt-3 font-serif text-lg font-semibold text-stone-900 dark:text-stone-100">
                                    {reading.surah_name_fr}
                                </p>
                                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                                    Verset {reading.last_ayah} · {timeAgo(reading.read_at)}
                                </p>
                            </Link>
                        )}
                        {audio && (
                            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-stone-800 dark:bg-stone-900">
                                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 18V5l12-2v13" />
                                        <circle cx="6" cy="18" r="3" />
                                        <circle cx="18" cy="16" r="3" />
                                    </svg>
                                    Reprendre l'écoute
                                </p>
                                <p className="mt-3 font-serif text-lg font-semibold text-stone-900 dark:text-stone-100">
                                    {audio.surah_name_fr}
                                </p>
                                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                                    {formatTime(audio.position_seconds)} / {formatTime(audio.duration_seconds)} · {timeAgo(audio.listened_at)}
                                </p>
                                <button
                                    type="button"
                                    onClick={resumeAudio}
                                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                    Reprendre
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Ma progression */}
            {isLoggedIn && readingStats && (
                <section className="mx-auto max-w-3xl rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8 dark:border-stone-800 dark:bg-stone-900">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-gold">
                            <span className="text-sm">🔥</span> <span>—</span> Ma progression <span>—</span>
                        </p>
                        <p className="text-xs font-semibold text-stone-400 dark:text-stone-500">
                            {readingStats.weekAyahs} versets cette semaine · {readingStats.weekSurahs} sourates
                        </p>
                    </div>

                    <div className="mt-5 flex items-baseline gap-2">
                        <p className="font-serif text-4xl font-semibold text-stone-900 dark:text-stone-100">
                            {readingStats.today}
                        </p>
                        <p className="text-sm text-stone-500 dark:text-stone-400">
                            / {goal} versets lus aujourd'hui
                        </p>
                    </div>

                    <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ${
                                goalPct >= 100
                                    ? 'bg-gradient-to-r from-gold to-gold-soft'
                                    : 'bg-teal-600'
                            }`}
                            style={{ width: `${goalPct}%` }}
                        />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                            {[5, 10, 20].map((g) => (
                                <button
                                    key={g}
                                    type="button"
                                    onClick={() => setDailyGoal(g)}
                                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                                        goal === g
                                            ? 'bg-teal-700 text-white'
                                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                                    }`}
                                >
                                    Objectif {g}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            {goalPct >= 100 && (
                                <span className="text-xs font-bold text-gold">Objectif atteint 👏</span>
                            )}
                            <button
                                type="button"
                                onClick={shareWeek}
                                className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:border-gold hover:text-gold dark:border-stone-600 dark:text-stone-300 dark:hover:border-gold"
                            >
                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                                    <path d="m16 6-4-4-4 4" />
                                    <path d="M12 2v13" />
                                </svg>
                                Partager ma semaine
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Hadith du jour */}
            {hadithOfDay && (
                <section className="mx-auto max-w-3xl rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8 dark:border-stone-800 dark:bg-stone-900">
                    <p className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-gold">
                        <span>—</span> Hadith du jour <span>—</span>
                    </p>
                    <p className="mt-2 text-center text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                        Hadith n°{hadithOfDay.hadith_number}
                    </p>
                    {hadithOfDay.title && (
                        <p className="mt-1 text-center font-serif text-sm font-semibold text-teal-700 dark:text-teal-300">
                            {hadithOfDay.title}
                        </p>
                    )}
                    <p className="mt-4 text-center font-arabic text-2xl leading-loose text-stone-800 dark:text-stone-100">
                        {hadithOfDay.text_ar}
                    </p>
                    {pickTranslation(hadithOfDay, lang) && (
                        <p className="mx-auto mt-3 max-w-xl text-center font-serif italic text-stone-500 dark:text-stone-400">
                            « {pickTranslation(hadithOfDay, lang)} »
                        </p>
                    )}
                    <p className="mt-4 text-center text-xs font-semibold text-stone-400 dark:text-stone-500">
                        {[hadithOfDay.narrator, hadithOfDay.grade].filter(Boolean).join(' · ')}
                    </p>
                    <div className="mt-3 flex justify-center">
                        <ShareButton type="hadith" id={hadithOfDay.id} size="sm" />
                    </div>
                </section>
            )}

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-x-14 gap-y-6 pt-4">
                <Stat value="114" label="Sourates" />
                <Stat value="6236" label="Versets" />
                <Stat value="40" label="Hadiths choisis" />
                <Stat value="1" label="Rappel par jour" />
            </div>

            {/* Pourquoi commencer */}
            <CardGrid
                section="Pourquoi commencer aujourd'hui"
                title="Quatre bonnes raisons d'ouvrir le Livre"
                cards={reasons}
            />

            {/* Fonctionnalités */}
            <CardGrid section="Bien s'y retrouver" title="Pensé pour une lecture sans friction" cards={features} />
        </div>
    );
}

Accueil.layout = (page) => <AppLayout>{page}</AppLayout>;