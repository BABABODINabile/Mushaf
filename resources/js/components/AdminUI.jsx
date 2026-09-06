import { Link } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, SpinnerIcon } from './Icons';

export function PageHeader({ title, subtitle, actions }) {
    return (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">{title}</h1>
                {subtitle && <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2.5">{actions}</div>}
        </div>
    );
}

export function PrimaryButtonLink({ href, children, icon: Icon }) {
    return (
        <Link
            href={href}
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-700/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-teal-700/30 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-teal-500/50 active:scale-95"
        >
            {Icon && <Icon className="h-4 w-4 transition-transform group-hover:rotate-90" />}
            {children}
        </Link>
    );
}

export function SearchInput({ placeholder, value, onChange }) {
    return (
        <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-3 text-sm text-stone-700 shadow-sm transition placeholder:text-stone-400 focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:placeholder:text-stone-500 dark:focus:border-teal-600"
            />
        </div>
    );
}

export function TableCard({ children, className = '' }) {
    return (
        <div className={`overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-sm shadow-stone-200/40 dark:border-stone-700/70 dark:bg-stone-900 dark:shadow-none ${className}`}>
            {children}
        </div>
    );
}

export function Table({ children }) {
    return <table className="w-full text-left text-sm">{children}</table>;
}

export function Thead({ cols, children }) {
    return (
        <thead className="border-b border-stone-200/70 bg-stone-50/80 dark:border-stone-700 dark:bg-stone-800/60">
            {children || (
                <tr>
                    {cols.map((c) => (
                        <th key={c} className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">{c}</th>
                    ))}
                </tr>
            )}
        </thead>
    );
}

export function Tbody({ children }) {
    return <tbody className="divide-y divide-stone-100 dark:divide-stone-800">{children}</tbody>;
}

export function Pagination({ links }) {
    if (!links || links.length === 0) return null;
    return (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
            {links.map((link, i) => {
                const isPrev = /&laquo;/.test(link.label);
                const isNext = /&raquo;/.test(link.label);
                const isDots = link.label === '...';
                const Icon = isPrev ? ChevronLeftIcon : isNext ? ChevronRightIcon : null;
                const label = isDots ? '…' : link.label;
                return (
                    <Link
                        key={i}
                        href={link.url || '#'}
                        aria-label={isPrev ? 'Page précédente' : isNext ? 'Page suivante' : label}
                        className={`inline-flex min-w-[2rem] items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 text-sm transition-all duration-150 ${
                            link.active
                                ? 'bg-gradient-to-r from-teal-600 to-teal-700 font-semibold text-white shadow-md shadow-teal-700/25'
                                : link.url
                                    ? 'border border-stone-200 bg-white font-medium text-stone-600 hover:-translate-y-0.5 hover:border-teal-300 hover:text-teal-700 hover:shadow-md dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400 dark:hover:border-teal-600 dark:hover:text-teal-300'
                                    : 'border border-transparent text-stone-300 dark:text-stone-600'
                        }`}
                    >
                        {Icon && <Icon className="h-4 w-4" />}
                        {!Icon && label}
                    </Link>
                );
            })}
        </div>
    );
}

export function SubmittingButton({ loading, loadingText, children }) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-700/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-teal-700/30 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-teal-500/50 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"
        >
            {loading && <SpinnerIcon className="h-4 w-4 animate-spin" />}
            {loading ? loadingText : children}
        </button>
    );
}

export function CancelLink({ href, children = 'Annuler' }) {
    return (
        <a
            href={href}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-600 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-stone-50 hover:shadow-md dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
        >
            {children}
        </a>
    );
}

export function Input({ label, error, hint, className = '', ...props }) {
    return (
        <div className={className}>
            {label && <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">{label}</label>}
            <input
                {...props}
                className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-800 shadow-sm transition placeholder:text-stone-400 focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:placeholder:text-stone-500 dark:focus:border-teal-600"
            />
            {error && <p className="mt-1.5 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );
}

export function Textarea({ label, error, className = '', ...props }) {
    return (
        <div className={className}>
            {label && <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">{label}</label>}
            <textarea
                {...props}
                className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-800 shadow-sm transition placeholder:text-stone-400 focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:placeholder:text-stone-500 dark:focus:border-teal-600"
            />
            {error && <p className="mt-1.5 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );
}

export function Select({ label, error, className = '', children, ...props }) {
    return (
        <div className={className}>
            {label && <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">{label}</label>}
            <div className="relative">
                <select
                    {...props}
                    className="w-full appearance-none rounded-xl border border-stone-200 bg-white py-2.5 pl-3.5 pr-10 text-sm text-stone-800 shadow-sm transition hover:border-stone-300 focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:border-stone-600 dark:focus:border-teal-600"
                >
                    {children}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            </div>
            {error && <p className="mt-1.5 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );
}

export function FormCard({ children, className = '' }) {
    return (
        <form
            className={`max-w-2xl rounded-2xl border border-stone-200/70 bg-white p-6 shadow-sm shadow-stone-200/40 lg:p-8 dark:border-stone-700/70 dark:bg-stone-900 dark:shadow-none ${className}`}
        >
            {children}
        </form>
    );
}

export function DetailCard({ children, className = '' }) {
    return (
        <div className={`rounded-2xl border border-stone-200/70 bg-white p-6 shadow-sm shadow-stone-200/40 lg:p-8 dark:border-stone-700/70 dark:bg-stone-900 dark:shadow-none ${className}`}>
            {children}
        </div>
    );
}
