const DAY_MS = 86400000;

const BASE_LOCALES = {
    fr: 'fr-FR',
    en: 'en-US',
    ar: 'ar',
};

const DISPLAY_LOCALES = {
    fr: 'fr-FR-u-nu-latn',
    en: 'en-US-u-nu-latn',
    ar: 'ar-u-nu-arab',
};

const cache = new Map();

function cached(key, make) {
    if (!cache.has(key)) {
        cache.set(key, make());
    }
    return cache.get(key);
}

function localeOf(lang) {
    return BASE_LOCALES[lang] ?? BASE_LOCALES.fr;
}

function displayLocaleOf(lang) {
    return DISPLAY_LOCALES[lang] ?? DISPLAY_LOCALES.fr;
}

function parseFormatter(locale) {
    return new Intl.DateTimeFormat(`${locale}-u-nu-latn`, {
        calendar: 'islamic-umalqura',
        timeZone: 'UTC',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    });
}

function partsOf(formatter, date) {
    const parts = {};
    for (const part of formatter.formatToParts(date)) {
        parts[part.type] = part.value;
    }
    return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) };
}

function utcNoon(date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12));
}

export function isHijriSupported() {
    return cached('support', () => {
        try {
            const formatter = new Intl.DateTimeFormat('en-u-nu-latn', {
                calendar: 'islamic-umalqura',
                timeZone: 'UTC',
                year: 'numeric',
            });
            const year = formatter
                .formatToParts(new Date(Date.UTC(2024, 6, 7)))
                .find((part) => part.type === 'year')?.value;

            return year === '1446';
        } catch {
            return false;
        }
    });
}

export function formatNumber(value, lang) {
    return cached(`number:${lang}`, () => new Intl.NumberFormat(displayLocaleOf(lang))).format(value);
}

export function formatHijriLong(date, lang) {
    return cached(`hijriLong:${lang}`, () => new Intl.DateTimeFormat(displayLocaleOf(lang), {
        calendar: 'islamic-umalqura',
        timeZone: 'UTC',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })).format(date);
}

export function formatGregorianLong(date, lang) {
    return cached(`gregorianLong:${lang}`, () => new Intl.DateTimeFormat(displayLocaleOf(lang), {
        timeZone: 'UTC',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })).format(date);
}

export function weekdayHeaders(lang, weekStartsOn = 0) {
    return cached(`headers:${lang}:${weekStartsOn}`, () => {
        const formatter = new Intl.DateTimeFormat(displayLocaleOf(lang), {
            weekday: 'short',
            timeZone: 'UTC',
        });
        const sunday = Date.UTC(2024, 0, 7);

        return Array.from({ length: 7 }, (_, i) => formatter.format(new Date(sunday + ((weekStartsOn + i) % 7) * DAY_MS)));
    });
}

export function hijriMonthGrid(reference = new Date(), lang = 'fr', weekStartsOn = 0) {
    const locale = localeOf(lang);
    const formatter = parseFormatter(locale);
    const base = utcNoon(reference);
    const today = partsOf(formatter, base);

    const cells = [];
    for (let offset = -32; offset <= 32; offset++) {
        const date = new Date(base.getTime() + offset * DAY_MS);
        const parts = partsOf(formatter, date);

        if (parts.year === today.year && parts.month === today.month) {
            cells.push({
                key: offset,
                day: parts.day,
                gregorianDay: date.getUTCDate(),
                isToday: offset === 0,
            });
        }
    }

    if (cells.length === 0) {
        return null;
    }

    const firstDate = new Date(base.getTime() + cells[0].key * DAY_MS);
    const leadingBlanks = (firstDate.getUTCDay() - weekStartsOn + 7) % 7;
    const monthFormatter = cached(`month:${lang}`, () => new Intl.DateTimeFormat(displayLocaleOf(lang), {
        calendar: 'islamic-umalqura',
        timeZone: 'UTC',
        month: 'long',
        year: 'numeric',
    }));

    return {
        monthLabel: monthFormatter.format(firstDate),
        todayLabel: formatHijriLong(base, lang),
        gregorianLabel: formatGregorianLong(base, lang),
        headers: weekdayHeaders(lang, weekStartsOn),
        leadingBlanks,
        cells,
    };
}
