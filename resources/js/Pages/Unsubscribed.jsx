import { Link } from '@inertiajs/react';
import AppLayout from '../components/AppLayout';

export default function Unsubscribed() {
    return (
        <div className="mx-auto flex max-w-md flex-col items-center justify-center py-16 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-stone-100 text-3xl">
                ✅
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
