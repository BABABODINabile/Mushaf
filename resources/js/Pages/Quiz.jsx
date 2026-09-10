import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '../components/AppLayout';
import { usePreferences } from '../components/PreferencesContext';
import { pickName } from '../lib/translation';

const i18n = {
    fr: {
        title: 'Quiz du Coran',
        subtitle: 'Devinez la sourate à partir du verset arabe',
        start: 'Commencer',
        question: 'Question',
        of: 'sur',
        next: 'Suivant',
        finish: 'Terminer',
        correct: 'Bonne réponse !',
        wrong: 'Mauvaise réponse',
        loading: 'Chargement des questions...',
        duration: 'Durée',
        configCount: 'Nombre de questions',
        resultTitle: 'Résultat',
        correctAnswers: 'bonnes réponses',
        replayQuiz: 'Rejouer',
        home: 'Accueil',
        errorValidation: 'Erreur de validation',
        errorNetwork: 'Erreur réseau',
        excellent: 'Excellent !',
        good: 'Bien joué !',
        tryAgain: 'Essaie encore, tu vas y arriver !',
        perfect: 'Masha\u2019Allah !',
        bestScore: 'Meilleur score',
        pressToValidate: 'Validé !',
        weeklyTop: 'Top 10 de la semaine',
        isYou: '(vous)',
        yourRank: 'Votre rang',
        typeTitle: 'Choisissez le type de quiz',
        verseName: 'Verset → Sourate',
        verseDesc: 'Devinez la sourate d\u2019après le verset arabe (4 choix)',
        verseAllName: 'Verset → Sourate (liste)',
        verseAllDesc: 'Retrouvez la sourate parmi les 114',
        surahFirstName: 'Sourate → Premier verset',
        surahFirstDesc: 'Reconnaissez le premier verset d\u2019une sourate',
        ayahSurahName: 'Traduction → Sourate',
        ayahSurahDesc: 'Retrouvez la sourate d\u2019après la traduction',
        juzName: 'Juz → Sourate',
        juzDesc: 'Trouvez la sourate d\u2019un verset grâce à son juz',
        revealedName: 'Révélation',
        revealedDesc: 'Mekkoise ou médinoise ?',
        searchPlaceholder: 'Rechercher une sourate…',
        typeName: 'Type',
    },
    en: {
        title: 'Quran Quiz',
        subtitle: 'Guess the surah from the Arabic verse',
        start: 'Start',
        question: 'Question',
        of: 'of',
        next: 'Next',
        finish: 'Finish',
        correct: 'Correct answer!',
        wrong: 'Wrong answer',
        loading: 'Loading questions...',
        duration: 'Duration',
        configCount: 'Number of questions',
        resultTitle: 'Result',
        correctAnswers: 'correct answers',
        replayQuiz: 'Replay',
        home: 'Home',
        errorValidation: 'Validation error',
        errorNetwork: 'Network error',
        excellent: 'Excellent!',
        good: 'Well done!',
        tryAgain: 'Try again, you can do it!',
        perfect: 'Masha\u2019Allah!',
        bestScore: 'Best score',
        pressToValidate: 'Validated!',
        weeklyTop: 'Weekly Top 10',
        isYou: '(you)',
        yourRank: 'Your rank',
        typeTitle: 'Choose your quiz type',
        verseName: 'Verse → Surah',
        verseDesc: 'Guess the surah from the Arabic verse (4 choices)',
        verseAllName: 'Verse → Surah (list)',
        verseAllDesc: 'Find the surah among the 114',
        surahFirstName: 'Surah → First verse',
        surahFirstDesc: 'Recognize the first verse of a surah',
        ayahSurahName: 'Translation → Surah',
        ayahSurahDesc: 'Reach the surah from the translation',
        juzName: 'Juz → Surah',
        juzDesc: 'Find the surah of a verse thanks to its juz',
        revealedName: 'Revelation',
        revealedDesc: 'Meccan or Medinan?',
        searchPlaceholder: 'Search surah…',
        typeName: 'Type',
    },
    ar: {
        title: 'اختبار القرآن',
        subtitle: 'خمّن السورة من الآية العربية',
        start: 'ابدأ',
        question: 'سؤال',
        of: 'من',
        next: 'التالي',
        finish: 'إنهاء',
        correct: 'إجابة صحيحة!',
        wrong: 'إجابة خاطئة',
        loading: 'جاري تحميل الأسئلة...',
        duration: 'المدة',
        configCount: 'عدد الأسئلة',
        resultTitle: 'النتيجة',
        correctAnswers: 'إجابات صحيحة',
        replayQuiz: 'إعادة',
        home: 'الرئيسية',
        errorValidation: 'خطأ في التحقق',
        errorNetwork: 'خطأ في الشبكة',
        excellent: 'ممتاز!',
        good: 'أحسنت!',
        tryAgain: 'حاول مرة أخرى، ستنجح إن شاء الله!',
        perfect: 'ما شاء الله!',
        bestScore: 'أفضل نتيجة',
        pressToValidate: 'تم التحقق!',
        weeklyTop: 'الأكثر تميزًا هذا الأسبوع',
        isYou: '(أنت)',
        yourRank: 'ترتيبك',
        typeTitle: 'اختر نوع الاختبار',
        verseName: 'آية ← سورة',
        verseDesc: 'خمّن السورة من الآية العربية (4 خيارات)',
        verseAllName: 'آية ← سورة (قائمة)',
        verseAllDesc: 'ابحث عن السورة بين الـ 114',
        surahFirstName: 'سورة ← أول آية',
        surahFirstDesc: 'تعرّف على أول آية من سورة',
        ayahSurahName: 'ترجمة ← سورة',
        ayahSurahDesc: 'توصّل إلى السورة من الترجمة',
        juzName: 'جزء ← سورة',
        juzDesc: 'جد سورة الآية عبر الجزء',
        revealedName: 'النزول',
        revealedDesc: 'مكية أم مدنية؟',
        searchPlaceholder: 'ابحث عن سورة…',
        typeName: 'النوع',
    },
};

