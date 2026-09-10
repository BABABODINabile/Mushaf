import { createInertiaApp } from '@inertiajs/react';
import { AudioProvider } from './components/AudioProvider';
import { PreferencesProvider } from './components/PreferencesContext';
import { ConfirmProvider } from './components/ConfirmDialog';

if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('mushaf-theme');
    document.documentElement.setAttribute('data-theme', savedTheme === 'nuit' ? 'nuit' : 'jour');

    const savedLang = localStorage.getItem('mushaf-lang');
    document.documentElement.setAttribute('lang', savedLang === 'en' ? 'en' : savedLang === 'ar' ? 'ar' : 'fr');
}

createInertiaApp({
    strictMode: true,
    progress: {
        color: '#0f766e',
    },
    title: (title) => (title ? `${title} · Mushaf` : 'Mushaf'),
    withApp(app, { page }) {
        if (typeof window !== 'undefined' && page.props.ziggy) {
            globalThis.Ziggy = page.props.ziggy;
        }

        return (
            <PreferencesProvider>
                <AudioProvider auth={page.props.auth}>
                    <ConfirmProvider>{app}</ConfirmProvider>
                </AudioProvider>
            </PreferencesProvider>
        );
    },
});
