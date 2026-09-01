import { createContext, useContext, useState, useEffect } from 'react';

const PreferencesContext = createContext(null);
const THEME_STORAGE_KEY = 'mushaf-theme';
const FONT_SIZE_STORAGE_KEY = 'mushaf-font-size';
const LINE_HEIGHT_STORAGE_KEY = 'mushaf-line-height';
const READING_MODE_STORAGE_KEY = 'mushaf-reading-mode';

function readStored(key, fallback, parse) {
    try {
        const raw = localStorage.getItem(key);
        return parse(raw);
    } catch {
        return fallback;
    }
}

function readInitialLang() {
    const raw = localStorage.getItem('mushaf-lang');
    return ['fr', 'en', 'ar'].includes(raw) ? raw : 'fr';
}

function readInitialTheme() {
    return readStored(THEME_STORAGE_KEY, 'jour', (raw) => (raw === 'nuit' ? 'nuit' : 'jour'));
}

function readInitialFontSize() {
    return readStored(FONT_SIZE_STORAGE_KEY, 2, (raw) => {
        const v = parseFloat(raw ?? '');
        return Number.isFinite(v) ? v : 2;
    });
}

function readInitialLineHeight() {
    return readStored(LINE_HEIGHT_STORAGE_KEY, 2.4, (raw) => {
        const v = parseFloat(raw ?? '');
        return Number.isFinite(v) ? v : 2.4;
    });
}

function readInitialReadingMode() {
    return readStored(READING_MODE_STORAGE_KEY, 'verse', (raw) =>
        raw === 'reading' ? 'reading' : 'verse'
    );
}

export function PreferencesProvider({ children }) {
    const [lang, setLangState] = useState(readInitialLang);
    const [theme, setThemeState] = useState(readInitialTheme);
    const [fontSize, setFontSizeState] = useState(readInitialFontSize);
    const [lineHeight, setLineHeightState] = useState(readInitialLineHeight);
    const [readingMode, setReadingModeState] = useState(readInitialReadingMode);

    useEffect(() => {
        document.documentElement.setAttribute('lang', lang);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const setLang = (next) => {
        setLangState(next);
        localStorage.setItem('mushaf-lang', next);
        document.documentElement.setAttribute('lang', next);
    };

    const setTheme = (next) => {
        setThemeState(next);
        localStorage.setItem(THEME_STORAGE_KEY, next);
        document.documentElement.setAttribute('data-theme', next);
    };

    const setFontSize = (v) => {
        setFontSizeState(v);
        localStorage.setItem(FONT_SIZE_STORAGE_KEY, String(v));
    };

    const setLineHeight = (v) => {
        setLineHeightState(v);
        localStorage.setItem(LINE_HEIGHT_STORAGE_KEY, String(v));
    };

    const setReadingMode = (mode) => {
        setReadingModeState(mode);
        localStorage.setItem(READING_MODE_STORAGE_KEY, mode);
    };

    return (
        <PreferencesContext.Provider
            value={{ lang, setLang, theme, setTheme, fontSize, setFontSize, lineHeight, setLineHeight, readingMode, setReadingMode }}
        >
            {children}
        </PreferencesContext.Provider>
    );
}

export function usePreferences() {
    const ctx = useContext(PreferencesContext);
    if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
    return ctx;
}
