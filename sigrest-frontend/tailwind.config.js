// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          900: '#7c2d12',
          DEFAULT: '#ea580c',
        },
        dark: {
          DEFAULT: '#0f172a',
          lighter: '#1e293b',
          border: '#334155',
        },
        accent: "hsl(0, 70%, 45%)", // vermelho destaque
      },
      borderRadius: {
        lg: "0.75rem",
      },
      boxShadow: {
        soft: "0 4px 6px rgba(0,0,0,0.08)",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
