import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import Medallion from '../../components/Medallion';
import PasswordInput from '../../components/PasswordInput';

export default function ResetPassword({ token, email }) {
    const { errors } = usePage().props;
    const [values, setValues] = useState({
        token,
        email: email || '',
        password: '',
        password_confirmation: '',
    });
    const [processing, setProcessing] = useState(false);

    function handleChange(e) {
        setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        setProcessing(true);
        router.post('/reset-password', values, {
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
                <h1 className="mt-4 text-2xl font-bold text-stone-900">Nouveau mot de passe</h1>
                <p className="mt-1 text-sm text-stone-500">
                    Choisissez un nouveau mot de passe pour votre compte.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="email" className="mb-1 block text-sm font-medium text-stone-700">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-800 shadow-sm focus:border-teal-500 focus:outline-none"
                            required
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="mb-1 block text-sm font-medium text-stone-700">
                            Nouveau mot de passe
                        </label>
                        <PasswordInput
                            id="password"
                            name="password"
                            value={values.password}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-800 shadow-sm focus:border-teal-500 focus:outline-none"
                            required
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password_confirmation" className="mb-1 block text-sm font-medium text-stone-700">
                            Confirmer le mot de passe
                        </label>
                        <PasswordInput
                            id="password_confirmation"
                            name="password_confirmation"
                            value={values.password_confirmation}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-800 shadow-sm focus:border-teal-500 focus:outline-none"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-6 w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                >
                    {processing ? 'Réinitialisation…' : 'Réinitialiser'}
                </button>
            </form>

            <p className="mt-5 text-center text-sm text-stone-600">
                <Link href="/login" className="font-medium text-teal-700 hover:underline">
                    Retour à la connexion
                </Link>
            </p>
        </div>
    );
}

ResetPassword.layout = (page) => <AppLayout>{page}</AppLayout>;
