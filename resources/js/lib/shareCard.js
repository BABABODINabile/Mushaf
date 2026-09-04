/* Moteur de partage en image (PNG portrait 1080×1350)
 *
 * Le poster de fond (resources/images/share/share-card-base.png) est un PNG
 * pré-rendu importé via Vite. Le texte est superposé sur le panneau ivoire central.
 *
 * Disposition des zones sur le canvas 1080×1350 :
 *   0 ────── 80   Bande teal supérieure (brand "Mushaf")
 *  80 ────── 1350  Panneau ivoire (contenu principal + footer)
 *
 * Le contenu (arabe + séparateur + traduction) est centré verticalement
 * dans la zone ivoire. Référence, narrateur et "mushaf.app" sont ancrés en bas.
 */

import templateBase from '../../images/share/share-card-base.png';

/* ── Dimensions ── */
const W = 1080;
const H = 1350;
const TEMPLATE_H = 1515;
const TEMPLATE_DY = -Math.round((TEMPLATE_H - H) / 2);

/* ── Palette ── */
const TEAL = '#0e4746';
const IVORY_WARM = '#f2f3e8';
const GOLD = '#fab855';
const GOLD_SOFT = '#d9bd84';
const INK = '#0e4746';
const BODY = '#4f665f';
const MUTED = '#7a7864';

/* ── Polices ── */
const ARABIC_FONT = 'Amiri Quran, Amiri, serif';
const SERIF_FONT = 'Fraunces, Georgia, serif';
const SANS_FONT = 'Instrument Sans, Inter, sans-serif';

/* ── Zones de disposition ── */
const BRAND_Y = 62;
const CONTENT_TOP = 160;
const CONTENT_BOTTOM = 1140;
const CONTENT_CENTER = (CONTENT_TOP + CONTENT_BOTTOM) / 2;
const REF_Y = 1190;
const NARRATOR_Y = 1230;
const FOOTER_Y = 1296;

/* ── Largeur de texte (panneau ivoire, cadres teal exclus) ── */
const PAD_X = 185;
const TEXT_W = W - PAD_X * 2;

let baseImagePromise = null;

/** Charger en mémoire le poster de fond (mis en cache). */
function ensureBase() {
    if (!baseImagePromise) {
        baseImagePromise = new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('impossible de charger le fond de carte'));
            img.src = templateBase;
        });
    }
    return baseImagePromise;
}

/** Résoudre une promesse dans un délai borné. */
function withTimeout(promise, ms) {
    return Promise.race([promise, new Promise((resolve) => setTimeout(resolve, ms))]);
}

/** Précharger les polices. */
async function ensureFonts() {
    try {
        await Promise.all([
            withTimeout(document.fonts.load(`700 44px "${ARABIC_FONT}"`), 1200),
            withTimeout(document.fonts.load(`700 44px "Amiri"`), 1200),
            withTimeout(document.fonts.load(`italic 400 27px "${SERIF_FONT}"`), 1200),
            withTimeout(document.fonts.load(`600 22px "${SANS_FONT}"`), 1200),
            withTimeout(document.fonts.load(`600 40px "${SERIF_FONT}"`), 1200),
        ]);
    } catch (_) { /* polices de secours suffisent */ }
}

