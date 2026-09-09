/* Moteur de partage en image (PNG portrait 1080×1350)
 *
 * Design programmatique inspiré d'un template islamique élégant :
 * fond papier unicolore, coins ornementaux navy/or, bordure dorée,
 * brand doré avec icône, séparateur dégradé or.
 *
 * Disposition des zones sur le canvas 1080×1350 :
 *   0 ────── 230   Coins ornementaux (navy + motif géométrique or)
 * 220 ────── 1100  Zone de contenu (arabe + séparateur + traduction)
 * 1190 ───── 1296  Référence, narrateur et "MUSHAF.APP"
 */

/* ── Dimensions ── */
const W = 1080;
const H = 1350;
const BORDER_INSET = 10;
const CORNER_SIZE = 230;

/* ── Palette ── */
const PAPER = '#f7f2e6';
const NAVY = '#132039';
const GOLD = '#b6903f';
const GOLD_RGBA = 'rgba(182, 144, 63, 0.55)';
const ARABIC_INK = '#17213a';
const INK = '#2a2620';
const MUTED = '#5a5346';

/* ── Polices ── */
const ARABIC_FONT = '"KFGQPC Uthman Taha", "Amiri Quran", "Amiri", serif';
const SERIF_FONT = 'Fraunces, Georgia, serif';
const SANS_FONT = 'Instrument Sans, Inter, sans-serif';

/* ── Zones de disposition ── */
const BRAND_Y = 92;
const CONTENT_TOP = 230;
const CONTENT_BOTTOM = 1100;
const REF_Y = 1190;
const NARRATOR_Y = 1230;
const FOOTER_Y = 1296;

/* ── Largeur de texte ── */
const PAD_X = 140;
const TEXT_W = W - PAD_X * 2;

/** Résoudre une promesse dans un délai borné. */
function withTimeout(promise, ms) {
    return Promise.race([promise, new Promise((resolve) => setTimeout(resolve, ms))]);
}

