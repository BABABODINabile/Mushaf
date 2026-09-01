export function formatTime(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds || 0));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) {
        return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }
    return `${m}:${String(sec).padStart(2, '0')}`;
}

export function timeAgo(iso) {
    const then = new Date(iso).getTime();
    if (!Number.isFinite(then)) {
        return '';
    }
    const diff = Math.max(0, Date.now() - then);
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) {
        return 'à l\'instant';
    }
    if (minutes < 60) {
        return `il y a ${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `il y a ${hours} h`;
    }
    const days = Math.floor(hours / 24);
    if (days < 7) {
        return `il y a ${days} j`;
    }
    return new Date(iso).toLocaleDateString('fr-FR');
}