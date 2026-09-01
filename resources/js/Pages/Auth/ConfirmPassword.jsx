import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import Medallion from '../../components/Medallion';

export default function ConfirmPassword() {
    const { errors } = usePage().props;
    const [password, setPassword] = useState('');
    const [processing, setProcessing] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        setProcessing(true);
        router.post('/confirm-password', { password }, {
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
                <h1 className="mt-4 text-2xl font-bold text-stone-900">Confirmez votre mot de passe</h1>
                <p className="mt-1 text-sm text-stone-500">
                    Veuillez confirmer votre mot de passe pour continuer.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="password" className="mb-1 block text-sm font-medium text-stone-700">
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-800 shadow-sm focus:border-teal-500 focus:outline-none"
                            required
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-6 w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                >
                    {processing ? 'Confirmation…' : 'Confirmer'}
                </button>
            </form>
        </div>
    );
}

ConfirmPassword.layout = (page) => <AppLayout>{page}</AppLayout>;
