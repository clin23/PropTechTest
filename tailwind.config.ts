import type { Config } from 'tailwindcss';

const withVar = (v: string) => ({ DEFAULT: `var(${v})` });

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { base: 'var(--bg-base)', surface: 'var(--bg-surface)', elevated: 'var(--bg-elevated)' },
        border: withVar('--border'),
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          disabled: 'var(--text-disabled)',
        },
        primary: withVar('--primary'),
        success: withVar('--success'),
        warning: withVar('--warning'),
        danger: withVar('--danger'),
        info: withVar('--info'),
      },
      boxShadow: { sm: 'var(--shadow-1)', md: 'var(--shadow-1)' },
      transitionDuration: { 120: '120ms', 160: '160ms', 200: '200ms' },
    },
  },
  plugins: [],
};

export default config;
