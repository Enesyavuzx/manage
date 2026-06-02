import type { Config } from 'tailwindcss'

const c = (v: string) => `rgb(var(${v}) / <alpha-value>)`

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:            c('--c-bg'),
        surface:       c('--c-surface'),
        'surface-2':   c('--c-surface2'),
        border:        c('--c-border'),
        'border-hover':c('--c-border-hover'),
        fg:            c('--c-text'),
        muted:         c('--c-muted'),
        'muted-2':     c('--c-muted2'),
        primary:       c('--c-primary'),
        'primary-2':   c('--c-primary2'),
        xp:            c('--c-xp'),
        success:       c('--c-success'),
        danger:        c('--c-danger'),
      },
      fontFamily: {
        body:    ['var(--font-body)'],
        display: ['var(--font-display)'],
      },
      borderRadius: {
        theme: 'var(--radius)',
      },
      boxShadow: {
        glow:      '0 0 0 1px rgb(var(--c-primary) / 0.3), 0 8px 40px -8px rgb(var(--c-primary) / 0.45)',
        'glow-xp': '0 0 0 1px rgb(var(--c-xp) / 0.3), 0 8px 40px -8px rgb(var(--c-xp) / 0.45)',
        pixel:     '4px 4px 0 0 rgb(var(--c-border-hover) / 1)',
      },
      animation: {
        'fade-in':   'fadeIn 0.25s ease-out',
        'slide-up':  'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
        'pop':       'pop 0.35s cubic-bezier(0.16,1,0.3,1)',
        'float':     'float 6s ease-in-out infinite',
        'shimmer':   'shimmer 2.5s linear infinite',
        'glow-pulse':'glowPulse 2.5s ease-in-out infinite',
        'toast-in':  'toastIn 0.4s cubic-bezier(0.16,1,0.3,1)',
        'spin-slow': 'spin 14s linear infinite',
      },
      keyframes: {
        fadeIn:   { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:  { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pop:      { '0%': { transform: 'scale(0.8)', opacity: '0.6' }, '60%': { transform: 'scale(1.12)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        float:    { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        shimmer:  { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        glowPulse:{ '0%,100%': { opacity: '0.55' }, '50%': { opacity: '1' } },
        toastIn:  { from: { opacity: '0', transform: 'translateX(40px) scale(0.95)' }, to: { opacity: '1', transform: 'translateX(0) scale(1)' } },
      },
    },
  },
  plugins: [],
}

export default config
