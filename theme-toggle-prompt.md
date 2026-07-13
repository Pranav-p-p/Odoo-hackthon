# Task: Add a Real Light Theme + Runtime Toggle to AssetFlow

## Context

`DESIGN.md` is the single source-of-truth design-token spec for this repo (YAML frontmatter + prose, consolidated from Linear/Apple/Claude analyses). It currently ships dark-only, with an explicit rule against light mode. We're reversing that: add a genuine, fully interactive light theme, switchable at runtime by a single button click with zero page reload — the same pattern GitHub, Linear, and Vercel use.

**Do not create a second design file.** Everything in `DESIGN.md` outside the `colors:` block — typography, spacing, motion, components, shapes, responsive rules (~90% of the document) — already references color abstractly via `{colors.token-name}`, never a literal hex. None of that needs to change. Only the color *values* get a second set, under the exact same token names, so every existing `{colors.*}` reference in the rest of the file keeps resolving correctly regardless of active theme.

## Phase 1 — Restructure DESIGN.md

**1. Convert the `colors:` block to dual values.** Change every entry from a flat `token: hex` to a `token: { dark: hex, light: hex }` pair. Use this table as the light-mode starting point — it mirrors the dark palette's structure (same number of steps, same relative logic, inverted in luminance direction) rather than being invented from scratch. Treat these as real starting values to implement now, then tune visually once rendered — don't leave them as placeholders.

| Token | Dark (current) | Light (proposed) |
|---|---|---|
| `primary` | `#5e6ad2` | `#5e6ad2` |
| `primary-hover` | `#828fff` | `#4c56b8` |
| `primary-focus` | `#5e69d1` | `#5e69d1` |
| `on-primary` | `#ffffff` | `#ffffff` |
| `brand-secure` | `#7a7fad` | `#5f6491` |
| `canvas` | `#010102` | `#fafbfc` |
| `surface-1` | `#0f1011` | `#f4f5f7` |
| `surface-2` | `#141516` | `#eef0f3` |
| `surface-3` | `#18191a` | `#e8eaee` |
| `surface-4` | `#191a1b` | `#e3e5ea` |
| `hairline` | `#23252a` | `#e2e4e8` |
| `hairline-strong` | `#34343a` | `#d1d4da` |
| `hairline-tertiary` | `#3e3e44` | `#c2c6ce` |
| `ink` | `#f7f8f8` | `#14151a` |
| `ink-muted` | `#d0d6e0` | `#3d4048` |
| `ink-subtle` | `#8a8f98` | `#6b6f78` |
| `ink-tertiary` | `#62666d` | `#8a8e97` |
| `semantic-success` | `#3fb950` | `#1a7f37` |
| `semantic-info` | `#58a6ff` | `#0969da` |
| `semantic-warning` | `#d29922` | `#9a6700` |
| `semantic-error` | `#f85149` | `#cf222e` |
| `semantic-overlay` | `#000000` | `#000000` |
| `status-disposed` | `#8b949e` | `#6e7781` |

`status-available` / `status-allocated` / `status-maintenance` continue mapping directly onto `semantic-success` / `semantic-info` / `semantic-warning` in both themes — no separate row needed.

Notes on the non-obvious rows:
- `primary` stays constant — brand color should read identically in both themes (Linear does the same in production). Only `primary-hover` deepens instead of brightening for light mode, since brightening a mid-tone lavender further would wash out against a white fill; deepening preserves contrast the same way brightening does against black.
- The semantic spectrum and `status-disposed` are deepened, not reused verbatim — they were tuned for contrast on near-black canvas (Known Gaps says so directly), and several would likely fail WCAG AA against white unchanged.
- `semantic-overlay` is intentionally unchanged — a modal scrim's job is to recede the background regardless of theme.

**2. Split the "Inverse (Light) Escape Hatch" section into two things:**
- A new **"Light Theme"** section with full parity to the dark theme — its own surface ladder, hairline weights, and ink ramp (the table above), documented with the same rigor as the existing Colors section.
- A smaller, separate **"Print / PDF Export"** section that keeps the *original* inverse tokens (`#ffffff` / `#000000`, no translucency) for printable audit reports specifically. Print has different constraints (ink economy, no alpha compositing) from an on-screen light theme — don't conflate the two even though the values are close.

**3. Rewrite the Do's and Don'ts.** Remove "Don't introduce a light mode for the application" entirely. Replace with rules that make the *new* system foolproof instead:
- "Every new component must define both a dark and light value for any non-token color it introduces — never ship a component that only renders correctly in one theme."
- "`{colors.primary}` stays identical across both themes; only surfaces, hairlines, ink, and the semantic spectrum carry theme-specific values."

