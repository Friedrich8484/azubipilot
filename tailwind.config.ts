import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#14243A',
        brand: { DEFAULT: '#3978E8', dark: '#2F68CF', soft: '#E9F0FD' },
        teal: { DEFAULT: '#36C9B5', soft: '#DFF6F2' },
        canvas: '#F6F8FB',
        ink: '#202B3C',
        muted: '#5F6B7D',
        line: '#E3E9F1',
        danger: { DEFAULT: '#C93D55', soft: '#FBE9ED' },
        ok: { DEFAULT: '#17875B', soft: '#E1F5EC' },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,36,58,.05), 0 8px 24px rgba(20,36,58,.06)',
      },
      borderRadius: { xl2: '16px' },
    },
  },
  plugins: [],
};

export default config;
