/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Rich dark palette
        surface: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          850: '#172033',
          900: '#0f172a',
          950: '#080c18',
        },
        safe:     '#22c55e',
        warning:  '#f59e0b',
        critical: '#ef4444',
        present:  '#22c55e',
        absent:   '#ef4444',
        holiday:  '#94a3b8',
        massbunk: '#f97316',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-light': 'radial-gradient(at 20% 20%, hsla(240,100%,92%,0.4) 0px, transparent 55%), radial-gradient(at 80% 0%, hsla(189,100%,92%,0.4) 0px, transparent 55%), radial-gradient(at 80% 80%, hsla(262,100%,92%,0.3) 0px, transparent 55%)',
        'mesh-dark':  'radial-gradient(at 20% 20%, hsla(240,60%,15%,0.6) 0px, transparent 55%), radial-gradient(at 80% 0%, hsla(200,60%,12%,0.5) 0px, transparent 55%), radial-gradient(at 80% 80%, hsla(262,60%,12%,0.6) 0px, transparent 55%)',
      },
      boxShadow: {
        'glow-sm':  '0 0 12px 0 rgba(99,102,241,0.15)',
        'glow':     '0 0 24px 0 rgba(99,102,241,0.2)',
        'glow-lg':  '0 0 48px 0 rgba(99,102,241,0.3)',
        'card':     '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
        'card-dark':'0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)',
        'elevated': '0 4px 6px rgba(0,0,0,0.05), 0 10px 40px rgba(0,0,0,0.1)',
      },
      animation: {
        'fade-in':     'fadeIn 0.3s ease-in-out',
        'slide-up':    'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow':  'pulse 3s infinite',
        'float':       'float 6s ease-in-out infinite',
        'shimmer':     'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