**4. Update Known Gaps.** Remove "Dark mode is the only shipped theme... a genuine light theme is explicitly out of scope" (now false). Add: "Light-theme semantic and status-badge values were derived by contrast logic, not extracted from a shipping instance — confirm WCAG AA once rendered, especially low-alpha badge fills against full-strength text on a white canvas."

**5. Add a "Theming & Toggle Implementation" subsection** documenting the mechanism in Phase 2, so future contributors don't have to reverse-engineer it from source.

## Phase 2 — Implement It

**1. Audit first.** Grep the frontend for hardcoded hex/rgb values and Tailwind arbitrary-value classes (`bg-[#...]`) in component files. Anywhere a color bypasses the `{colors.*}` token system will silently ignore the toggle — fix these as part of this task, don't defer them.

**2. Define every token as a CSS custom property** (e.g. in `frontend/src/index.css`), scoped like:

```css
:root, [data-theme="dark"] {
  --color-canvas: #010102;
  --color-surface-1: #0f1011;
  /* ...every token, dark values from the table above... */
}
[data-theme="light"] {
  --color-canvas: #fafbfc;
  --color-surface-1: #f4f5f7;
  /* ...every token, light values... */
}
```

Dark is the default/root scope — it's AssetFlow's native identity; light is the override.

**3. Point Tailwind at the variables**, not static hex, in `frontend/tailwind.config.js`:

```js
colors: {
  canvas: 'var(--color-canvas)',
  'surface-1': 'var(--color-surface-1)',
  'surface-2': 'var(--color-surface-2)',
  ink: 'var(--color-ink)',
  hairline: 'var(--color-hairline)',
  primary: 'var(--color-primary)',
  // ...rest of the token set
}
```

Every existing `bg-surface-1`, `text-ink`, `border-hairline` className keeps working unchanged and just resolves to whichever theme is active. **Do not use Tailwind's `dark:` variant prefix anywhere** — that would mean duplicating every className instead of letting the CSS variables do the work. Check the installed Tailwind major version first (v3 and v4 wire this up differently) and adapt the config syntax accordingly, but keep the CSS-variable-per-token approach regardless of version.

**4. Build a `ThemeProvider`** (React Context) exposing `{ theme: 'dark' | 'light', toggleTheme, setTheme }`:
- Initial value: `localStorage.getItem('assetflow-theme')` → else `window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'` → else fall back to `'dark'`.
- `toggleTheme()` flips the value, persists to `localStorage`, and sets `document.documentElement.setAttribute('data-theme', value)`.

**5. Prevent flash-of-wrong-theme.** Add a small inline `<script>` at the very top of `frontend/index.html`'s `<head>`, before any bundled script tag, that synchronously reads localStorage/`matchMedia` and sets `data-theme` on `<html>` before first paint. Without this there's a visible flash of the wrong theme on every reload.

**6. Build the toggle button** as a new `theme-toggle` component using the existing `{component.button-icon-circular}` spec (36px, `{colors.surface-2}` fill, 1px `{colors.hairline}` border, `{rounded.full}`). Use `Sun`/`Moon` from `lucide-react` (already in the stack), cross-fading between them over `{motion.duration-fast}` (140ms) with `{motion.ease-standard}`, gated by `prefers-reduced-motion` exactly like the rest of the motion system. Place it in `{component.top-nav}`, right side, next to the notification bell.

**7. Special-case what should NOT theme-swap:**
- `modal-backdrop` and `{colors.semantic-overlay}` stay black-based in both themes.
- Reduce (don't reuse verbatim) the alpha on the two heavy shadows — `modal-panel` and `command-palette` — for light mode. Start around `rgba(0,0,0,0.12)` and `rgba(0,0,0,0.16)` respectively and tune by eye; the dark-mode alphas (0.44/0.56) exist specifically because shadows barely register on near-black, which isn't true on white.
- Give `sticky-filter-bar`'s frosted fill a white-based light equivalent (start at `rgba(255,255,255,0.75)`) instead of reusing the near-black `rgba(15,16,17,0.80)`.

## Acceptance Checklist

- [ ] Toggling is instant, no page reload, no flash on hard refresh
- [ ] Preference persists across sessions and respects system preference on first visit
- [ ] Every component renders correctly in both themes at all four breakpoints — spot-check the Kanban board, data table, modal, command palette, and status badges specifically, since they carry the most color logic
- [ ] Status badges and semantic-spectrum text pass WCAG AA contrast against their canvas in **both** themes
- [ ] `{colors.primary}` reads correctly as both a button fill and inline text-link color on the light canvas
- [ ] No component still references a hardcoded hex/rgb value outside the token system