/** Précharger les polices. */
async function ensureFonts() {
    try {
        await Promise.all([
            withTimeout(document.fonts.load(`400 48px "KFGQPC Uthman Taha"`), 1500),
            withTimeout(document.fonts.load(`700 48px "KFGQPC Uthman Taha"`), 1500),
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

/** Étoile ornementale à 8 branches (cartes stats). */
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

/** Icône décorative du brand (feuille/flamme). */
function drawBrandIcon(ctx, cx, cy, size) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(size / 24, size / 24);
    ctx.translate(-12, -12);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 1.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(12, 3);
    ctx.bezierCurveTo(14, 5.5, 15, 8, 15, 10.5);
    ctx.arc(12, 10.5, 3, 0, Math.PI, false);
    ctx.bezierCurveTo(9, 8, 10, 5.5, 12, 3);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(12, 21);
    ctx.bezierCurveTo(7.5, 20, 5, 17.5, 5, 14);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(12, 21);
    ctx.bezierCurveTo(16.5, 20, 19, 17.5, 19, 14);
    ctx.stroke();

    ctx.restore();
}

/** Rendu "Mushaf" en or avec icône, en haut de la carte. */
function drawBrand(ctx) {
    const size = 26;
    const text = 'Mushaf';
    ctx.save();
    ctx.font = `600 28px ${SERIF_FONT}`;
    const textWidth = ctx.measureText(text).width;
    const gap = 10;
    const blockW = textWidth + gap + size;
    const startX = W / 2 - blockW / 2;
    const cy = BRAND_Y;

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = GOLD;
    ctx.fillText(text, startX + size + gap, cy);
    drawBrandIcon(ctx, startX + size / 2, cy + 2, size);
    ctx.restore();
}

/** Coin ornemental navy/or (quarter-circle + motif géométrique or). */
function drawCornerOrnament(ctx, x, y, sx, sy) {
    const S = CORNER_SIZE;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sx, sy);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(S, 0);
    ctx.lineTo(S, 60);
    ctx.bezierCurveTo(160, 60, 60, 160, 60, S);
    ctx.lineTo(0, S);
    ctx.closePath();
    ctx.clip();

    ctx.fillStyle = NAVY;
    ctx.fillRect(0, 0, S, S);

    const step = 30;
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 1.1;
    ctx.globalAlpha = 0.9;
    for (let gx = step / 2; gx <= S; gx += step) {
        for (let gy = step / 2; gy <= S; gy += step) {
            ctx.beginPath();
            ctx.moveTo(gx, gy - step / 2);
            ctx.lineTo(gx + step / 2, gy);
            ctx.lineTo(gx, gy + step / 2);
            ctx.lineTo(gx - step / 2, gy);
            ctx.closePath();
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(gx, gy, 4, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    ctx.globalAlpha = 1;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(S, 0);
    ctx.lineTo(S, 60);
    ctx.bezierCurveTo(160, 60, 60, 160, 60, S);
    ctx.lineTo(0, S);
    ctx.closePath();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
}

/** Fond papier + bordure dorée inset. */
function drawBackground(ctx) {
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = GOLD_RGBA;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(BORDER_INSET, BORDER_INSET, W - BORDER_INSET * 2, H - BORDER_INSET * 2);
}

/** Dessiner les 4 coins ornementaux. */
function drawCorners(ctx) {
    drawCornerOrnament(ctx, 0, 0, 1, 1);
    drawCornerOrnament(ctx, W, 0, -1, 1);
    drawCornerOrnament(ctx, 0, H, 1, -1);
    drawCornerOrnament(ctx, W, H, -1, -1);
}

/** Rendu "MUSHAF.APP" en bas de la carte. */
function drawFooter(ctx) {
    ctx.save();
    ctx.fillStyle = GOLD;
    ctx.font = `500 15px ${SANS_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MUSHAF.APP', W / 2, FOOTER_Y);
    ctx.restore();
}

/* ═══════════════════════════════════════════════════════════════════════
 *  Carte de progression hebdomadaire (type === 'stats')
 * ═══════════════════════════════════════════════════════════════════════ */
function drawStatsCard(ctx, stats, reference) {
    const s = stats || {};

    drawStar(ctx, W / 2, CONTENT_TOP + 30, 28, GOLD);

    ctx.direction = 'ltr';
    ctx.textAlign = 'center';
    ctx.fillStyle = INK;
    ctx.font = `600 42px ${SERIF_FONT}`;
    ctx.fillText(reference || 'Ma semaine de lecture', W / 2, CONTENT_TOP + 130);

    const rows = [
        { label: 'Versets lus', value: s.weekAyahs ?? 0 },
        { label: 'Sourates parcourues', value: s.weekSurahs ?? 0 },
        { label: "Jours d'affilée", value: s.streak ?? 0 },
    ];

    const rowStart = CONTENT_TOP + 250;
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
        ctx.fillStyle = MUTED;
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
function drawTextCard(ctx, { textAr, textTranslation }) {
    const availH = CONTENT_BOTTOM - CONTENT_TOP;

    /* ── Tailles de référence ── */
    const arabicFontSize = 48;
    const arabicLineH = 76;
    const transFontSize = 27;
    const transLineH = 42;
    const sepGap = 64;
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
            trLines = wrapText(ctx, `\u00AB ${textTranslation} \u00BB`, Math.round(TEXT_W * 0.72));
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
    ctx.fillStyle = ARABIC_INK;
    ctx.direction = 'rtl';
    ctx.font = `${Math.round(arabicFontSize * scale)}px ${ARABIC_FONT}`;
    ctx.textAlign = 'center';
    const lineH = Math.round(arabicLineH * scale);
    content.arLines.forEach((line) => {
        ctx.fillText(line, W / 2, y);
        y += lineH;
    });

    /* ── Séparateur dégradé or ── */
    if (textTranslation) {
        y += Math.round(sepGap * scale) / 2;
        const dW = 320;
        const dH = 2;
        const grad = ctx.createLinearGradient(W / 2 - dW / 2, 0, W / 2 + dW / 2, 0);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.2, GOLD);
        grad.addColorStop(0.8, GOLD);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(W / 2 - dW / 2, y - 1, dW, dH);
        y += Math.round(sepGap * scale) / 2;

        /* ── Traduction ── */
        ctx.fillStyle = INK;
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
    await ensureFonts();

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    /* ── Fond papier + coins + brand ── */
    drawBackground(ctx);
    drawCorners(ctx);
    drawBrand(ctx);

    /* ── Contenu principal ── */
    if (type === 'stats') {
        drawStatsCard(ctx, stats, reference);
    } else {
        drawTextCard(ctx, { textAr, textTranslation });
    }

    /* ── Référence ── */
    if (reference) {
        ctx.fillStyle = NAVY;
        ctx.direction = 'ltr';
        ctx.font = `500 21px ${SANS_FONT}`;
        ctx.textAlign = 'center';
        ctx.fillText(reference, W / 2, narrator ? REF_Y - 30 : REF_Y);
    }

    /* ── Narrateur (hadith) ── */
    if (narrator) {
        ctx.fillStyle = MUTED;
        ctx.font = `italic 17px ${SANS_FONT}`;
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