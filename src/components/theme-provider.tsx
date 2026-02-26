'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes';

type CustomPreferences = {
    themeColor: string;
    fontSize: string;
    setThemeColor: (color: string) => void;
    setFontSize: (size: string) => void;
};

export const PreferencesContext = React.createContext<CustomPreferences>({
    themeColor: 'emerald',
    fontSize: 'base',
    setThemeColor: () => { },
    setFontSize: () => { },
});

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    const [themeColor, setThemeColor] = React.useState('emerald');
    const [fontSize, setFontSize] = React.useState('base');

    React.useEffect(() => {
        const savedColor = localStorage.getItem('theme-color');
        const savedFont = localStorage.getItem('font-size');
        if (savedColor) setThemeColor(savedColor);
        if (savedFont) setFontSize(savedFont);
    }, []);

    const handleSetThemeColor = (color: string) => {
        setThemeColor(color);
        localStorage.setItem('theme-color', color);
    };

    const handleSetFontSize = (size: string) => {
        setFontSize(size);
        localStorage.setItem('font-size', size);
    };

    React.useEffect(() => {
        const root = window.document.documentElement;

        // Remove old color classes
        root.classList.remove('theme-emerald', 'theme-blue', 'theme-violet', 'theme-rose');
        root.classList.add(`theme-${themeColor}`);

        // Remove old font sizing classes
        root.classList.remove('text-sm', 'text-base', 'text-lg');
        root.classList.add(`text-${fontSize}`);
    }, [themeColor, fontSize]);

    return (
        <PreferencesContext.Provider
            value={{ themeColor, fontSize, setThemeColor: handleSetThemeColor, setFontSize: handleSetFontSize }}
        >
            <NextThemesProvider {...props}>{children}</NextThemesProvider>
        </PreferencesContext.Provider>
    );
}
