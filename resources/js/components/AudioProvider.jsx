import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import Medallion from './Medallion';
import { surahAudioUrl } from '../lib/audio';
import { postJson } from '../lib/http';

const AudioContext = createContext(null);

const STORAGE_KEY = 'mushaf_audio_state';
const REPEAT_MODES = ['none', 'one', 'all'];
const CONTINUE_MODES = ['none', 'next', 'random'];
const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2];

export function useAudio() {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio doit être utilisé à l\'intérieur de <AudioProvider>.');
    }

    return context;
}

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const s = JSON.parse(raw);
        return s && s.url ? s : null;
    } catch {
        return null;
    }
}

export function AudioProvider({ children, auth }) {
    const loggedInRef = useRef(!!auth?.user);
    loggedInRef.current = !!auth?.user;

    const [track, setTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [repeat, setRepeat] = useState('none');
    const [continueMode, setContinueMode] = useState('none');

    const audioRef = useRef(null);
    const playerRef = useRef(null);
    const repeatRef = useRef('none');
    const continueRef = useRef('none');
    const stateRef = useRef({
        url: '',
        title: '',
        reciter: '',
        surahNumber: null,
        r2PublicUrl: '',
        reciterId: '',
        format: 'opus',
        playing: false,
        volume: 0.8,
        rate: 1,
        repeat: 'none',
        continueMode: 'none',
        currentTime: 0,
        closed: false,
    });
    const lastSaveRef = useRef(0);

    const persist = () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateRef.current));
        } catch {
            // stockage indisponible : on ignore
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) {
            return;
        }

        let player;
        let destroyed = false;

        const restored = loadState();
        if (restored) {
            stateRef.current = {
                ...stateRef.current,
                url: restored.url ?? '',
                title: restored.title ?? '',
                reciter: restored.reciter ?? '',
                surahNumber: restored.surahNumber ?? null,
                playing: restored.playing ?? false,
                volume: typeof restored.volume === 'number' ? restored.volume : 0.8,
                rate: typeof restored.rate === 'number' ? restored.rate : 1,
                repeat: restored.repeat ?? 'none',
                continueMode: restored.continueMode ?? 'none',
                currentTime: typeof restored.currentTime === 'number' ? restored.currentTime : 0,
                closed: restored.closed ?? false,
            };
            repeatRef.current = stateRef.current.repeat;
            setRepeat(stateRef.current.repeat);
            continueRef.current = stateRef.current.continueMode;
            setContinueMode(stateRef.current.continueMode);
        }

        const media = () => player?.media;

        const saveNow = () => {
            lastSaveRef.current = Date.now();
            persist();
        };

        const syncServer = () => {
            const s = stateRef.current;
            if (!loggedInRef.current || !s.surahNumber) {
                return;
            }
            postJson('/api/audio-history', {
                surah_number: s.surahNumber,
                reciter_id: s.reciterId,
                position: Math.floor(s.currentTime || 0),
                duration: Math.floor(media()?.duration || s.duration_seconds || 0),
            });
        };

        const handlePlay = () => {
            stateRef.current.playing = true;
            setIsPlaying(true);
            saveNow();
        };
        const handlePause = () => {
            stateRef.current.playing = false;
            setIsPlaying(false);
            saveNow();
            syncServer();
        };
        const handleTime = () => {
            const t = media()?.currentTime || 0;
            setCurrentTime(t);
            stateRef.current.currentTime = t;
            const now = Date.now();
            if (now - lastSaveRef.current > 5000) {
                lastSaveRef.current = now;
                persist();
                syncServer();
            }
        };
        const handleDuration = () => setDuration(media()?.duration || 0);
        const handleEnded = () => {
            if (repeatRef.current === 'one' || repeatRef.current === 'all') {
                player.restart();
                player.play();
                return;
            }

            const mode = continueRef.current;
            if (mode !== 'none' && stateRef.current.surahNumber) {
                const current = stateRef.current.surahNumber;
                let nextNum;
                if (mode === 'random') {
                    nextNum = Math.floor(Math.random() * 114) + 1;
                } else {
                    nextNum = current < 114 ? current + 1 : 1;
                }
                const reciterId = stateRef.current.reciterId;
                const r2Base = stateRef.current.r2PublicUrl;
                const fmt = stateRef.current.format;
                const nextUrl = surahAudioUrl(r2Base, reciterId, nextNum, fmt);
                const nextSurahName = stateRef.current.reciter;
                stateRef.current.url = nextUrl;
                stateRef.current.title = `Sourate ${nextNum}`;
                stateRef.current.surahNumber = nextNum;
                stateRef.current.currentTime = 0;
                stateRef.current.playing = true;
                setTrack({
                    url: nextUrl,
                    title: `Sourate ${nextNum}`,
                    reciter: nextSurahName,
                    surahNumber: nextNum,
                    r2PublicUrl: r2Base,
                    reciterId,
                    format: fmt,
                });
                audio.src = nextUrl;
                setCurrentTime(0);
                playRef.current();
                persist();
                return;
            }

            stateRef.current.playing = false;
            setIsPlaying(false);
            persist();
        };
        const handleVolume = () => {
            stateRef.current.volume = player?.volume ?? 0.8;
            persist();
        };

        import('plyr')
            .then(({ default: Plyr }) => {
                if (destroyed) {
                    return;
                }

                player = new Plyr(audio, {
                    controls: ['play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'settings', 'speed'],
                    settings: ['speed'],
                    speed: { selected: stateRef.current.rate, options: SPEED_OPTIONS },
                    keyboard: { focused: true, global: false },
                    tooltips: { controls: true, seek: true },
                    storage: { enabled: false },
                    volume: stateRef.current.volume,
                    hideControls: false,
                });
                playerRef.current = player;

                player.volume = stateRef.current.volume;
                player.speed = stateRef.current.rate;

                player.on('play', handlePlay);
                player.on('pause', handlePause);
                player.on('timeupdate', handleTime);
                player.on('durationchange', handleDuration);
                player.on('ended', handleEnded);
                player.on('volumechange', handleVolume);
                player.on('ratechange', () => {
                    stateRef.current.rate = player.speed;
                    saveNow();
                });

                // Reprise après rechargement
                if (stateRef.current.url && !stateRef.current.closed) {
                    const restoredUrl = stateRef.current.url;
setTrack({
                url: restoredUrl,
                title: stateRef.current.title,
                reciter: stateRef.current.reciter,
                surahNumber: stateRef.current.surahNumber,
                r2PublicUrl: stateRef.current.r2PublicUrl,
                reciterId: stateRef.current.reciterId,
                format: stateRef.current.format,
            });
                    audio.src = restoredUrl;
                    audio.addEventListener(
                        'loadedmetadata',
                        () => {
                            if (stateRef.current.currentTime > 0 && audio.duration) {
                                audio.currentTime = Math.min(stateRef.current.currentTime, audio.duration);
                            }
                        },
                        { once: true }
                    );
                    if (stateRef.current.playing && !stateRef.current.closed) {
                        player.play().catch(() => {});
                    }
                }
            })
            .catch(() => {
                playerRef.current = null;
            });

        return () => {
            destroyed = true;
            player?.destroy();
            playerRef.current = null;
        };
    }, []);

    // Media Session API (écran verrouillé, touches média du clavier / casque)
    useEffect(() => {
        if (!('mediaSession' in navigator)) {
            return;
        }
        try {
            if (track) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: track.title || 'Coran',
                    artist: track.reciter || 'Récitation du Coran',
                    album: 'Coran — récitation',
                });
            } else {
                navigator.mediaSession.metadata = null;
            }
            navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
        } catch {
            // non supporté : on ignore
        }
    }, [track, isPlaying]);

    useEffect(() => {
        if (!('mediaSession' in navigator)) {
            return;
        }
        const actions = [
            ['play', () => playRef.current()],
            ['pause', () => pauseRef.current()],
            ['previoustrack', () => window.dispatchEvent(new Event('mushaf:audioPrev'))],
            ['nexttrack', () => window.dispatchEvent(new Event('mushaf:audioNext'))],
        ];
        actions.forEach(([action, handler]) => {
            try {
                navigator.mediaSession.setActionHandler(action, handler);
            } catch {
                // action non supportée par le navigateur
            }
        });
    }, []);

    const toggleRepeatRef = useRef();
    useEffect(() => {
        function handleKeyDown(e) {
            const target = e.target;
            if (target instanceof HTMLElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
                return;
            }

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    (isPlaying ? pauseRef : playRef).current?.();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (audioRef.current) {
                        audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
                    }
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (audioRef.current) {
                        audioRef.current.currentTime = Math.min(audioRef.current.duration || 0, audioRef.current.currentTime + 10);
                    }
                    break;
                case 'KeyM':
                    e.preventDefault();
                    if (audioRef.current) {
                        audioRef.current.muted = !audioRef.current.muted;
                    }
                    break;
                case 'KeyR':
                    e.preventDefault();
                    toggleRepeatRef.current?.();
                    break;
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying]);
    toggleRepeatRef.current = () => {};

    const playRef = useRef();
    const pauseRef = useRef();
    playRef.current = () => {
        if (playerRef.current) {
            playerRef.current.play().catch(() => {});
        } else if (audioRef.current) {
            audioRef.current.play().catch(() => {});
        }
    };
    pauseRef.current = () => playerRef.current?.pause();

    const play = (nextTrack) => {
        if (nextTrack) {
            if (nextTrack.url === stateRef.current.url) {
                playRef.current();
                return;
            }
            stateRef.current.url = nextTrack.url;
            stateRef.current.title = nextTrack.title ?? '';
            stateRef.current.reciter = nextTrack.reciter ?? '';
            stateRef.current.surahNumber = nextTrack.surahNumber ?? null;
            stateRef.current.r2PublicUrl = nextTrack.r2PublicUrl ?? stateRef.current.r2PublicUrl;
            stateRef.current.reciterId = nextTrack.reciterId ?? stateRef.current.reciterId;
            stateRef.current.format = nextTrack.format ?? stateRef.current.format;
            stateRef.current.currentTime = nextTrack.position ?? 0;
            stateRef.current.closed = false;
            setTrack(nextTrack);
            const audio = audioRef.current;
            if (audio) {
                audio.src = nextTrack.url;
                setCurrentTime(nextTrack.position ?? 0);
                if (nextTrack.position) {
                    audio.addEventListener(
                        'loadedmetadata',
                        () => {
                            if (audio.duration) {
                                audio.currentTime = Math.min(nextTrack.position ?? 0, audio.duration);
                                stateRef.current.currentTime = audio.currentTime;
                            }
                        },
                        { once: true }
                    );
                }
            }
            playRef.current();
            persist();
            return;
        }
        playRef.current();
    };

    const pause = () => pauseRef.current();
    const toggle = () => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    };

    const stop = () => {
        playerRef.current?.stop();
        stateRef.current.url = '';
        stateRef.current.title = '';
        stateRef.current.reciter = '';
        stateRef.current.surahNumber = null;
        stateRef.current.playing = false;
        stateRef.current.currentTime = 0;
        stateRef.current.closed = true;
        setTrack(null);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        persist();
    };

    const seekTo = (time) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
            stateRef.current.currentTime = time;
        }
    };

    const toggleRepeat = () => {
        const i = REPEAT_MODES.indexOf(repeatRef.current);
        const next = REPEAT_MODES[(i + 1) % REPEAT_MODES.length];
        repeatRef.current = next;
        stateRef.current.repeat = next;
        setRepeat(next);
        persist();
    };
    toggleRepeatRef.current = toggleRepeat;

    const toggleContinue = () => {
        const i = CONTINUE_MODES.indexOf(continueRef.current);
        const next = CONTINUE_MODES[(i + 1) % CONTINUE_MODES.length];
        continueRef.current = next;
        stateRef.current.continueMode = next;
        setContinueMode(next);
        persist();
    };

    const repeatLabel =
        repeat === 'all' ? 'Répéter la liste' : repeat === 'one' ? 'Répéter cette sourate' : 'Répétition : aucune';

    const continueLabel =
        continueMode === 'next'
            ? 'Lecture continue : sourate suivante'
            : continueMode === 'random'
              ? 'Lecture continue : aléatoire'
              : 'Lecture continue : désactivée';

    return (
        <AudioContext.Provider
            value={{
                track,
                isPlaying,
                currentTime,
                duration,
                repeat,
                repeatLabel,
                continueMode,
                continueLabel,
                play,
                pause,
                toggle,
                stop,
                seekTo,
                toggleRepeat,
                toggleContinue,
                r2PublicUrl: stateRef.current.r2PublicUrl,
            }}
        >
            {children}
            {/* Lecteur global persistant, monté une seule fois à la racine */}
            <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
                <div
                    className={`pointer-events-auto mx-auto w-full max-w-3xl px-3 pb-3 sm:px-6 sm:pb-4 ${track ? '' : 'hidden'}`}
                >
                    <div className="rounded-xl bg-white shadow-xl ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-stone-700">
                        <div>
                            {track && (
                                <div className="flex items-center gap-2 border-b border-stone-200 px-3 py-2 dark:border-stone-700">
                                <Medallion className="h-7 w-7 shrink-0" />
                                {track.surahNumber ? (
                                    <Link
                                        href={`/coran/${track.slug ?? track.surahNumber}`}
                                        className="truncate text-sm font-semibold text-stone-800 transition hover:text-gold dark:text-stone-100 dark:hover:text-gold"
                                    >
                                        {track.title}
                                    </Link>
                                ) : (
                                    <p className="truncate text-sm font-semibold text-stone-800 dark:text-stone-100">
                                        {track.title}
                                    </p>
                                )}
                                {track.reciter && (
                                    <p className="hidden shrink-0 truncate text-xs text-stone-500 sm:block dark:text-stone-400">
                                        {track.reciter}
                                    </p>
                                )}
                                <div className="ml-auto flex shrink-0 items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={toggleContinue}
                                        title={continueLabel}
                                        className={`relative grid h-8 w-8 place-items-center rounded-lg border transition ${
                                            continueMode !== 'none'
                                                ? 'border-teal-600 bg-teal-600 text-white'
                                                : 'border-stone-200 text-stone-500 hover:text-teal-600 dark:border-stone-700 dark:text-stone-400'
                                        }`}
                                    >
                                        {continueMode === 'random' ? (
                                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22" />
                                                <path d="m18 2 4 4-4 4" />
                                                <path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2" />
                                                <path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8" />
                                                <path d="m18 14 4 4-4 4" />
                                            </svg>
                                        ) : (
                                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M6 5l9 7-9 7V5z" />
                                                <rect x="16.5" y="5" width="2" height="14" rx="0.6" />
                                            </svg>
                                        )}
                                        {continueMode === 'next' && (
                                            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-white" />
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={toggleRepeat}
                                        title={repeatLabel}
                                        className={`relative grid h-8 w-8 place-items-center rounded-lg border transition ${
                                            repeat !== 'none'
                                                ? 'border-teal-600 bg-teal-600 text-white'
                                                : 'border-stone-200 text-stone-500 hover:text-teal-600 dark:border-stone-700 dark:text-stone-400'
                                        }`}
                                    >
                                        <svg
                                            className="h-4 w-4"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="m17 2 4 4-4 4" />
                                            <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                                            <path d="m7 22-4-4 4-4" />
                                            <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                                        </svg>
                                        {repeat === 'one' && (
                                            <span className="absolute -right-1 -top-1 grid h-3.5 w-3.5 place-items-center rounded-full bg-gold text-[9px] font-bold text-white">
                                                1
                                            </span>
                                        )}
                                    </button>
                                    {track?.surahNumber && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const url = track.r2PublicUrl
                                                    ? `${track.r2PublicUrl}/${track.reciterId}/${String(track.surahNumber).padStart(3, '0')}.${track.format}`
                                                    : null;
                                                if (url) {
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = `quran-${track.surahNumber}.${track.format}`;
                                                    a.target = '_blank';
                                                    a.click();
                                                }
                                            }}
                                            title="Télécharger l'audio"
                                            className="grid h-8 w-8 place-items-center rounded-lg border border-stone-200 text-stone-500 transition hover:text-gold hover:border-gold dark:border-stone-700 dark:text-stone-400"
                                        >
                                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="7 10 12 15 17 10" />
                                                <line x1="12" y1="15" x2="12" y2="3" />
                                            </svg>
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={stop}
                                        title="Fermer le lecteur"
                                        className="grid h-8 w-8 place-items-center rounded-lg border border-stone-200 text-stone-500 transition hover:text-red-500 dark:border-stone-700 dark:text-stone-400"
                                    >
                                        <svg
                                            className="h-4 w-4"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        >
                                            <path d="M18 6 6 18M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                        </div>
                        <audio ref={audioRef} preload="metadata" className="plyr" />
                    </div>
                </div>
            </div>
        </AudioContext.Provider>
    );
}
