import { useState } from 'react';
import AppLayout from '../components/AppLayout';
import SeoHead from '../components/SeoHead';
import PageHeader from '../components/PageHeader';
import { MosqueIcon, CalendarDayIcon, CalendarWeekIcon } from '../components/Icons';

export default function Rappels() {
    const [email, setEmail] = useState('');
    const [frequency, setFrequency] = useState('daily');
    const [contentType, setContentType] = useState('verset');
    const [language, setLanguage] = useState('fr');
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        setProcessing(true);
        setResult(null);

        try {
            const response = await fetch('/rappels/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email, frequency, content_type: contentType, language }),
            });

            const data = await response.json();
            setResult(data);

            if (data.status === 'success') {
                setEmail('');
            }
        } catch {
            setResult({ status: 'error', message: 'Une erreur est survenue.' });
        } finally {
            setProcessing(false);
        }
    }

    const segOn = 'border-teal-600 bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300';
    const segOff =
        'border-stone-200 bg-white text-stone-600 hover:border-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-stone-600';

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <SeoHead
                title="Rappels quotidiens"
                description="Inscrivez-vous pour recevoir un verset du Coran ou un hadith par email chaque jour."
                path="/rappels"
            />
            <div className="text-center">
                <span className="grid h-16 w-16 mx-auto place-items-center rounded-2xl bg-teal-700 text-white shadow">
                    <MosqueIcon className="h-8 w-8" />
                </span>
                <div className="mt-4">
                    <PageHeader
                        align="center"
                        eyebrow="Votre rappel"
                        title="Rappels quotidiens"
                        subtitle="Recevez un verset ou un hadith du jour par email, à votre rythme."
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                {/* Email */}
                <div>
                    <label htmlFor="email" className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
                        Adresse email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-800 shadow-sm focus:border-teal-500 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                        placeholder="vous@exemple.com"
                        required
                    />
                </div>

                {/* Fréquence */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">Fréquence</label>
                    <div className="flex gap-3">
                        {[
                            { value: 'daily', label: 'Quotidien', icon: <CalendarDayIcon className="h-5 w-5" /> },
                            { value: 'weekly', label: 'Hebdomadaire', icon: <CalendarWeekIcon className="h-5 w-5" /> },
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setFrequency(opt.value)}
                                className={`flex-1 rounded-xl border-2 px-4 py-3 text-center transition ${
                                    frequency === opt.value ? segOn : segOff
                                }`}
                            >
                                <span className="flex justify-center">{opt.icon}</span>
                                <p className="mt-1 text-sm font-medium">{opt.label}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Type de contenu */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">Contenu</label>
                    <div className="flex gap-2">
                        {[
                            { value: 'verset', label: 'Verset' },
                            { value: 'hadith', label: 'Hadith' },
                            { value: 'alterne', label: 'Alterné' },
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setContentType(opt.value)}
                                className={`flex-1 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition ${
                                    contentType === opt.value ? segOn : segOff
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Langue */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">Langue</label>
                    <div className="flex gap-2">
                        {[
                            { value: 'fr', label: 'Français' },
                            { value: 'en', label: 'English' },
                            { value: 'ar', label: 'العربية' },
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setLanguage(opt.value)}
                                className={`flex-1 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition ${
                                    language === opt.value ? segOn : segOff
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Résultat */}
                {result && (
                    <div
                        className={`rounded-xl p-4 text-sm ${
                            result.status === 'success'
                                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : result.status === 'already_subscribed'
                                    ? 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300'
                                    : 'border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300'
                        }`}
                    >
                        {result.message}
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                >
                    {processing ? 'Inscription…' : "S'inscrire aux rappels"}
                </button>
            </form>
        </div>
    );
}

Rappels.layout = (page) => <AppLayout>{page}</AppLayout>;