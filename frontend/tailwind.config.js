/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      // ── Font Families ──────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
      },

      // ── Color Tokens (DESIGN.md §Colors) ──────────────────────────────────
            colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover:   'var(--color-primary-hover)',
          focus:   'var(--color-primary-focus)',
        },
        'on-primary': 'var(--color-on-primary)',
        'brand-secure': 'var(--color-brand-secure)',

        canvas:    'var(--color-canvas)',
        surface: {
          1: 'var(--color-surface-1)',
          2: 'var(--color-surface-2)',
          3: 'var(--color-surface-3)',
          4: 'var(--color-surface-4)',
        },

        hairline: {
          DEFAULT:  'var(--color-hairline)',
          strong:   'var(--color-hairline-strong)',
          tertiary: 'var(--color-hairline-tertiary)',
        },

        ink: {
          DEFAULT:  'var(--color-ink)',
          muted:    'var(--color-ink-muted)',
          subtle:   'var(--color-ink-subtle)',
          tertiary: 'var(--color-ink-tertiary)',
        },

        inverse: {
          canvas:  '#ffffff',
          surface: '#f5f6f6',
          ink:     '#000000',
          hairline:'#e0e0e0',
        },

        semantic: {
          success: 'var(--color-semantic-success)',
          info:    'var(--color-semantic-info)',
          warning: 'var(--color-semantic-warning)',
          error:   'var(--color-semantic-error)',
          overlay: 'var(--color-semantic-overlay)',
        },

        status: {
          available:   'var(--color-status-available)',
          allocated:   'var(--color-status-allocated)',
          maintenance: 'var(--color-status-maintenance)',
          disposed:    'var(--color-status-disposed)',
          'available-bg': 'var(--color-status-available-bg)',
          'allocated-bg': 'var(--color-status-allocated-bg)',
          'maintenance-bg': 'var(--color-status-maintenance-bg)',
          'disposed-bg': 'var(--color-status-disposed-bg)',
        },
      },

      // ── Border Radius Tokens (DESIGN.md §Shapes) ──────────────────────────
      borderRadius: {
        xs:   '4px',
        sm:   '6px',
        md:   '8px',
        lg:   '12px',
        xl:   '16px',
        xxl:  '24px',
        pill: '9999px',
        full: '9999px',
      },

      // ── Spacing Tokens (DESIGN.md §Layout) ────────────────────────────────
      spacing: {
        xxs:     '4px',
        xs:      '8px',
        sm:      '12px',
        md:      '16px',
        lg:      '24px',
        xl:      '32px',
        xxl:     '48px',
        section: '96px',
      },

      // ── Font Size Tokens (DESIGN.md §Typography) ──────────────────────────
      fontSize: {
        'hero':       ['56px', { lineHeight: '1.08', letterSpacing: '-1.8px' }],
        'display-lg': ['40px', { lineHeight: '1.12', letterSpacing: '-1.0px' }],
        'display-md': ['28px', { lineHeight: '1.20', letterSpacing: '-0.6px' }],
        'subhead':    ['20px', { lineHeight: '1.40', letterSpacing: '-0.1px' }],
        'card-title': ['18px', { lineHeight: '1.30', letterSpacing: '-0.2px' }],
        'body-lg':    ['18px', { lineHeight: '1.50', letterSpacing: '-0.05px' }],
        'body':       ['16px', { lineHeight: '1.50', letterSpacing: '-0.05px' }],
        'body-sm':    ['14px', { lineHeight: '1.50', letterSpacing: '0' }],
        'caption':    ['12px', { lineHeight: '1.40', letterSpacing: '0' }],
        'btn':        ['14px', { lineHeight: '1.20', letterSpacing: '0' }],
        'eyebrow':    ['12px', { lineHeight: '1.30', letterSpacing: '0.8px' }],
        'nav-link':   ['14px', { lineHeight: '1.40', letterSpacing: '0' }],
        'mono':       ['13px', { lineHeight: '1.50', letterSpacing: '0' }],
      },

      // ── Motion Tokens (DESIGN.md §Motion) — for arbitrary class usage ─────
      transitionDuration: {
        instant: '80ms',
        fast:    '140ms',
        base:    '220ms',
        slow:    '360ms',
        page:    '520ms',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.2, 0, 0, 1)',
        entrance: 'cubic-bezier(0, 0, 0.2, 1)',
        exit:     'cubic-bezier(0.4, 0, 1, 1)',
      },

      // ── Box Shadows — ONLY for modal-panel and command-palette ────────────
            boxShadow: {
        modal:   'var(--shadow-modal)',
        palette: 'var(--shadow-palette)',
      },

      // ── Backdrop Blur — sticky filter bar ─────────────────────────────────
      backdropBlur: {
        'filter-bar': '20px',
      },
    },
  },
  plugins: [],
}
