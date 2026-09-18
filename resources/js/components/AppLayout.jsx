import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Medallion from './Medallion';
import { usePreferences } from './PreferencesContext';
import ReadingSidebar from './ReadingSidebar';

const i18n = {
    fr: {
        accueil: 'Accueil',
        coran: 'Coran',
        ecouter: 'Écouter',
        hadiths: 'Hadiths',
        rappels: 'Rappels',
        quiz: 'Quiz',
        favoris: 'Favoris',
        profil: 'Profil',
        search: 'Rechercher',
        login: 'Connexion',
        register: 'Inscription',
        logout: 'Déconnexion',
        admin: 'Admin',
        theme: 'Lecture',
        appTagline: 'Le Coran, les hadiths, un rappel par jour.',
        footerText: 'Mushaf — Lecture et écoute du Coran.',
    },
    en: {
        accueil: 'Home',
        coran: 'Quran',
        ecouter: 'Listen',
        hadiths: 'Hadiths',
        rappels: 'Reminders',
        quiz: 'Quiz',
        favoris: 'Favorites',
        profil: 'Profile',
        search: 'Search',
        login: 'Log in',
        register: 'Sign up',
        logout: 'Log out',
        admin: 'Admin',
        theme: 'Mode',
        appTagline: 'The Quran, hadiths, a daily reminder.',
        footerText: 'Mushaf — Read and listen to the Quran.',
    },
    ar: {
        accueil: 'الرئيسية',
        coran: 'القرآن',
        ecouter: 'استماع',
        hadiths: 'الأحاديث',
        rappels: 'تذكير',
        quiz: 'اختبار',
        favoris: 'المفضلة',
        profil: 'الملف',
        search: 'بحث',
        login: 'تسجيل الدخول',
        register: 'إنشاء حساب',
        logout: 'تسجيل الخروج',
        admin: 'الإدارة',
        theme: 'المظهر',
        appTagline: 'القرآن الكريم والأحاديث وتذكير يومي.',
        footerText: 'مشف — قراءة القرآن والاستماع إليه.',
    },
};

const focusRing =
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600';

function Brand() {
    return (
        <Link href="/" className="flex items-center gap-2.5">
            <Medallion className="h-8 w-8" />
            <span className="font-serif text-[1.35rem] font-bold tracking-tight text-stone-900 dark:text-stone-100">
                Mushaf
            </span>
        </Link>
    );
}