const COUNT_OPTIONS = [5, 10, 20];

const TYPE_OPTIONS = [
    { key: 'verse', nameKey: 'verseName', descKey: 'verseDesc' },
    { key: 'verse_all', nameKey: 'verseAllName', descKey: 'verseAllDesc' },
    { key: 'surah_first_ayah', nameKey: 'surahFirstName', descKey: 'surahFirstDesc' },
    { key: 'ayah_surah_name', nameKey: 'ayahSurahName', descKey: 'ayahSurahDesc' },
    { key: 'juz_surah', nameKey: 'juzName', descKey: 'juzDesc' },
    { key: 'revealed', nameKey: 'revealedName', descKey: 'revealedDesc' },
];

const TYPE_ICONS = {
    verse: 'M12 2l2.4 7.2H22l-6 4.6 2.3 7.2-6.3-4.5-6.3 4.5L8 13.8 2 9.2h7.6z',
    verse_all: 'M4 6h16M4 12h16M4 18h10',
    surah_first_ayah: 'M4 5l7 7-7 7M13 5h7M13 12h7M13 19h7',
    ayah_surah_name: 'M4 6h16M4 12h16M4 18h10',
    juz_surah: 'M12 3v18M5 6h6M5 18h6M14 6h5M14 18h5',
    revealed: 'M7 14a5 5 0 1 1 10 0',
};

