// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Escala de destaque (preset escolhido pelo usuário): passa a vir de
        // variáveis CSS em index.css, então trocar o preset ou o modo
        // claro/escuro muda a cor em todo o app sem recompilar nada.
        primary: {
          50: 'rgb(var(--color-primary-50) / <alpha-value>)',
          100: 'rgb(var(--color-primary-100) / <alpha-value>)',
          200: 'rgb(var(--color-primary-200) / <alpha-value>)',
          300: 'rgb(var(--color-primary-300) / <alpha-value>)',
          400: 'rgb(var(--color-primary-400) / <alpha-value>)',
          500: 'rgb(var(--color-primary-500) / <alpha-value>)',
          600: 'rgb(var(--color-primary-600) / <alpha-value>)',
          700: 'rgb(var(--color-primary-700) / <alpha-value>)',
          800: 'rgb(var(--color-primary-800) / <alpha-value>)',
          900: 'rgb(var(--color-primary-900) / <alpha-value>)',
          DEFAULT: 'rgb(var(--color-primary-500) / <alpha-value>)',
        },
        // Tokens neutros: tambem por variavel, trocam com o modo claro/escuro.
        // Nomes deliberadamente distintos dos utilitarios nativos do Tailwind
        // (text-*, border-*) para nao colidir com eles.
        canvas: 'rgb(var(--color-canvas) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--color-surface-2) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        'ink-muted': 'rgb(var(--color-ink-muted) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',

        // Mantidos para os componentes ainda nao migrados ao novo sistema de
        // tokens (ver PLANO em ROADMAP no fim da migracao).
        dark: {
          DEFAULT: '#0f172a',
          lighter: '#1e293b',
          border: '#334155',
        },
        accent: "hsl(0, 70%, 45%)",
      },
      boxShadow: {
        soft: "0 4px 6px rgba(0,0,0,0.08)",
        card: "0 1px 3px rgb(0 0 0 / 0.06), 0 1px 2px rgb(0 0 0 / 0.04)",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
