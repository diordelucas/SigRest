import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark';
export type ThemePreset = 'pessego' | 'lavanda' | 'menta' | 'azul-bebe' | 'rosa';

export const THEME_PRESETS: { id: ThemePreset; label: string; swatch: string }[] = [
  { id: 'pessego', label: 'Pêssego', swatch: '#f97316' },
  { id: 'lavanda', label: 'Lavanda', swatch: '#8b5cf6' },
  { id: 'menta', label: 'Menta', swatch: '#14b8a6' },
  { id: 'azul-bebe', label: 'Azul-bebê', swatch: '#0ea5e9' },
  { id: 'rosa', label: 'Rosa', swatch: '#f43f5e' },
];

interface ThemeContextValue {
  mode: ThemeMode;
  preset: ThemePreset;
  toggleMode: () => void;
  setPreset: (preset: ThemePreset) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const MODE_KEY = '@sigrest:theme-mode';
const PRESET_KEY = '@sigrest:theme-preset';

function readStoredMode(): ThemeMode {
  const stored = localStorage.getItem(MODE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readStoredPreset(): ThemePreset {
  const stored = localStorage.getItem(PRESET_KEY) as ThemePreset | null;
  return THEME_PRESETS.some((p) => p.id === stored) ? (stored as ThemePreset) : 'pessego';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(readStoredMode);
  const [preset, setPresetState] = useState<ThemePreset>(readStoredPreset);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
    localStorage.setItem(MODE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    // "pêssego" é o default do CSS (:root sem atributo) — não precisa do atributo.
    if (preset === 'pessego') {
      document.documentElement.removeAttribute('data-preset');
    } else {
      document.documentElement.setAttribute('data-preset', preset);
    }
    localStorage.setItem(PRESET_KEY, preset);
  }, [preset]);

  const toggleMode = () => setMode((current) => (current === 'dark' ? 'light' : 'dark'));
  const setPreset = (next: ThemePreset) => setPresetState(next);

  return (
    <ThemeContext.Provider value={{ mode, preset, toggleMode, setPreset }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme precisa ser usado dentro de um ThemeProvider');
  }
  return context;
}
