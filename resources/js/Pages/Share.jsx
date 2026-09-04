import { useState } from 'react';
import AppLayout from '../components/AppLayout';
import { XIcon, FacebookIcon, WhatsappIcon } from '../components/Icons';
import { shareOrDownload } from '../lib/shareCard';
import { usePreferences } from '../components/PreferencesContext';
import { pickTranslation } from '../lib/translation';
import templateBase from '../../images/share/share-card-base.png';

/**
 * Aperçu de la carte de partage.
 *
 * Zones de disposition (aspect 4/5 = 1080×1350) :
 *   Brand "Mushaf"      → top-[4.6%]     (y=62)
 *   Zone contenu        → top-[11.9%] … bottom-[15.6%]  (y=160→1140)
 *   Référence           → bottom-[11.9%]  (y=1190)
 *   Narrateur           → bottom-[8.9%]   (y=1230)
 *   "mushaf.app"        → bottom-[4%]     (y=1296)
 */
export default function Share({
    type,
    title,
    textAr,
    textTranslation,
    reference,
    url,
    twitterUrl,
    facebookUrl,
    whatsappUrl,
    narrator,
    text_fr,
    text_en,
}) {
    const { lang } = usePreferences();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const displayText =
        pickTranslation({ text_fr, text_en, text_ar: textAr }, lang) || textTranslation || '';

    async function handleImageShare() {
        if (busy) return;
        setBusy(true);
        setError('');
        try {
            await shareOrDownload({
                type,
                textAr: textAr ?? '',
                textTranslation: displayText || textTranslation || '',
                reference: reference ?? '',
                narrator: narrator ?? '',
            });
        } catch (e) {
            setError("Impossible de générer l'image. Réessayez.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            {/* En-tête */}
            <div className="text-center">
                <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                    Partager
                </h1>
                <p className="mt-1 text-stone-500 dark:text-stone-400">{reference}</p>
            </div>

            {/* ── Aperçu de la carte ── */}
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl shadow-lg">
                {/* Fond du template */}
                <img
                    src={templateBase}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                />

                {/* Brand "Mushaf" dans la bande teal */}
                <p className="absolute left-1/2 top-[4.6%] -translate-x-1/2 text-lg font-semibold tracking-wide text-[#f2f3e8]">
                    Mushaf
                </p>

                {/* Zone de contenu principal */}
                <div className="absolute inset-x-[15%] top-[11.9%] bottom-[15.6%] flex flex-col items-center justify-center text-center">
                    {textAr && (
                        <p className="text-right font-arabic text-2xl leading-[2.1] text-[#0e4746]">
                            {textAr}
                        </p>
                    )}
                    {displayText && (
                        <>
                            {/* Séparateur étoile or */}
                            <svg
                                className="my-3 h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#fab855"
                                strokeWidth="2"
                            >
                                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
                            </svg>
                            <p className="text-sm italic text-[#4f665f]">« {displayText} »</p>
                        </>
                    )}
                </div>

                {/* Référence (ancrée en bas) */}
                {reference && (
                    <p className="absolute bottom-[11.9%] left-1/2 -translate-x-1/2 text-xs tracking-wide text-[#7a7864]">
                        {reference}
                    </p>
                )}

                {/* Narrateur (hadith) */}
                {narrator && (
                    <p className="absolute bottom-[8.9%] left-1/2 -translate-x-1/2 text-[10px] italic text-[#7a7864]">
                        {narrator}
                    </p>
                )}

                {/* Footer mushaf.app */}
                <p className="absolute bottom-[4%] left-1/2 -translate-x-1/2 text-sm font-medium text-[#d9bd84]">
                    mushaf.app
                </p>
            </div>

            {/* ── Bouton partager / télécharger ── */}
            <button
                type="button"
                onClick={handleImageShare}
                disabled={busy}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-teal-700 px-5 py-4 text-white shadow-sm transition hover:bg-teal-800 disabled:opacity-60 dark:bg-teal-600 dark:hover:bg-teal-500"
            >
                <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                </svg>
                <span>{busy ? 'Génération…' : 'Partager / télécharger en image'}</span>
            </button>
            <p className="-mt-4 text-center text-xs text-stone-400 dark:text-stone-500">
                Une image bien formatée, idéale pour WhatsApp et les réseaux sociaux
            </p>

            {error && (
                <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            {/* ── Liens sociaux ── */}
            <div className="space-y-3">
                <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-5 py-4 text-stone-700 shadow-sm transition hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
                >
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-black text-white">
                        <XIcon className="h-4 w-4" />
                    </span>
                    <div>
                        <p className="font-medium">Partager sur X (Twitter)</p>
                        <p className="text-xs text-stone-400 dark:text-stone-500">
                            Partagez avec vos abonnés
                        </p>
                    </div>
                </a>

                <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-5 py-4 text-stone-700 shadow-sm transition hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
                >
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[#1877f2] text-white">
                        <FacebookIcon className="h-4 w-4" />
                    </span>
                    <div>
                        <p className="font-medium">Partager sur Facebook</p>
                        <p className="text-xs text-stone-400 dark:text-stone-500">
                            Partagez avec vos amis
                        </p>
                    </div>
                </a>

                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-5 py-4 text-stone-700 shadow-sm transition hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
                >
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[#25d366] text-white">
                        <WhatsappIcon className="h-4 w-4" />
                    </span>
                    <div>
                        <p className="font-medium">Partager sur WhatsApp</p>
                        <p className="text-xs text-stone-400 dark:text-stone-500">
                            Envoyez à vos contacts
                        </p>
                    </div>
                </a>
            </div>
        </div>
    );
}

Share.layout = (page) => <AppLayout>{page}</AppLayout>;
