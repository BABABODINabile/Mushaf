import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import Medallion from '../../components/Medallion';

export default function VerifyEmail() {
    const { status } = usePage().props;
    const [processing, setProcessing] = useState(false);

    function handleResend() {
        setProcessing(true);
        router.post('/email/verification-notification', {}, {
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <div className="mx-auto flex max-w-md flex-col justify-center py-10">
            <div className="mb-8 text-center">
                <div className="flex items-center justify-center gap-2">
                    <Medallion className="h-9 w-9" />
                    <span className="font-serif text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                        Mushaf
                    </span>
                </div>
                <h1 className="mt-4 text-2xl font-bold text-stone-900">Vérifiez votre email</h1>
                <p className="mt-1 text-sm text-stone-500">
                    Nous vous avons envoyé un lien de vérification. Vérifiez votre boîte de réception.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                    Un nouveau lien de vérification a été envoyé à votre adresse email.
                </div>
            )}

            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <button
                    type="button"
                    onClick={handleResend}
                    disabled={processing}
                    className="w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                >
                    {processing ? 'Envoi…' : 'Renvoyer le lien de vérification'}
                </button>
            </div>
        </div>
    );
}

VerifyEmail.layout = (page) => <AppLayout>{page}</AppLayout>;