/** Découper le texte en lignes selon la largeur maximale. */
function wrapText(ctx, text, maxWidth) {
    const words = String(text).split(' ');
    const lines = [];
    let current = '';
    words.forEach((word) => {
        const test = current ? `${current} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && current) {
            lines.push(current);
            current = word;
        } else {
            current = test;
        }
    });
    if (current) lines.push(current);
    return lines;
}

/** Étoile ornementale à 8 branches. */
function drawStar(ctx, cx, cy, r, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4 - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

/** Rendu "Mushaf" dans la bande teal supérieure. */
function drawBrand(ctx) {
    ctx.font = `600 30px ${SANS_FONT}`;
    ctx.fillStyle = IVORY_WARM;
    ctx.textAlign = 'center';
    ctx.fillText('Mushaf', W / 2, BRAND_Y);
}

/** Rendu "mushaf.app" en bas de la carte. */
function drawFooter(ctx) {
    ctx.fillStyle = GOLD_SOFT;
    ctx.font = `500 19px ${SANS_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('mushaf.app', W / 2, FOOTER_Y);
}

/* ═══════════════════════════════════════════════════════════════════════
 *  Carte de progression hebdomadaire (type === 'stats')
 * ═══════════════════════════════════════════════════════════════════════ */
function drawStatsCard(ctx, stats, reference) {
    const s = stats || {};

    drawStar(ctx, W / 2, CONTENT_TOP + 20, 28, GOLD);

    ctx.direction = 'ltr';
    ctx.textAlign = 'center';
    ctx.fillStyle = INK;
    ctx.font = `600 42px ${SERIF_FONT}`;
    ctx.fillText(reference || 'Ma semaine de lecture', W / 2, CONTENT_TOP + 120);

    const rows = [
        { label: 'Versets lus', value: s.weekAyahs ?? 0 },
        { label: 'Sourates parcourues', value: s.weekSurahs ?? 0 },
        { label: "Jours d'affilée", value: s.streak ?? 0 },
    ];

    const rowStart = CONTENT_TOP + 240;
    const rowSpacing = 160;

    rows.forEach((row, i) => {
        const y = rowStart + i * rowSpacing;
        ctx.fillStyle = INK;
        ctx.font = `600 88px ${SERIF_FONT}`;
        ctx.fillText(String(row.value), W / 2, y);
        ctx.fillStyle = MUTED;
        ctx.font = `600 25px ${SANS_FONT}`;
        ctx.fillText(row.label, W / 2, y + 50);
    });

    if (s.bestScore) {
        const y = rowStart + rows.length * rowSpacing + 6;
        ctx.fillStyle = BODY;
        ctx.font = `600 28px ${SANS_FONT}`;
        ctx.fillText(
            `Quiz — meilleur score : ${s.bestScore.percentage}% (${s.bestScore.correct}/${s.bestScore.total})`,
            W / 2,
            y,
        );
    }
}

/* ═══════════════════════════════════════════════════════════════════════
 *  Carte verset / hadith
 * ═══════════════════════════════════════════════════════════════════════ */
function drawTextCard(ctx, { textAr, textTranslation, reference, narrator }) {
    const availH = CONTENT_BOTTOM - CONTENT_TOP;
    const starRadius = 16;

    /* ── Tailles de référence ── */
    const arabicFontSize = 48;
    const arabicLineH = 72;
    const transFontSize = 29;
    const transLineH = 45;
    const sepGap = 44;
    const minScale = 0.3;

    /* ── Mesurer le contenu pour trouver le scale ── */
    function measureContent(s) {
        ctx.direction = 'rtl';
        ctx.font = `${Math.round(arabicFontSize * s)}px ${ARABIC_FONT}`;
        ctx.textAlign = 'center';
        const arLines = wrapText(ctx, textAr, TEXT_W);
        const arH = arLines.length * Math.round(arabicLineH * s);

        let trLines = [];
        let trH = 0;
        if (textTranslation) {
            ctx.direction = 'ltr';
            ctx.font = `italic ${Math.round(transFontSize * s)}px ${SERIF_FONT}`;
            trLines = wrapText(ctx, `\u00AB ${textTranslation} \u00BB`, TEXT_W - 40);
            trH = trLines.length * Math.round(transLineH * s);
        }

        const totalH = arH + (textTranslation ? Math.round(sepGap * s) + trH : 0);
        return { arLines, trLines, arH, trH, totalH };
    }

    /* ── Trouver le scale qui tient dans la zone ── */
    let scale = 1;
    let content = measureContent(scale);
    for (let i = 0; i < 30 && content.totalH > availH; i++) {
        scale = Math.max(minScale, scale - 0.04);
        content = measureContent(scale);
    }

    /* ── Centrer le contenu dans la zone ── */
    const startY = CONTENT_TOP + (availH - content.totalH) / 2;
    let y = startY;

    /* ── Texte arabe ── */
    ctx.fillStyle = INK;
    ctx.direction = 'rtl';
    ctx.font = `${Math.round(arabicFontSize * scale)}px ${ARABIC_FONT}`;
    ctx.textAlign = 'center';
    const lineH = Math.round(arabicLineH * scale);
    content.arLines.forEach((line) => {
        ctx.fillText(line, W / 2, y);
        y += lineH;
    });

    /* ── Séparateur étoile or ── */
    if (textTranslation) {
        y += Math.round(sepGap * scale) / 2;
        drawStar(ctx, W / 2, y, starRadius, GOLD);
        y += Math.round(sepGap * scale) / 2;

        /* ── Traduction ── */
        ctx.fillStyle = BODY;
        ctx.direction = 'ltr';
        ctx.font = `italic ${Math.round(transFontSize * scale)}px ${SERIF_FONT}`;
        ctx.textAlign = 'center';
        const scaledTransLineH = Math.round(transLineH * scale);
        content.trLines.forEach((line) => {
            ctx.fillText(line, W / 2, y);
            y += scaledTransLineH;
        });
    }
}

/* ═══════════════════════════════════════════════════════════════════════
 *  Fonction principale
 * ═══════════════════════════════════════════════════════════════════════ */
export async function generateShareCard({
    textAr = '',
    textTranslation = '',
    reference = '',
    narrator = '',
    type = 'ayah',
    stats = null,
}) {
    const [, base] = await Promise.all([ensureFonts(), ensureBase()]);

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    /* ── Fond : teal + poster pré-rendu ── */
    ctx.fillStyle = TEAL;
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage(base, 0, TEMPLATE_DY);

    /* ── Brand ── */
    drawBrand(ctx);

    /* ── Contenu principal ── */
    if (type === 'stats') {
        drawStatsCard(ctx, stats, reference);
    } else {
        drawTextCard(ctx, { textAr, textTranslation, reference, narrator });
    }

    /* ── Référence ── */
    if (reference) {
        ctx.fillStyle = MUTED;
        ctx.direction = 'ltr';
        ctx.font = `600 22px ${SANS_FONT}`;
        ctx.textAlign = 'center';
        ctx.fillText(reference, W / 2, narrator ? REF_Y - 30 : REF_Y);
    }

    /* ── Narrateur (hadith) ── */
    if (narrator) {
        ctx.fillStyle = MUTED;
        ctx.font = `italic 18px ${SANS_FONT}`;
        ctx.textAlign = 'center';
        ctx.fillText(narrator, W / 2, NARRATOR_Y);
    }

    /* ── Footer ── */
    drawFooter(ctx);

    return canvas.toDataURL('image/png');
}

/** Déclencher le téléchargement d'un PNG. */
export function downloadImage(dataUrl, filename) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename || 'mushaf-partage.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

/** Partager via Web Share API (mobile) ou télécharger (desktop). */
export async function shareOrDownload(opts, dataUrl = null) {
    const card = dataUrl || (await generateShareCard(opts));
    const filename =
        (opts.type === 'stats' ? 'semaine' : opts.type === 'hadith' ? 'hadith' : 'verset') +
        '-mushaf.png';

    if (navigator.share && navigator.canShare) {
        try {
            const blob = await (await fetch(card)).blob();
            const file = new File([blob], filename, { type: 'image/png' });
            if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Mushaf — ' + (opts.reference || ''),
                    text: opts.textTranslation || '',
                });
                return;
            }
        } catch (e) {
            if (e && e.name === 'AbortError') return;
        }
    }
    downloadImage(card, filename);
}
