/**
 * Construit l'URL audio d'une sourate complète sur Cloudflare R2.
 * Format : {public_url}/{reciter}/{numéro à 3 chiffres}.{format}
 */
export function surahAudioUrl(r2PublicUrl, reciterId, surahNumber, format = 'opus') {
    const num = String(surahNumber).padStart(3, '0');

    return `${r2PublicUrl}/${reciterId}/${num}.${format}`;
}

/**
 * Détecte si le navigateur peut lire l'Opus (conteneur Ogg).
 * Safari iOS ne le supporte pas → on bascule vers un récitateur MP3.
 */
export function canPlayOpus() {
    if (typeof document === 'undefined') {
        return true;
    }
    try {
        const el = document.createElement('audio');
        if (!el || typeof el.canPlayType !== 'function') {
            return true;
        }
        const result = el.canPlayType('audio/ogg; codecs="opus"');
        // canPlayType renvoie '', 'maybe' ou 'probably'. '' = non supporté.
        // 'maybe' reste incertain : on considère que c'est lisible et on
        // laisse le lecteur global afficher l'erreur + fallback si besoin.
        return result !== '';
    } catch {
        return true;
    }
}

/**
 * Premier récitateur MP3 disponible (fallback Safari iOS).
 */
export function mp3FallbackReciter(reciters) {
    if (!Array.isArray(reciters)) {
        return null;
    }
    return reciters.find((r) => (r.format ?? 'opus') === 'mp3') ?? null;
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

/**
 * Résout le récitateur effectif : si le navigateur ne lit pas l'Opus et que
 * le récitateur demandé est en opus, bascule vers le premier MP3 dispo.
 * Retourne { id, fallbackApplied }.
 */
export function effectiveReciterId(reciters, requestedId, fallbackId) {
    const requested = Array.isArray(reciters)
        ? reciters.find((r) => r.id === requestedId)
        : null;
    const format = requested?.format ?? 'opus';
    if (format === 'mp3' || canPlayOpus()) {
        return { id: requestedId, fallbackApplied: false };
    }
    const mp3 = mp3FallbackReciter(reciters);
    if (mp3) {
        return { id: mp3.id, fallbackApplied: true };
    }
    return { id: fallbackId ?? requestedId, fallbackApplied: false };
}
