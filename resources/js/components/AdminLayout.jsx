import { Link, usePage } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import {
    DashboardIcon,
    UsersIcon,
    BookIcon,
    ScrollIcon,
    HadithIcon,
    FolderIcon,
    MailIcon,
    TerminalIcon,
    BackIcon,
} from '../components/Icons';
import FlashMessages from '../components/FlashMessages';
import { usePreferences } from '../components/PreferencesContext';

export default function AdminLayout({ children }) {
    const { auth } = usePage().props;
    const [collapsed, setCollapsed] = useState(false);
    const { theme, setTheme } = usePreferences();

    const toggleTheme = useCallback(() => {
        setTheme(theme === 'nuit' ? 'jour' : 'nuit');
    }, [theme, setTheme]);

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: DashboardIcon },
        { name: 'Utilisateurs', href: '/admin/users', icon: UsersIcon },
        { name: 'Sourates', href: '/admin/surahs', icon: BookIcon },
        { name: 'Versets', href: '/admin/ayahs', icon: ScrollIcon },
        { name: 'Hadiths', href: '/admin/hadiths', icon: HadithIcon },
        { name: 'Collections', href: '/admin/collections', icon: FolderIcon },
        { name: 'Abonnements', href: '/admin/subscriptions', icon: MailIcon },
        { name: 'Commandes', href: '/admin/commands', icon: TerminalIcon },
    ];

    const isActive = (href) => window.location.pathname === href;

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
            {/* Sidebar fixe */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-stone-200/80 bg-white/85 shadow-sm transition-all duration-300 dark:border-stone-800 dark:bg-stone-900/70 ${
                    collapsed ? 'w-16' : 'w-64'
                }`}
                style={{ backdropFilter: 'blur(16px)' }}
            >
                {/* Brand */}
                <div className="flex h-16 items-center gap-2 px-4">
                    <Link href="/admin" className="flex flex-1 items-center gap-2.5">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-sm font-bold text-white shadow-lg shadow-teal-700/30 ring-1 ring-white/20">
                            م
                        </span>
                        {!collapsed && (
                            <span className="flex flex-col leading-none">
                                <span className="text-base font-bold tracking-tight text-stone-900 dark:text-stone-100">Mushaf</span>
                                <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400">Administration</span>
                            </span>
                        )}
                    </Link>
                    <button
                        type="button"
                        onClick={() => setCollapsed((c) => !c)}
                        className="hidden shrink-0 rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600 dark:text-stone-500 dark:hover:bg-stone-800 dark:hover:text-stone-300 md:inline-flex"
                        aria-label={collapsed ? 'Déplier le menu' : 'Replier le menu'}
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {collapsed ? (
                                <path d="M9 18l6-6-6-6" />
                            ) : (
                                <path d="M15 9l-6 6 6 6" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <div className={`px-2 pb-2 ${!collapsed ? 'pt-4' : 'pt-2'}`}>
                    <p className={`mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-600 ${collapsed ? 'sr-only' : ''}`}>
                        Menu
                    </p>
                </div>
                <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-2">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                title={collapsed ? item.name : undefined}
                                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                    active
                                        ? 'bg-gradient-to-r from-teal-50 to-teal-500/5 text-teal-700 dark:from-teal-900/40 dark:to-teal-900/10 dark:text-teal-300'
                                        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100'
                                }`}
                            >
                                {active && (
                                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-teal-500 dark:bg-teal-400" />
                                )}
                                <Icon className={`h-5 w-5 shrink-0 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                                {!collapsed && <span>{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="border-t border-stone-200/80 p-2 dark:border-stone-800">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
                    >
                        {theme === 'nuit' ? (
                            <svg className="h-5 w-5 shrink-0 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="4" />
                                <path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5 shrink-0 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                            </svg>
                        )}
                        {!collapsed && <span>{theme === 'nuit' ? 'Mode jour' : 'Mode nuit'}</span>}
                    </button>

                    <Link
                        href="/profile"
                        title="Mon profil"
                        className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-stone-100 dark:hover:bg-stone-800 ${collapsed ? 'justify-center' : ''}`}
                    >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-sm font-semibold text-white shadow ring-2 ring-white/60 dark:ring-stone-700">
                            {(auth?.user?.name || '?').charAt(0).toUpperCase()}
                        </span>
                        {!collapsed && (
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-stone-800 dark:text-stone-100">{auth?.user?.name}</p>
                                <p className="truncate text-[11px] text-stone-400 dark:text-stone-500">Administrateur</p>
                            </div>
                        )}
                    </Link>

                    <Link
                        href="/"
                        className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
                    >
                        <BackIcon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>Retour au site</span>}
                    </Link>
                </div>
            </aside>

            {/* Main content (décalé selon la sidebar) */}
            <main className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
                <FlashMessages />
                <div className="px-6 py-8 lg:px-8">{children}</div>
            </main>
        </div>
    );
}
