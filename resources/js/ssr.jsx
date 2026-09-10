import { createInertiaApp } from '@inertiajs/react';
import { AudioProvider } from './components/AudioProvider';
import { PreferencesProvider } from './components/PreferencesContext';
import { ConfirmProvider } from './components/ConfirmDialog';

createInertiaApp({
    title: (title) => (title ? `${title} · Mushaf` : 'Mushaf'),
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        return pages[`./Pages/${name}.jsx`];
    },
    render: (_, { App, props }) =>
        renderToString(
            <PreferencesProvider>
                <AudioProvider auth={props.page.props.auth}>
                    <ConfirmProvider>
                        <App {...props} />
                    </ConfirmProvider>
                </AudioProvider>
            </PreferencesProvider>,
        ),
});
