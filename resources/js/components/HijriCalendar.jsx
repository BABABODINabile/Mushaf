import { useEffect, useMemo, useState } from 'react';
import { usePreferences } from './PreferencesContext';
import { formatNumber, hijriMonthGrid, isHijriSupported } from '../lib/hijri';

const i18n = {
    fr: { title: 'Calendrier hidjri', today: "Aujourd'hui", unavailable: 'Calendrier hidjri indisponible sur ce navigateur.' },
    en: { title: 'Hijri calendar', today: 'Today', unavailable: 'Hijri calendar is not available in this browser.' },
    ar: { title: 'التقويم الهجري', today: 'اليوم', unavailable: 'التقويم الهجري غير متوفر في هذا المتصفح.' },
};

function CalendarSkeleton() {
    return (
        <div className="mt-6 space-y-4" aria-hidden="true">
            <div className="mx-auto h-7 w-2/3 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
            <div className="mx-auto h-4 w-1/2 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="h-9 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
                ))}
            </div>
        </div>
    );
}

export default function HijriCalendar() {
    const { lang } = usePreferences();
    const t = i18n[lang] ?? i18n.fr;

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const calendar = useMemo(() => (mounted ? hijriMonthGrid(new Date(), lang) : null), [mounted, lang]);

    return (
        <section className="flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8 lg:h-[32rem] dark:border-stone-800 dark:bg-stone-900">
            <p className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-gold">
                <span>—</span> {t.title} <span>—</span>
            </p>

            {!mounted || !isHijriSupported() ? (
                <CalendarSkeleton />
            ) : !calendar ? (
                <p className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">{t.unavailable}</p>
            ) : (
                <div className="flex flex-1 flex-col justify-center">
                    <p className="mt-5 text-center font-serif text-xl font-semibold leading-snug text-stone-900 sm:text-2xl dark:text-stone-100">
                        {calendar.todayLabel}
                    </p>
                    <p className="mt-1 text-center text-sm text-stone-500 dark:text-stone-400">
                        {calendar.gregorianLabel}
                    </p>

                    <div className="mt-5 border-t border-stone-100 pt-4 dark:border-stone-800">
                        <p className="text-center font-serif text-sm font-semibold text-teal-700 dark:text-teal-300">
                            {calendar.monthLabel}
                        </p>

                        <div className="mt-3 grid grid-cols-7 gap-1 text-center">
                            {calendar.headers.map((header) => (
                                <div
                                    key={header}
                                    className="pb-1 text-[0.65rem] font-bold uppercase tracking-wide text-stone-400 dark:text-stone-500"
                                >
                                    {header}
                                </div>
                            ))}

                            {Array.from({ length: calendar.leadingBlanks }).map((_, i) => (
                                <div key={`blank-${i}`} />
                            ))}

                            {calendar.cells.map((cell) => (
                                <div
                                    key={cell.key}
                                    className={`rounded-lg py-1.5 ${
                                        cell.isToday
                                            ? 'bg-teal-700 text-white'
                                            : 'text-stone-700 dark:text-stone-300'
                                    }`}
                                >
                                    <span className="block text-sm font-semibold leading-none">
                                        {formatNumber(cell.day, lang)}
                                    </span>
                                    <span
                                        className={`mt-0.5 block text-[0.6rem] leading-none ${
                                            cell.isToday ? 'text-teal-100' : 'text-stone-400 dark:text-stone-500'
                                        }`}
                                    >
                                        {formatNumber(cell.gregorianDay, lang)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
