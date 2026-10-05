import { Link } from '@inertiajs/react';
import AppLayout from '../components/AppLayout';

export default function Unsubscribed() {
    return (
        <div className="mx-auto flex max-w-md flex-col items-center justify-center py-16 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </span>
            <h1 className="mt-6 text-2xl font-bold text-stone-900">Désabonnement confirmé</h1>
            <p className="mt-2 text-stone-500">
                Vous ne recevrez plus de rappels par email. Vous pouvez vous réinscrire à tout moment.
            </p>
            <Link
                href="/rappels"
                className="mt-6 rounded-lg bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
                Réinscrire aux rappels
            </Link>
        </div>
    );
}

Unsubscribed.layout = (page) => <AppLayout>{page}</AppLayout>;
