import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, Palette, Check } from 'lucide-react';
import { useTheme, THEME_PRESETS } from '../contexts/ThemeContext';

export default function ThemeSwitcher() {
  const { mode, preset, toggleMode, setPreset } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 text-ink-muted hover:text-ink transition-colors rounded-full hover:bg-surface-2 focus:outline-none"
        title="Personalizar aparência"
        aria-label="Personalizar aparência"
      >
        <Palette size={20} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 card p-4 z-50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-ink">Aparência</span>
            <button
              onClick={toggleMode}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-2 text-ink hover:bg-line transition-colors"
            >
              {mode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              {mode === 'dark' ? 'Claro' : 'Escuro'}
            </button>
          </div>

          <p className="text-xs text-ink-muted mb-2">Cor de destaque</p>
          <div className="grid grid-cols-5 gap-2">
            {THEME_PRESETS.map((option) => (
              <button
                key={option.id}
                onClick={() => setPreset(option.id)}
                title={option.label}
                aria-label={option.label}
                className="w-9 h-9 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-offset-surface transition-all"
                style={{
                  backgroundColor: option.swatch,
                  // Tailwind não gera classes dinâmicas para cores arbitrárias por variável;
                  // aqui o próprio swatch já é a cor final do preset, então o estilo inline é direto.
                  ['--tw-ring-color' as any]: preset === option.id ? option.swatch : 'transparent',
                }}
              >
                {preset === option.id && <Check size={16} className="text-white drop-shadow" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