export default function AppLayout({ children }) {
    const { auth } = usePage().props;
    const url = usePage().url;
    const [open, setOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { lang, setLang, theme, setTheme } = usePreferences();
    const t = i18n[lang];



    const isActive = (path) =>
        path === '/' ? url === '/' : url === path || url?.startsWith(`${path}/`);

    const navItems = [
        { label: t.accueil, href: '/' },
        { label: t.coran, href: '/coran' },
        { label: t.ecouter, href: '/ecouter' },
        { label: t.hadiths, href: '/hadiths' },
        { label: t.quiz, href: '/quiz' },
        { label: t.rappels, href: '/rappels' },
    ];
    const authNavItems = auth.user
        ? [
              { label: t.favoris, href: '/favoris' },
              { label: t.profil, href: '/profile' },
          ]
        : [];
    const allNavItems = [...navItems, ...authNavItems];

    const tabClass = (href) =>
        isActive(href)
            ? 'rounded-full bg-teal-700 text-white'
            : 'rounded-full text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white';

    return (
        <>
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
            <header className="sticky top-0 z-40 border-b border-stone-200 bg-stone-50/90 backdrop-blur dark:border-stone-800 dark:bg-stone-950/90">
                <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 px-4 py-3 sm:px-6">
                    <Brand />

                    <button
                        type="button"
                        onClick={() => setOpen(!open)}
                        aria-expanded={open}
                        aria-controls="headerPanel"
                        aria-label="Menu"
                        className={`ml-auto flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-xl border border-stone-200 bg-stone-100 lg:hidden dark:border-stone-800 dark:bg-stone-900 ${focusRing}`}
                    >
                        <span
                            className={`h-0.5 w-5 rounded-full bg-stone-800 transition duration-200 dark:bg-stone-200 ${
                                open ? 'translate-y-[7px] rotate-45' : ''
                            }`}
                        />
                        <span
                            className={`h-0.5 w-5 rounded-full bg-stone-800 transition duration-200 dark:bg-stone-200 ${
                                open ? 'opacity-0' : ''
                            }`}
                        />
                        <span
                            className={`h-0.5 w-5 rounded-full bg-stone-800 transition duration-200 dark:bg-stone-200 ${
                                open ? '-translate-y-[7px] -rotate-45' : ''
                            }`}
                        />
                    </button>

                    <div
                        id="headerPanel"
                        className={`${
                            open ? 'flex' : 'hidden'
                        } w-full flex-col gap-4 border-t border-stone-200 pt-4 lg:flex lg:w-auto lg:flex-row lg:items-center lg:gap-5 lg:border-0 lg:pt-0 dark:border-stone-800`}
                    >
                        <ul className="flex flex-wrap items-center gap-1 rounded-full border border-stone-200 bg-stone-100 p-1 dark:border-stone-800 dark:bg-stone-900">
                            {allNavItems.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        className={`block px-4 py-2 text-[0.82rem] font-semibold uppercase tracking-wide transition ${tabClass(
                                            item.href,
                                        )} ${focusRing}`}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href="/search"
                                title={t.search}
                                aria-label={t.search}
                                className={`grid h-10 w-10 place-items-center rounded-full border border-stone-200 bg-stone-100 text-stone-600 transition hover:border-gold hover:text-gold dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400 ${focusRing}`}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </Link>

                            <button
                                type="button"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                title="Lectures récentes"
                                aria-label="Lectures récentes"
                                className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 bg-stone-100 text-stone-600 transition hover:border-gold hover:text-gold dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                </svg>
                            </button>

                            <div className="flex items-center gap-0.5 rounded-full border border-stone-200 bg-stone-100 p-1 dark:border-stone-800 dark:bg-stone-900">
                                {['fr', 'en', 'ar'].map((code) => (
                                    <button
                                        key={code}
                                        type="button"
                                        onClick={() => setLang(code)}
                                        className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide transition ${
                                            lang === code
                                                ? 'bg-teal-700 text-white'
                                                : 'text-stone-400 hover:text-stone-900 dark:text-stone-500 dark:hover:text-white'
                                        } ${focusRing}`}
                                    >
                                        {code}
                                    </button>
                                ))}
                            </div>

                            {auth.user ? (
                                <div className="flex items-center gap-2">
                                    {auth.user.is_admin && (
                                        <Link
                                            href="/admin"
                                            onClick={() => setOpen(false)}
className={`rounded-full border border-stone-300 px-4 py-1.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800 ${focusRing}`}
                                        >
                                            {t.admin}
                                        </Link>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => router.post('/logout')}
                                        className={`rounded-full px-4 py-1.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-white ${focusRing}`}
                                    >
                                        {t.logout}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        href="/login"
                                        onClick={() => setOpen(false)}
                                        className="rounded-full border border-stone-300 px-4 py-1.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                                    >
                                        {t.login}
                                    </Link>
                                    <Link
                                        href="/register"
                                        onClick={() => setOpen(false)}
                                        className={`rounded-full bg-teal-700 px-5 py-1.5 text-sm font-semibold text-white transition hover:bg-teal-800 ${focusRing}`}
                                    >
                                        {t.register}
                                    </Link>
                                </div>
                            )}

                            <div className="flex items-center gap-2 rounded-full border border-stone-200 bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
                                <span>{t.theme}</span>
                                <button
                                    type="button"
                                    onClick={() => setTheme('jour')}
                                    title="Jour"
                                    className={`${theme === 'jour' ? 'text-gold' : 'opacity-40 hover:opacity-80'} ${focusRing}`}
                                >
                                    ☀
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTheme('nuit')}
                                    title="Nuit"
                                    className={`${theme === 'nuit' ? 'text-gold' : 'opacity-40 hover:opacity-80'} ${focusRing}`}
                                >
                                    ☾
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="px-4 pb-32 pt-8 sm:px-6">{children}</main>

            <footer className="border-t border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
                <div className="px-4 py-10 sm:px-6">
                    <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
                        <div className="flex items-center gap-3">
                            <Medallion className="h-7 w-7" />
                            <div>
                                <p className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                                    Mushaf
                                </p>
                                <p className="text-xs text-stone-500 dark:text-stone-400">{t.appTagline}</p>
                            </div>
                        </div>
                        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
                            {allNavItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="text-sm text-stone-500 transition hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <Link
                                href="/search"
                                className="text-sm text-stone-500 transition hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
                            >
                                {t.search}
                            </Link>
                        </nav>
                    </div>
                    <p className="mt-8 border-t border-stone-200 pt-4 text-center text-xs text-stone-400 dark:border-stone-800 dark:text-stone-500">
                        {t.footerText}
                    </p>
                </div>
            </footer>
        </div>
        <ReadingSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </>
    );
}