import { Link } from '@inertiajs/react';

export default function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-10 text-center dark:border-stone-700 dark:bg-stone-900/50">
            {Icon && (
                <div className="mb-4 text-stone-400 dark:text-stone-500">
                    <Icon className="h-12 w-12" />
                </div>
            )}
            {title && (
                <p className="text-lg font-semibold text-stone-700 dark:text-stone-300">
                    {title}
                </p>
            )}
            {description && (
                <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                    {description}
                </p>
            )}
            {action && (
                <Link
                    href={action.href}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
                >
                    {action.label}
                </Link>
            )}
        </div>
    );
}
