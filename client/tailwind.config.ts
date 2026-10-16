import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── Design tokens mapped to CSS variables (see globals.css) ─────────
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // ─── Status badge colors ──────────────────────────────────────────
        status: {
          waiting: 'hsl(var(--status-waiting))',
          'waiting-fg': 'hsl(var(--status-waiting-fg))',
          'in-progress': 'hsl(var(--status-in-progress))',
          'in-progress-fg': 'hsl(var(--status-in-progress-fg))',
          completed: 'hsl(var(--status-completed))',
          'completed-fg': 'hsl(var(--status-completed-fg))',
          cancelled: 'hsl(var(--status-cancelled))',
          'cancelled-fg': 'hsl(var(--status-cancelled-fg))',
          'no-show': 'hsl(var(--status-no-show))',
          'no-show-fg': 'hsl(var(--status-no-show-fg))',
          booked: 'hsl(var(--status-booked))',
          'booked-fg': 'hsl(var(--status-booked-fg))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-cairo)', 'var(--font-ibm-plex)', 'system-ui', 'sans-serif'],
      },
      // Minimum 44px touch targets (WCAG 2.5.5)
      minHeight: { touch: '44px' },
      minWidth: { touch: '44px' },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'pulse-alert': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-alert': 'pulse-alert 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
