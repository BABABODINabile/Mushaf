/**
 * Pick the right translation text based on the active language.
 * In 'ar' mode, translation is hidden (returns empty string).
 */
export function pickTranslation(item, lang) {
    if (!item) return '';
    if (lang === 'ar') return '';
    if (lang === 'en') return item.text_en ?? item.text_fr ?? '';
    return item.text_fr ?? item.text_en ?? '';
}

/**
 * Pick the right surah name based on the active language.
 */
export function pickName(item, lang) {
    if (!item) return '';
    if (lang === 'ar') return item.name_ar ?? '';
    if (lang === 'en') return item.name_en ?? item.name_fr ?? '';
    return item.name_fr ?? item.name_en ?? '';
}

/**
 * Pick surah name from objects that use surah_name_fr / surah_name_en / surah_name_ar keys
 * (e.g. Search results, Accueil verse-of-the-day).
 */
export function pickSurahName(obj, lang) {
    if (!obj) return '';
    if (lang === 'ar') return obj.surah_name_ar ?? obj.surah_name_fr ?? '';
    if (lang === 'en') return obj.surah_name_en ?? obj.surah_name_fr ?? '';
    return obj.surah_name_fr ?? obj.surah_name_en ?? '';
}
