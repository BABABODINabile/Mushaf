/**
 * Construit l'URL audio d'une sourate complète sur Cloudflare R2.
 * Format : {public_url}/{reciter}/{numéro à 3 chiffres}.{format}
 */
export function surahAudioUrl(r2PublicUrl, reciterId, surahNumber, format = 'opus') {
    const num = String(surahNumber).padStart(3, '0');

    return `${r2PublicUrl}/${reciterId}/${num}.${format}`;
}

/**
 * Renvoie le récitateur sauvegardé (localStorage « mushaf-reciter »)
 * s'il existe dans la liste, sinon le récitateur par défaut.
 */
export function savedReciterId(reciters, fallback) {
    if (typeof localStorage === 'undefined') {
        return fallback;
    }

    const saved = localStorage.getItem('mushaf-reciter');

    return saved && reciters.some((r) => r.id === saved) ? saved : fallback;
}
