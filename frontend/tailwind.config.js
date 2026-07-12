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
        // Brand / Interaction accent — the ONE chromatic interaction color
        primary: {
          DEFAULT: '#5e6ad2',
          hover:   '#828fff',
          focus:   '#5e69d1',
        },
        'on-primary': '#ffffff',
        'brand-secure': '#7a7fad',

        // Dark surface ladder
        canvas:    '#010102',
        surface: {
          1: '#0f1011',
          2: '#141516',
          3: '#18191a',
          4: '#191a1b',
        },

        // Hairlines — three weights
        hairline: {
          DEFAULT:  '#23252a',
          strong:   '#34343a',
          tertiary: '#3e3e44',
        },

        // Text on dark
        ink: {
          DEFAULT:  '#f7f8f8',
          muted:    '#d0d6e0',
          subtle:   '#8a8f98',
          tertiary: '#62666d',
        },

        // Inverse (light) — printable reports ONLY
        inverse: {
          canvas:  '#ffffff',
          surface: '#f5f6f6',
          ink:     '#000000',
          hairline:'#e0e0e0',
        },

        // Semantic spectrum — data states & system feedback; NEVER on chrome
        semantic: {
          success: '#3fb950',
          info:    '#58a6ff',
          warning: '#d29922',
          error:   '#f85149',
          overlay: '#000000',
        },

        // Asset-lifecycle state palette — maps onto semantic spectrum
        status: {
          available:   '#3fb950',
          allocated:   '#58a6ff',
          maintenance: '#d29922',
          disposed:    '#8b949e',
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
        modal:   '0 16px 48px rgba(0, 0, 0, 0.44)',
        palette: '0 24px 64px rgba(0, 0, 0, 0.56)',
      },

      // ── Backdrop Blur — sticky filter bar ─────────────────────────────────
      backdropBlur: {
        'filter-bar': '20px',
      },
    },
  },
  plugins: [],
}
