import { useState } from 'react';
import AppLayout from '../components/AppLayout';
import SeoHead from '../components/SeoHead';
import { XIcon, FacebookIcon, WhatsappIcon } from '../components/Icons';
import { shareOrDownload } from '../lib/shareCard';
import { usePreferences } from '../components/PreferencesContext';
import { pickTranslation } from '../lib/translation';

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
            console.error('Share image generation failed:', e);
            setError("Impossible de générer l'image. Réessayez.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <SeoHead
                title={reference}
                description={displayText || `Partagez : ${reference}`}
                path={url || '/share'}
            />
            {/* En-tête */}
            <div className="text-center">
                <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                    Partager
                </h1>
                <p className="mt-2 text-base font-medium text-stone-700 dark:text-stone-300">
                    {reference}
                </p>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                    Bien cité en arabe et en{' '}
                    {lang === 'fr' ? 'français' : lang === 'en' ? 'anglais' : 'arabe'}.
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