const CONFETTI_COLORS = ['#0f766e', '#a9792c', '#d9bd84', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

function formatTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}s`;
}

function HeroCorners({ className }) {
    return (
        <>
            {['tl', 'tr', 'bl', 'br'].map((pos) => (
                <svg
                    key={pos}
                    className={`pointer-events-none absolute h-16 w-16 opacity-30 ${className ?? ''} ${
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

function Confetti() {
    const pieces = useRef(
        Array.from({ length: 18 }, (_, i) => ({
            left: `${(i * 5.5) + Math.random() * 3}%`,
            width: Math.random() > 0.5 ? '9px' : '6px',
            height: Math.random() > 0.5 ? '14px' : '9px',
            color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            delay: `${(i % 5) * 0.12}s`,
            duration: `${2.4 + Math.random() * 1.6}s`,
        })),
    ).current;

    return (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-10" aria-hidden="true">
            {pieces.map((p, i) => (
                <span
                    key={i}
                    className="absolute rounded-sm"
                    style={{
                        left: p.left,
                        width: p.width,
                        height: p.height,
                        backgroundColor: p.color,
                        animation: `confetti-fall ${p.duration} ${p.delay} ease-in forwards`,
                    }}
                />
            ))}
        </div>
    );
}

function ProgressBar({ current, total }) {
    const pct = total > 0 ? (current / total) * 100 : 0;
    return (
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
            <div
                className="h-full rounded-full bg-gradient-to-r from-teal-600 to-emerald-500 transition-all duration-700 ease-out dark:from-teal-500 dark:to-emerald-400"
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}

function ConfigScreen({ t, onStart, error, weeklyTop, myRank }) {
    const [count, setCount] = useState(10);
    const [type, setType] = useState('verse');

    return (
        <div className="mx-auto max-w-md space-y-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-800 to-emerald-900 p-8 text-center shadow-lg">
                <HeroCorners className="stroke-gold-soft" />
                <span className="pointer-events-none absolute -bottom-8 -right-8 text-[10rem] leading-none text-white/10 select-none" aria-hidden="true">
                    ﷽
                </span>

                <div className="relative">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold-soft backdrop-blur-sm">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2-6.3-4.5-6.3 4.5L8 13.8 2 9.2h7.6z" />
                        </svg>
                        Quiz
                    </span>
                    <h1 className="mt-4 font-serif text-3xl font-bold text-white">{t.title}</h1>
                    <p className="mt-2 text-sm leading-relaxed text-teal-100">{t.subtitle}</p>
                </div>
            </div>

            {error && (
                <div className="animate-[fadeInUp_0.3s_ease] rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-400">
                    {error}
                </div>
            )}

            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <div className="mb-3 flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-gold" aria-hidden="true" />
                    <label className="text-xs font-bold uppercase tracking-[0.16em] text-gold">
                        {t.configCount}
                    </label>
                </div>
                <div className="flex gap-3">
                    {COUNT_OPTIONS.map((n) => (
                        <button
                            key={n}
                            type="button"
                            onClick={() => setCount(n)}
                            className={`flex-1 rounded-xl px-4 py-4 text-xl font-bold transition-all duration-200 ${
                                count === n
                                    ? 'bg-gradient-to-br from-teal-700 to-emerald-700 text-white shadow-md ring-2 ring-gold-soft ring-offset-2 ring-offset-white dark:ring-offset-stone-900'
                                    : 'bg-stone-100 text-stone-600 hover:-translate-y-0.5 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                            }`}
                        >
                            {n}
                        </button>
                    ))}
                </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <div className="mb-3 flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-gold" aria-hidden="true" />
                    <label className="text-xs font-bold uppercase tracking-[0.16em] text-gold">
                        {t.typeTitle}
                    </label>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {TYPE_OPTIONS.map((opt) => (
                        <button
                            key={opt.key}
                            type="button"
                            onClick={() => setType(opt.key)}
                            className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all duration-200 ${
                                type === opt.key
                                    ? 'border-gold-soft bg-gold/5 shadow-md'
                                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:hover:bg-stone-800'
                            }`}
                        >
                            <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${type === opt.key ? 'bg-gradient-to-br from-teal-700 to-emerald-700 text-white' : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'}`}>
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d={TYPE_ICONS[opt.key]} />
                                </svg>
                            </span>
                            <span className="min-w-0">
                                <span className={`block text-sm font-bold ${type === opt.key ? 'text-teal-800 dark:text-teal-300' : 'text-stone-800 dark:text-stone-100'}`}>
                                    {t[opt.nameKey]}
                                </span>
                                <span className="mt-0.5 block text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                                    {t[opt.descKey]}
                                </span>
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {weeklyTop?.length > 0 && (
                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                    <p className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-gold">
                        <span aria-hidden="true">🏆</span> <span>—</span> {t.weeklyTop} <span>—</span>
                    </p>
                    <ol className="mt-3 space-y-1.5">
                        {weeklyTop.slice(0, 3).map((entry) => (
                            <li key={`${entry.rank}-${entry.user}`} className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${entry.isMe ? 'bg-gradient-to-r from-teal-700 to-emerald-700 font-semibold text-white' : 'bg-stone-50 dark:bg-stone-800'}`}>
                                <span className="flex min-w-0 items-center gap-2">
                                    <span className="w-6 shrink-0 text-center font-bold text-gold">{['🥇', '🥈', '🥉'][entry.rank - 1]}</span>
                                    <span className={`truncate ${entry.isMe ? 'text-white' : 'text-stone-700 dark:text-stone-300'}`}>{entry.user}</span>
                                    {entry.isMe && <span className="shrink-0 text-xs text-teal-100">{t.isYou}</span>}
                                </span>
                                <span className={`ml-2 shrink-0 font-mono text-xs font-semibold ${entry.isMe ? 'text-white' : 'text-teal-700 dark:text-teal-300'}`}>{entry.correct}</span>
                            </li>
                        ))}
                    </ol>
                    {myRank && (
                        <p className="mt-3 text-center text-xs font-medium text-stone-400 dark:text-stone-500">
                            {t.yourRank} : n°{myRank}
                        </p>
                    )}
                </div>
            )}

            <button
                type="button"
                onClick={() => onStart(count, type)}
                className="group w-full rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-700 px-5 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.99] dark:from-teal-600 dark:to-emerald-600"
            >
                <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                    {t.start}
                </span>
            </button>
        </div>
    );
}

function SurahListPicker({ surahs, lang, selectedId, onSelect }) {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return surahs;
        return surahs.filter((s) => {
            const num = String(s.number);
            const nameFr = (s.name_fr ?? '').toLowerCase();
            const nameEn = (s.name_en ?? '').toLowerCase();
            const nameAr = s.name_ar ?? '';
            return num.includes(q) || nameFr.includes(q) || nameEn.includes(q) || nameAr.includes(q);
        });
    }, [surahs, query]);

    return (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-900">
            <div className="border-b border-stone-200 p-3 dark:border-stone-700">
                <div className="flex items-center gap-2 rounded-xl bg-stone-100 px-3 py-2 dark:bg-stone-800">
                    <svg className="h-4 w-4 shrink-0 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Rechercher une sourate…"
                        aria-label="Rechercher une sourate"
                        className="w-full bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400 dark:text-stone-100 dark:placeholder:text-stone-500"
                    />
                </div>
            </div>
            <ul className="max-h-72 overflow-y-auto">
                {filtered.map((s) => {
                    const active = String(s.number) === String(selectedId);
                    return (
                        <li key={s.number}>
                            <button
                                type="button"
                                onClick={() => onSelect(String(s.number))}
                                className={`flex w-full items-center gap-3 border-b border-stone-100 px-4 py-2.5 text-left transition last:border-0 dark:border-stone-800 ${
                                    active
                                        ? 'bg-teal-50 dark:bg-teal-900/30'
                                        : 'hover:bg-stone-50 dark:hover:bg-stone-800/60'
                                }`}
                            >
                                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${active ? 'bg-teal-700 text-white' : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'}`}>
                                    {s.number}
                                </span>
                                <span className="flex min-w-0 flex-1 flex-col">
                                    <span className="truncate text-right font-arabic text-sm font-medium text-stone-800 dark:text-stone-100">
                                        {s.name_ar}
                                    </span>
                                    <span className="text-xs text-stone-400">{pickName(s, lang)}</span>
                                </span>
                            </button>
                        </li>
                    );
                })}
                {filtered.length === 0 && (
                    <li className="px-4 py-6 text-center text-sm text-stone-400">—</li>
                )}
            </ul>
        </div>
    );
}

function PlayScreen({ questions, t, surahs, lang, onFinish }) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [validated, setValidated] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const timerRef = useRef(null);
    const autoNextRef = useRef(null);

    const question = questions[currentIdx];
    const isLast = currentIdx === questions.length - 1;
    const isListType = question.options.length === 0;
    const isRevealed = question.type === 'revealed';
    const isVerbosePrompt = question.type === 'ayah_surah_name' || question.type === 'surah_first_ayah' || question.type === 'revealed';
    const isArabicPrompt = question.type === 'verse' || question.type === 'verse_all' || question.type === 'juz_surah' || question.type === 'surah_first_ayah' || question.type === 'revealed';

    useEffect(() => {
        timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
        return () => {
            clearInterval(timerRef.current);
            clearTimeout(autoNextRef.current);
        };
    }, []);

    const commitAnswer = useCallback((optionId) => {
        if (validated) return;
        setSelectedId(optionId);
        setValidated(true);
        setAnswers((prev) => [...prev, { id: question.id, selectedOptionId: optionId }]);
    }, [validated, question]);

    const selectOption = useCallback((optionId) => {
        if (validated) return;
        commitAnswer(optionId);
        if (optionId === question.correctOptionId) {
            autoNextRef.current = setTimeout(() => handleNextRef.current(), 1200);
        }
    }, [validated, question, commitAnswer]);

    const handleValidate = useCallback(() => {
        if (!selectedId || validated) return;
        commitAnswer(selectedId);
    }, [selectedId, validated, commitAnswer]);

    const handleNext = useCallback(() => {
        clearTimeout(autoNextRef.current);
        if (isLast) {
            clearInterval(timerRef.current);
            onFinish([...answers], elapsed);
        } else {
            setCurrentIdx((i) => i + 1);
            setSelectedId(null);
            setValidated(false);
        }
    }, [isLast, answers, elapsed, onFinish]);

    const handleNextRef = useRef(handleNext);
    handleNextRef.current = handleNext;

    const isCorrect = validated && selectedId === question.correctOptionId;

    const optionClass = (optId) => {
        if (validated) {
            if (optId === question.correctOptionId) {
                return 'border-emerald-500 bg-emerald-50 shadow-md dark:border-emerald-400 dark:bg-emerald-900/20';
            }
            if (optId === selectedId) {
                return 'border-rose-500 bg-rose-50 dark:border-rose-400 dark:bg-rose-900/20';
            }
            return 'border-stone-200 bg-stone-50 opacity-60 dark:border-stone-700 dark:bg-stone-800';
        }
        return optId === selectedId
            ? 'border-teal-600 bg-teal-50 shadow-md dark:border-teal-400 dark:bg-teal-900/20'
            : 'border-stone-200 bg-white text-stone-800 hover:-translate-y-0.5 hover:border-gold-soft hover:shadow-md dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:border-gold-soft';
    };

    const optionLabelClass = (optId) => {
        if (validated) {
            if (optId === question.correctOptionId) return 'text-emerald-700 dark:text-emerald-300';
            if (optId === selectedId) return 'text-rose-700 dark:text-rose-300';
            return 'text-stone-400 dark:text-stone-500';
        }
        return optId === selectedId
            ? 'text-teal-700 dark:text-teal-300'
            : 'text-stone-800 dark:text-stone-100';
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex items-center justify-between">
                <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                    {t.question} {currentIdx + 1} {t.of} {questions.length}
                </span>
                <div className="flex items-center gap-2">
                    <span className="hidden rounded-full bg-gold/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold sm:inline">
                        {t[Object.values(TYPE_OPTIONS).find((o) => o.key === question.type)?.nameKey] ?? ''}
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-sm font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                        <svg className="h-3.5 w-3.5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l3 3" />
                        </svg>
                        {formatTime(elapsed)}
                    </span>
                </div>
            </div>

            <ProgressBar current={currentIdx + 1} total={questions.length} />

            <div key={question.id} className="space-y-6">
                <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-gradient-to-b from-white to-stone-50 p-6 shadow-sm dark:border-stone-700 dark:from-stone-900 dark:to-stone-900/50">
                    <HeroCorners className="stroke-gold-soft" />
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-700 to-emerald-700 shadow-inner">
                        <svg className="h-5 w-5 text-gold-soft" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d={TYPE_ICONS[question.type] ?? TYPE_ICONS.verse} />
                        </svg>
                    </div>
                    {question.hint && (
                        <span className="mt-3 inline-flex rounded-full bg-gold/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold">
                            {question.hint}
                        </span>
                    )}
                    <p className={`mt-4 ${isVerbosePrompt ? 'text-center text-xl font-semibold leading-relaxed text-stone-800 dark:text-stone-100' : 'text-center text-3xl leading-[2.2]'} ${isArabicPrompt ? 'font-arabic' : ''}`}>
                        {question.prompt}
                    </p>
                </div>

                {isListType ? (
                    <SurahListPicker surahs={surahs} lang={lang} selectedId={selectedId} onSelect={selectOption} />
                ) : (
                    <div className="space-y-3">
                        {question.options.map((opt, i) => (
                            <button
                                key={`${question.id}-${opt.id}`}
                                type="button"
                                onClick={() => selectOption(opt.id)}
                                className={`w-full rounded-xl border-2 px-5 py-4 transition-all duration-200 active:scale-[0.99] ${optionClass(opt.id)} ${optionLabelClass(opt.id)} ${isRevealed ? 'py-6 text-center text-xl font-bold' : 'font-arabic'} text-right ${isRevealed ? 'text-center' : ''} ${validated && opt.id === question.correctOptionId ? 'animate-[popIn_0.35s_ease]' : ''} ${validated && opt.id === selectedId && !isCorrect ? 'animate-[shake_0.4s_ease]' : ''}`}
                                style={!validated ? { animation: `fadeInUp 0.3s ease ${i * 70}ms backwards` } : undefined}
                            >
                                <span className="flex items-center justify-between gap-3">
                                    <span className="flex items-center justify-center">
                                        {validated && opt.id === question.correctOptionId && (
                                            <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                                                <path d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                        {validated && opt.id === selectedId && !isCorrect && (
                                            <svg className="h-5 w-5 text-rose-600 dark:text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                                                <path d="M6 6l12 12M18 6L6 18" />
                                            </svg>
                                        )}
                                    </span>
                                    <span className="flex-1">{opt.label}</span>
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {validated && (
                    <div className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-sm font-semibold ${
                        isCorrect
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                    } animate-[popIn_0.35s_ease]`}>
                        {isCorrect ? (
                            <>
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                                    <path d="M5 13l4 4L19 7" />
                                </svg>
                                {t.correct}
                            </>
                        ) : (
                            <>
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                                    <path d="M6 6l12 12M18 6L6 18" />
                                </svg>
                                {t.wrong}
                            </>
                        )}
                    </div>
                )}

                <div className="flex gap-3">
                    {!validated ? (
                        <button
                            type="button"
                            onClick={handleValidate}
                            disabled={!selectedId}
                            className="flex-1 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 px-5 py-4 font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 dark:from-teal-600 dark:to-emerald-600"
                        >
                            {t.pressToValidate}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="flex-1 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 px-5 py-4 font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 dark:from-teal-600 dark:to-emerald-600"
                        >
                            <span className="flex items-center justify-center gap-2">
                                {isLast ? t.finish : t.next}
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                    <path d="M5 12h14M13 6l6 6-6 6" />
                                </svg>
                            </span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function ResultScreen({ result, t, onReplay, onHome }) {
    const pct = result.percentage ?? (result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0);

    const inTop10 = !!result.weeklyTop?.some((row) => row.isMe);

    const encouragement = pct === 100
        ? t.perfect
        : pct >= 70
            ? t.excellent
            : pct >= 40
                ? t.good
                : t.tryAgain;

    const rankIcon = (rank) => (rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank);

    return (
        <div className="mx-auto max-w-md space-y-6 text-center">
            {pct >= 70 && <Confetti />}

            <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">{t.resultTitle}</h2>

                {result.error ? (
                    <div className="mt-6 space-y-4">
                        <div className="rounded-xl bg-rose-100 px-4 py-3 text-sm font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                            {result.error}
                        </div>
                        {result.durationSeconds > 0 && (
                            <div className="flex items-center justify-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                                <span>{t.duration}:</span>
                                <span className="font-medium text-stone-700 dark:text-stone-300">{formatTime(result.durationSeconds)}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="relative mx-auto mt-6 flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-teal-700 to-emerald-800 text-white shadow-lg animate-[glow-pulse_2.5s_ease-in-out_infinite]">
                            <div className="flex items-baseline gap-1">
                                <span className="font-serif text-5xl font-bold">{result.correct}</span>
                                <span className="text-xl text-teal-200">/ {result.total}</span>
                            </div>
                        </div>
                        <p className="mt-3 text-sm font-medium text-stone-500 dark:text-stone-400">
                            {result.correct} {t.correctAnswers}
                        </p>

                        <p className="mt-4 font-serif text-xl font-semibold text-gold">
                            {encouragement}
                        </p>

                        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                            <span>{t.duration}:</span>
                            <span className="font-medium text-stone-700 dark:text-stone-300">{formatTime(result.durationSeconds)}</span>
                        </div>

                        {result.percentage !== undefined && (
                            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-700 to-emerald-700 px-5 py-1.5 text-sm font-bold text-white shadow-md">
                                {result.percentage}%
                            </div>
                        )}

                        {result.bestScore && (
                            <div className="mt-5 rounded-xl border border-gold-soft/40 bg-cream/40 px-4 py-3 dark:bg-gold/10">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gold">{t.bestScore}</p>
                                <p className="mt-1 font-semibold text-stone-700 dark:text-stone-300">
                                    {result.bestScore.correct}/{result.bestScore.total} ({result.bestScore.percentage}%)
                                </p>
                            </div>
                        )}

                        {result.weeklyTop?.length > 0 && (
                            <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-4 text-left dark:border-stone-700 dark:bg-stone-800/50">
                                <p className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-gold">
                                    <span aria-hidden="true">🏆</span> <span>—</span> {t.weeklyTop} <span>—</span>
                                </p>
                                <ol className="mt-3 space-y-1.5">
                                    {result.weeklyTop.map((entry) => (
                                        <li
                                            key={`${entry.rank}-${entry.user}`}
                                            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                                                entry.isMe
                                                    ? 'bg-gradient-to-r from-teal-700 to-emerald-700 font-semibold text-white shadow-md'
                                                    : 'bg-white dark:bg-stone-900'
                                            }`}
                                        >
                                            <span className="flex min-w-0 items-center gap-2">
                                                <span className="w-6 shrink-0 text-center font-bold text-gold">{rankIcon(entry.rank)}</span>
                                                <span className={`truncate ${entry.isMe ? 'text-white' : 'text-stone-700 dark:text-stone-300'}`}>
                                                    {entry.user}
                                                </span>
                                                {entry.isMe && (
                                                    <span className={`shrink-0 text-xs ${entry.isMe ? 'text-teal-100' : 'text-stone-400'}`}>
                                                        {t.isYou}
                                                    </span>
                                                )}
                                            </span>
                                            <span className={`ml-2 shrink-0 font-mono text-xs font-semibold ${entry.isMe ? 'text-white' : 'text-teal-700 dark:text-teal-300'}`}>
                                                {entry.correct}
                                            </span>
                                        </li>
                                    ))}
                                </ol>
                                {result.myRank && !inTop10 && (
                                    <p className="mt-3 text-center text-xs font-medium text-stone-400 dark:text-stone-500">
                                        {t.yourRank} : n°{result.myRank}
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onReplay}
                    className="flex-1 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 px-5 py-4 font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 dark:from-teal-600 dark:to-emerald-600"
                >
                    <span className="flex items-center justify-center gap-2">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                            <path d="M3 3v5h5" />
                        </svg>
                        {t.replayQuiz}
                    </span>
                </button>
                <button
                    type="button"
                    onClick={onHome}
                    className="flex-1 rounded-xl border border-stone-200 bg-white px-5 py-4 font-semibold text-stone-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-soft hover:text-gold hover:shadow-md dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-gold-soft dark:hover:text-gold-soft"
                >
                    {t.home}
                </button>
            </div>
        </div>
    );
}

export default function Quiz({ isLoggedIn, bestScore, weeklyTop, myRank, surahs }) {
    const { lang } = usePreferences();
    const t = i18n[lang] || i18n.fr;

    const [screen, setScreen] = useState('config');
    const [questions, setQuestions] = useState([]);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleStart = async (count, type) => {
        setScreen('loading');
        setError(null);
        try {
            const resp = await fetch('/api/quiz/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-XSRF-TOKEN': getCsrfToken() },
                body: JSON.stringify({ count, type, lang }),
            });
            const data = await resp.json();
            if (!resp.ok) {
                setError(data.message || t.errorValidation);
                setScreen('config');
                return;
            }
            setQuestions(data.questions);
            setScreen('play');
        } catch {
            setError(t.errorNetwork);
            setScreen('config');
        }
    };

    const handleFinish = async (answers, durationSeconds) => {
        try {
            const resp = await fetch('/api/quiz/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-XSRF-TOKEN': getCsrfToken() },
                body: JSON.stringify({ durationSeconds, answers }),
            });
            const data = await resp.json();
            if (!resp.ok) {
                setResult({ error: data.message || t.errorValidation, durationSeconds });
            } else {
                setResult({ ...data, durationSeconds });
            }
        } catch {
            setResult({ error: t.errorNetwork, durationSeconds });
        }
        setScreen('result');
    };

    return (
        <AppLayout>
            <div className="px-4 py-8 sm:px-6 lg:px-8">
                {screen === 'config' && (
                    <ConfigScreen t={t} onStart={handleStart} error={error} weeklyTop={weeklyTop} myRank={myRank} />
                )}
                {screen === 'loading' && (
                    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-100 border-t-teal-600 dark:border-stone-700 dark:border-t-teal-400" />
                        <p className="text-stone-500 dark:text-stone-400">{t.loading}</p>
                    </div>
                )}
                {screen === 'play' && questions.length > 0 && (
                    <PlayScreen questions={questions} t={t} surahs={surahs} lang={lang} onFinish={handleFinish} />
                )}
                {screen === 'result' && result && (
                    <ResultScreen
                        result={result}
                        t={t}
                        onReplay={() => { setScreen('config'); setResult(null); setQuestions([]); }}
                        onHome={() => router.get('/')}
                    />
                )}
            </div>
        </AppLayout>
    );
}

function getCsrfToken() {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}