---
version: alpha
name: AssetFlow-design-system
description: A dark-canvas operations interface for AssetFlow, an enterprise asset & resource management system. The system is built on Linear's surface-ladder + hairline depth philosophy over a near-black canvas, with a single chromatic brand accent (Linear lavender-blue) reserved strictly for interaction chrome (brand mark, primary CTA, focus rings, link emphasis) and a separate semantic spectrum reserved strictly for data states (asset lifecycle, workflow stages, severity). Type runs a single sans family (Inter) with Apple-tight negative tracking on display sizes; JetBrains Mono carries asset IDs, audit codes, and timestamps. Shape language is rounded-rect at 8px for every action, with the pill reserved exclusively for state tokens — rounded-rect reads as "action," pill reads as "state." Motion is functional and restrained (spring-physics Kanban drags, staggered entrance, route view transitions, KPI count-ups), degrading cleanly under prefers-reduced-motion. No drop shadows on chrome — depth comes from the four-step surface ladder and three hairline weights.

colors:
  # ──────────────────────────────────────────────────────────────────────────
  # Dual-theme tokens. Every color carries BOTH a `dark` and `light` value so the
  # rest of this file keeps resolving `{colors.token-name}` regardless of active
  # theme. Implementation maps each token to a CSS custom property whose value
  # flips with `[data-theme]` on <html> (see "Theming & Toggle Implementation").
  #
  # `primary` is intentionally identical in both themes — the brand mark must
  # read the same against black and white. Surfaces, hairlines, ink, and the
  # semantic spectrum are theme-specific; semantic values are deepened for light
  # mode so they clear WCAG AA on a near-white canvas (the dark values were tuned
  # for near-black and several would fail unchanged).
  # ──────────────────────────────────────────────────────────────────────────

  # --- Brand / interaction accent (the ONE chromatic interaction color) ---
  primary:        { dark: "#5e6ad2", light: "#5e6ad2" }
  primary-hover:  { dark: "#828fff", light: "#4c56b8" }
  primary-focus:  { dark: "#5e69d1", light: "#5e69d1" }
  on-primary:     { dark: "#ffffff", light: "#ffffff" }
  brand-secure:   { dark: "#7a7fad", light: "#5f6491" }

  # --- Surface ladder (canvas → 4 lifts) — inverts in light mode ---
  canvas:    { dark: "#010102", light: "#fafbfc" }
  surface-1: { dark: "#0f1011", light: "#f4f5f7" }
  surface-2: { dark: "#141516", light: "#eef0f3" }
  surface-3: { dark: "#18191a", light: "#e8eaee" }
  surface-4: { dark: "#191a1b", light: "#e3e5ea" }

  # --- Hairlines (three weights) ---
  hairline:          { dark: "#23252a", light: "#e2e4e8" }
  hairline-strong:   { dark: "#34343a", light: "#d1d4da" }
  hairline-tertiary: { dark: "#3e3e44", light: "#c2c6ce" }

  # --- Text ramp ---
  ink:          { dark: "#f7f8f8", light: "#14151a" }
  ink-muted:    { dark: "#d0d6e0", light: "#3d4048" }
  ink-subtle:   { dark: "#8a8f98", light: "#6b6f78" }
  ink-tertiary: { dark: "#62666d", light: "#8a8e97" }

  # --- Semantic spectrum (data states & system feedback; NEVER on chrome/buttons) ---
  semantic-success: { dark: "#3fb950", light: "#1a7f37" }
  semantic-info:    { dark: "#58a6ff", light: "#0969da" }
  semantic-warning: { dark: "#d29922", light: "#9a6700" }
  semantic-error:   { dark: "#f85149", light: "#cf222e" }
  # Overlay stays black in both themes — a modal scrim must recede the background regardless of theme.
  semantic-overlay: { dark: "#000000", light: "#000000" }

  # --- Asset-lifecycle state palette (maps onto the semantic spectrum + neutral) ---
  # status-available / -allocated / -maintenance alias semantic-success / -info / -warning
  # in BOTH themes, so they inherit the theme-correct value automatically.
  status-available:   "{colors.semantic-success}"
  status-allocated:   "{colors.semantic-info}"
  status-maintenance: "{colors.semantic-warning}"
  status-disposed:    { dark: "#8b949e", light: "#6e7781" }

  # --- Print / PDF export escape hatch (NOT the light theme — see Print / PDF Export) ---
  # Opaque, full-strength, no alpha compositing — tuned for ink on paper, not pixels.
  inverse-canvas:   "#ffffff"
  inverse-surface-1: "#f5f6f6"
  inverse-ink:      "#000000"
  inverse-hairline: "#e0e0e0"

typography:
  hero-display:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 56px
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: -1.8px
  display-lg:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 40px
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: -1.0px
  display-md:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.20
    letterSpacing: -0.6px
  card-title:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.30
    letterSpacing: -0.2px
  subhead:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.40
    letterSpacing: -0.1px
  body-lg:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: -0.05px
  body:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: -0.05px
  body-sm:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0
  caption:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.40
    letterSpacing: 0
  button:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.20
    letterSpacing: 0
  eyebrow:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.30
    letterSpacing: 0.8px
  nav-link:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.40
    letterSpacing: 0
  data-tabular:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0
    fontVariantNumeric: "tabular-nums"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  xxl: 24px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 96px

motion:
  # Duration ladder — deliberate ~1.6x progression, tighter than framework 100/200/300 defaults
  duration-instant: 80ms
  duration-fast: 140ms
  duration-base: 220ms
  duration-slow: 360ms
  duration-page: 520ms
  # Easing tokens — named cubic-beziers
  ease-standard: "cubic-bezier(0.2, 0, 0, 1)"
  ease-entrance: "cubic-bezier(0, 0, 0.2, 1)"
  ease-exit: "cubic-bezier(0.4, 0, 1, 1)"
  # Spring (physics, no bezier) — Kanban & drag only
  spring-stiffness: 320
  spring-damping: 30
  spring-mass: 1

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 8px 14px
    height: 36px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
  button-primary-pressed:
    backgroundColor: "{colors.primary-focus}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 8px 14px
    height: 36px
    border: "1px solid {colors.hairline}"
  button-tertiary:
    backgroundColor: transparent
    textColor: "{colors.ink-muted}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 8px 14px
    height: 36px
  button-danger:
    backgroundColor: "{colors.semantic-error}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 8px 14px
    height: 36px
  button-icon-row:
    backgroundColor: transparent
    textColor: "{colors.ink-subtle}"
    rounded: "{rounded.sm}"
    size: 32px
  button-icon-circular:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: 36px
    border: "1px solid {colors.hairline}"
  text-link:
    backgroundColor: transparent
    textColor: "{colors.primary}"
    typography: "{typography.body}"
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    height: 56px
    border-bottom: "1px solid {colors.hairline}"
  sidebar-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-subtle}"
    typography: "{typography.nav-link}"
    width: 240px
    border-right: "1px solid {colors.hairline}"
  sidebar-nav-item-active:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.md}"
    padding: 8px 12px
  sidebar-section-label:
    backgroundColor: transparent
    textColor: "{colors.ink-tertiary}"
    typography: "{typography.eyebrow}"
    padding: 16px 12px 4px
  sticky-filter-bar:
    backgroundColor: "rgba(15, 16, 17, 0.80)"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    height: 52px
    backdropFilter: "blur(20px) saturate(180%)"
    border-bottom: "1px solid {colors.hairline}"
  kpi-card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.card-title}"
    rounded: "{rounded.lg}"
    padding: 20px
    border: "1px solid {colors.hairline}"
  kpi-value:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.hero-display}"
    fontVariantNumeric: "tabular-nums"
  feature-card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.card-title}"
    rounded: "{rounded.lg}"
    padding: 24px
    border: "1px solid {colors.hairline}"
  data-table:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    border: "1px solid {colors.hairline}"
  data-table-header:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink-subtle}"
    typography: "{typography.eyebrow}"
    padding: 10px 16px
    border-bottom: "1px solid {colors.hairline-strong}"
  data-table-row:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    padding: 12px 16px
    border-bottom: "1px solid {colors.hairline}"
  data-table-row-hover:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
  kanban-column:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.eyebrow}"
    rounded: "{rounded.lg}"
    padding: 12px
    border: "1px solid {colors.hairline}"
    width: 320px
  kanban-card:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 12px
    border: "1px solid {colors.hairline}"
  modal-backdrop:
    backgroundColor: "rgba(0, 0, 0, 0.72)"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
  modal-panel:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.card-title}"
    rounded: "{rounded.xl}"
    padding: 24px
    border: "1px solid {colors.hairline-strong}"
    boxShadow: "0 16px 48px rgba(0, 0, 0, 0.44)"
  command-palette:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 8px
    border: "1px solid {colors.hairline-strong}"
    boxShadow: "0 24px 64px rgba(0, 0, 0, 0.56)"
  text-input:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 8px 12px
    height: 36px
    border: "1px solid {colors.hairline}"
  text-input-focused:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 8px 12px
    height: 36px
    border: "1px solid {colors.primary-focus}"
  filter-tab-default:
    backgroundColor: transparent
    textColor: "{colors.ink-subtle}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 6px 14px
  filter-tab-selected:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 6px 14px
    border: "1px solid {colors.hairline-strong}"
  status-badge-available:
    backgroundColor: "rgba(63, 185, 80, 0.14)"
    textColor: "{colors.status-available}"
    typography: "{typography.eyebrow}"
    rounded: "{rounded.pill}"
    padding: 3px 10px
  status-badge-allocated:
    backgroundColor: "rgba(88, 166, 255, 0.14)"
    textColor: "{colors.status-allocated}"
    typography: "{typography.eyebrow}"
    rounded: "{rounded.pill}"
    padding: 3px 10px
  status-badge-maintenance:
    backgroundColor: "rgba(210, 153, 34, 0.16)"
    textColor: "{colors.status-maintenance}"
    typography: "{typography.eyebrow}"
    rounded: "{rounded.pill}"
    padding: 3px 10px
  status-badge-disposed:
    backgroundColor: "rgba(139, 148, 158, 0.16)"
    textColor: "{colors.status-disposed}"
    typography: "{typography.eyebrow}"
    rounded: "{rounded.pill}"
    padding: 3px 10px
  badge-lavender:
    backgroundColor: "rgba(94, 106, 210, 0.16)"
    textColor: "{colors.primary-hover}"
    typography: "{typography.eyebrow}"
    rounded: "{rounded.pill}"
    padding: 3px 10px
  toast:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 12px 16px
    border: "1px solid {colors.hairline-strong}"
  cta-banner:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.display-md}"
    rounded: "{rounded.lg}"
    padding: 48px
    border: "1px solid {colors.hairline}"
  footer:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-subtle}"
    typography: "{typography.caption}"
    padding: 48px 32px
    border-top: "1px solid {colors.hairline}"
---

## Overview

AssetFlow is an enterprise asset & resource management system — an ERP-style working tool, not a marketing surface. The design language is therefore tuned for **density, long-session legibility, and state comprehension**, not editorial pacing or product showcase. This system is a deliberate synthesis of three analyzed design languages — Linear, Apple, and Claude — with **Linear as the structural backbone** and specific, named elements borrowed from the other two as accents.

The canvas is Linear's near-black (`{colors.canvas}` — #010102, the deepest dark surface of the three sources) carrying a four-step surface ladder (`{colors.surface-1}` → `{colors.surface-4}`) and a three-weight hairline system (`{colors.hairline}` → `{colors.hairline-tertiary}`). Depth comes from **surface lift + hairlines, never from drop shadows on chrome** — Linear's elevation philosophy, adopted wholesale because shadows are nearly invisible on a near-black canvas and add noise to a screen that already carries many overlapping layers (dropdowns over modals over panels over the page).

The chromatic system runs **two accents with a strict division of labor**, not one:

- **Lavender** (`{colors.primary}` — #5e6ad2, Linear's brand accent) is the *interaction* color. Brand mark, primary CTA, focus rings, link emphasis, active nav. It speaks **to the user about chrome**.
- **The semantic spectrum** (`{colors.semantic-success/info/warning/error}` + the asset-lifecycle palette) is the *data* color. Asset states (Available / Allocated / Maintenance / Disposed), workflow stages, severity, validation. It speaks **about the data**.

The rule is non-negotiable: lavender never colors data, and the semantic spectrum never colors chrome. A primary button is always lavender; a "Maintenance" status pill is always amber. This is the one place the merged system deliberately departs from the single-accent rule each source follows — because a tool whose entire job is color-coding asset and workflow state cannot run on one accent. (See *Colors* for the full division of labor.)

Type is a **single sans family — Inter** — at display (weight 600, Apple-tight negative letter-spacing) and body (weight 400, 16px, tabular numerals for data). Apple and Linear are both single-family systems; Claude's serif-display pairing was considered and rejected — a literary serif voice slows the scanning that defines a working dashboard, and Inter is already wired into the Tailwind config as the project's sans. JetBrains Mono (borrowed from both Claude and Linear) carries asset IDs, audit codes, and timestamps. Shape language is **rounded-rect at `{rounded.md}` (8px) for every action**, with the **pill reserved exclusively for state tokens** — rounded-rect reads "action," pill reads "state." This grammar is consistent across the entire system.

**Key Characteristics:**
- Dark-canvas operations interface on Linear's `{colors.canvas}` (#010102), with a four-step surface ladder carrying all visual hierarchy.
- Two accents, divided: **lavender = interaction chrome**; **semantic spectrum = data state**. Never crossed.
- Single sans family (Inter), Apple-tight negative tracking on display, 16px body with tabular numerals for data. JetBrains Mono for IDs and code.
- Rounded-rect (`{rounded.md}`) for every button/input/card; pill (`{rounded.pill}`) reserved for status badges and filter tabs — the shape encodes the grammar.
- Depth via surface ladder + hairlines, not shadows. The only shadows in the system live on truly floating chrome (modal, command palette).
- Data is the protagonist — tables, Kanban boards, KPI tiles, booking calendars — framed in dark panels the way Linear frames product screenshots.
- Motion is functional: spring-physics Kanban drags, staggered entrance, route view transitions, KPI count-ups. Every pattern degrades under `prefers-reduced-motion`.

## Colors

> **Synthesis basis:** Surface ladder, hairlines, text ramp, and the lavender accent are inherited from Linear. The semantic spectrum and asset-lifecycle palette adapt Claude's documented semantic colors (the only source with a semantic system) to GitHub-dark-derived values chosen for contrast on near-black. Apple contributes the *discipline* of a single interaction accent (transferred from blue to lavender) — not a hue.

### Brand / Interaction Accent
- **Lavender-Blue** (`{colors.primary}` — #5e6ad2, identical in both themes): The single interaction-chrome color. Primary CTA fill, brand mark, link emphasis, active-nav indicator. Inherited from Linear because it is cool, precise, and instrument-panel in feel — correct for an operational tool. Coral (Claude) was rejected as too warm/humanist for asset allocation; Apple's blue was rejected as too generically corporate and too close to a default link blue. The brand mark keeps the same hue in light and dark so the brand reads identically either way (Linear does the same in production).
- **Lavender Hover** (`{colors.primary-hover}` — dark #828fff / light #4c56b8): Hovered state of the primary CTA. Dark brightens (a brighter sibling that reads on near-black); light *deepens* — brightening a mid-tone lavender further would wash out against a white fill, so deepening preserves contrast the same way brightening does against black.
- **Lavender Focus** (`{colors.primary-focus}` — #5e69d1, identical in both themes): Focus-ring tint for focused inputs and buttons. Used as a 2px outline at ~50% opacity, never as a fill.
- **Brand Secure** (`{colors.brand-secure}` — dark #7a7fad / light #5f6491): A muted lavender-gray reserved for security/audit surfaces.
- **On Primary** (`{colors.on-primary}` — #ffffff, identical in both themes): Text on lavender fills.

### Surface Ladder (depth without shadow)
- **Canvas** (`{colors.canvas}` — dark #010102 / light #fafbfc): The page floor. Dark: near-pure-black with Linear's faint blue tint. Light: near-white with the same faint cool tint. The anchor surface.
- **Surface 1** (`{colors.surface-1}` — dark #0f1011 / light #f4f5f7): One lift — feature cards, KPI cards, data-table shells, Kanban columns, sidebar items.
- **Surface 2** (`{colors.surface-2}` — dark #141516 / light #eef0f3): Two lifts — Kanban cards, modal panels, hovered table rows, selected filter tabs.
- **Surface 3** (`{colors.surface-3}` — dark #18191a / light #e8eaee): Three lifts — command palette, toasts, dropdown menus.
- **Surface 4** (`{colors.surface-4}` — dark #191a1b / light #e3e5ea): Four lifts — the deepest floating chrome.

In dark, each step *lifts* (brightens) toward the viewer; in light, each step *deepens* (darkens). The light steps are tighter together than dark's because white surfaces contrast against each other more sharply than near-black ones — the values are tuned to keep the ladder legible without banding.

### Hairlines (three weights — the other half of the depth system)
- **Hairline** (`{colors.hairline}` — dark #23252a / light #e2e4e8): Default 1px border on cards, dividers, sidebar edge.
- **Hairline Strong** (`{colors.hairline-strong}` — dark #34343a / light #d1d4da): Heavier 1px on modal/command-palette borders and table headers.
- **Hairline Tertiary** (`{colors.hairline-tertiary}` — dark #3e3e44 / light #c2c6ce): For nested surfaces inside already-lifted panels.

### Text Ramp
- **Ink** (`{colors.ink}` — dark #f7f8f8 / light #14151a): Headlines, KPI values, primary data.
- **Ink Muted** (`{colors.ink-muted}` — dark #d0d6e0 / light #3d4048): Secondary copy, descriptions.
- **Ink Subtle** (`{colors.ink-subtle}` — dark #8a8f98 / light #6b6f78): Meta info, inactive nav, footer columns.
- **Ink Tertiary** (`{colors.ink-tertiary}` — dark #62666d / light #8a8e97): Disabled text, footnotes.

### Light Theme (full parity with the dark theme)

AssetFlow ships **two themes**, switchable at runtime via a single toggle with no page reload — the same pattern GitHub, Linear, and Vercel use. Dark is the default/root identity; light is a first-class override, not an afterthought. Both themes resolve through the **exact same token names** (`{colors.canvas}`, `{colors.surface-1}`, `{colors.ink}`, `{colors.primary}`, the semantic spectrum, …) — only the *values* differ, so every `{colors.*}` reference elsewhere in this file reads correctly in either theme. There is no parallel set of light-only component specs to maintain.

The light palette mirrors the dark palette's structure rather than being invented from scratch: the **same surface ladder** (five steps, canvas → surface-4), the **same three hairline weights**, and the **same ink ramp** (four steps) — inverted in luminance direction. Light surface steps are tighter together than dark's because white surfaces read contrast against each other more sharply than near-black ones; the values are tuned to keep the ladder legible without banding.

- **Canvas** (`{colors.canvas}` — #fafbfc light): a near-white page floor with a faint cool tint, mirroring the dark canvas's faint blue tint.
- **Surface ladder** (`{colors.surface-1}` #f4f5f7 → `{colors.surface-4}` #e3e5ea): each lift darkens the canvas slightly — the inverse of the dark ladder, where each lift brightens it. Depth still comes from surface lift + hairlines, never shadows on chrome.
- **Hairlines** (`{colors.hairline}` #e2e4e8 → `{colors.hairline-tertiary}` #c2c6ce): three weights, darker on the lighter canvas.
- **Ink ramp** (`{colors.ink}` #14151a → `{colors.ink-tertiary}` #8a8e97): four steps, inverted from the dark ramp. Headlines and primary data on the near-white canvas use the deepest ink; meta and disabled text use the lightest.

A few non-obvious rules govern the light values:

- **`{colors.primary}` is identical in both themes** (#5e6ad2). The brand mark must read the same against black and white — Linear does this in production. Only `{colors.primary-hover}` deepens (#4c56b8) instead of brightening, because brightening a mid-tone lavender further would wash out against a white fill; deepening preserves contrast the same way brightening does against black.
- **The semantic spectrum and `status-disposed` are deepened** for light mode (success #1a7f37, info #0969da, warning #9a6700, error #cf222e, disposed #6e7781), not reused verbatim. The dark values were tuned for contrast on near-black (see Known Gaps); several would fail WCAG AA unchanged against white. The deepened values are GitHub-light-derived.
- **`{colors.semantic-overlay}` stays black** (#000000) in both themes. A modal scrim's job is to recede the background regardless of theme.
- **Two heavy shadows are reduced, not reused** for light mode. The dark alphas (modal `rgba(0,0,0,0.44)`, palette `rgba(0,0,0,0.56)`) exist because shadows barely register on near-black; on white they would be oppressive. Light mode starts at ~`rgba(0,0,0,0.12)` (modal) and ~`rgba(0,0,0,0.16)` (palette), tuned by eye. See Elevation.
- **`{component.sticky-filter-bar}` gets a white-based frosted fill** (`rgba(255,255,255,0.75)`) in light mode, not the near-black `rgba(15,16,17,0.80)`. The blur + saturate stays the same.

### Print / PDF Export

- **Inverse Canvas** (`{colors.inverse-canvas}` — #ffffff), **Inverse Surface 1** (`{colors.inverse-surface-1}` — #f5f6f6), **Inverse Ink** (`{colors.inverse-ink}` — #000000), **Inverse Hairline** (`{colors.inverse-hairline}` — #e0e0e0).

These exist for **one purpose only**: printable audit reports and the rare data export that must render to paper or PDF. Print has different constraints from an on-screen light theme — **ink economy and no alpha compositing** — so these tokens are opaque, full-strength values (`#ffffff` / `#000000`, no translucency) rather than the light theme's tinted neutrals. The values are close to the light theme's, but the two systems are deliberately separate: do not conflate them, and do not use the print tokens as a substitute for the light theme on screen.

### Semantic Spectrum (data states & system feedback)
- **Success** (`{colors.semantic-success}` — dark #3fb950 / light #1a7f37): "Available" assets, completed operations, positive KPI deltas, success toasts.
- **Info** (`{colors.semantic-info}` — dark #58a6ff / light #0969da): "Allocated" assets, informational alerts, active-but-neutral status.
- **Warning** (`{colors.semantic-warning}` — dark #d29922 / light #9a6700): "Maintenance" assets, pending approvals, attention flags.
- **Error** (`{colors.semantic-error}` — dark #f85149 / light #cf222e): Validation errors, rejected requests, destructive-action buttons.
- **Overlay** (`{colors.semantic-overlay}` — #000000, both themes): Modal scrim. Stays black regardless of theme — a scrim's job is to recede the background, which a translucent black does equally well on either canvas.

The dark values are GitHub-dark-derived, chosen specifically for contrast and distinguishability on `{colors.canvas}`; the light values are GitHub-light-derived and *deepened* (not reused verbatim) because the dark values were tuned for near-black and several would fail WCAG AA against white. The spectrum must remain legible when several states appear on screen simultaneously (a Kanban board, an asset table) in **both** themes.

### Asset-Lifecycle State Palette
The four asset states map onto the semantic spectrum plus one neutral:
- **Available** (`{colors.status-available}` = `{colors.semantic-success}`): ready for allocation.
- **Allocated** (`{colors.status-allocated}` = `{colors.semantic-info}`): in active use.
- **Maintenance** (`{colors.status-maintenance}` = `{colors.semantic-warning}`): under service.
- **Disposed** (`{colors.status-disposed}` — dark #8b949e / light #6e7781): terminal/inactive. **Deliberately neutral slate, not red** — disposal is "done," not "danger." This is a considered call: reflexively red would cry wolf on a routine lifecycle event.

### Discipline
- **Lavender never colors data.** No lavender status pill, no lavender KPI delta.
- **The semantic spectrum never colors chrome.** No green primary button, no amber nav item.
- The two systems meet only in `{component.toast}` and `{component.badge-lavender}`, where a *brand* badge is distinct from a *status* badge precisely because lavender ≠ spectrum.

## Typography

### Font Family
A **single sans family — Inter** — carries both display and body. The fallback stack is `Inter, system-ui, -apple-system, sans-serif` (already the configured Tailwind sans stack for this project). **JetBrains Mono** handles asset IDs, audit codes, timestamps, and any code/terminal fragments, with fallback `ui-monospace, SF Mono, Menlo, monospace`.

This is an **Apple/Linear-lineage single-family system**. Claude's serif-display + sans-body pairing was considered and deliberately rejected: a slab-serif display (Copernicus/Tiempos) gives a literary, "considered" voice that is an asset to a marketing surface and a liability to an operational one. AssetFlow users scan tables, KPIs, and status pills — they do not read editorial copy. Inter's neutral, high-x-height, tabular-numeral-friendly character is the correct voice for an instrument.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.hero-display}` | 56px | 600 | 1.08 | -1.8px | Login/empty-state heroes; the rare large statement |
| `{typography.display-lg}` | 40px | 600 | 1.12 | -1.0px | Page titles (`<h1>`) atop dashboard views |
| `{typography.display-md}` | 28px | 600 | 1.20 | -0.6px | Section titles, CTA banner headings |
| `{typography.subhead}` | 20px | 400 | 1.40 | -0.1px | Lead paragraphs, modal intros |
| `{typography.card-title}` | 18px | 600 | 1.30 | -0.2px | KPI labels, card headings, modal titles |
| `{typography.body-lg}` | 18px | 400 | 1.50 | -0.05px | Occasional lead body |
| `{typography.body}` | 16px | 400 | 1.50 | -0.05px | Default running text |
| `{typography.body-sm}` | 14px | 400 | 1.50 | 0 | Table cells, dense UI body |
| `{typography.caption}` | 12px | 400 | 1.40 | 0 | Meta, timestamps, table footnotes |
| `{typography.button}` | 14px | 500 | 1.20 | 0 | All button labels |
| `{typography.eyebrow}` | 12px | 600 | 1.30 | 0.8px | Section eyebrows, table headers, status-badge labels (positive tracking marks taxonomy) |
| `{typography.nav-link}` | 14px | 500 | 1.40 | 0 | Sidebar + top-nav items |
| `{typography.data-tabular}` | 16px | 400 | 1.50 | 0 | Numeric table cells — `font-variant-numeric: tabular-nums` |
| `{typography.mono}` | 13px | 400 | 1.50 | 0 | Asset IDs, audit codes, code blocks — JetBrains Mono |

### Principles
- **Apple-tight negative tracking on display.** Every headline ≥ 18px carries negative letter-spacing scaling from `-0.2px` (card-title) to `-1.8px` (hero). This produces the confident, "tight" display cadence Apple pioneered and Linear adopts. Body at 16px keeps a whisper of tighten (`-0.05px`) to preserve Inter's rhythm; 14px and below run at 0 tracking.
- **Body at 16px, not Apple's 17px.** Apple's 17px body is a marketing reading-pace choice; a dense dashboard needs the extra pixel of density. Both Claude and Linear land at 16px — this is the operational consensus.
- **Weight 600 for display and card titles; 400 for body; 500 for buttons, nav, eyebrows.** Weight 700 is absent. Mid-weight emphasis uses 600, never 700 — Linear resists heavy display weights and so does this system.
- **Tabular numerals wherever data appears.** `{typography.data-tabular}` enables `font-variant-numeric: tabular-nums` on every numeric table cell, KPI value, and price/delta. Non-tabular figures dance in a column; tabular figures align. In a data tool this is not optional.
- **Eyebrow uses positive tracking (+0.8px) and uppercase.** The contrast against the negative-tracked display marks the eyebrow as taxonomy — the same trick Linear uses. Used for section labels, table column headers, and status-badge text.
- **Mono is functional, never decorative.** JetBrains Mono appears only on IDs, codes, and timestamps — the things that *are* code-like. It never appears in body copy or headlines.

### Note on Font Substitutes
Inter is the configured default (`frontend/tailwind.config.js` already sets `fontFamily.sans: ['Inter', ...]`) and is the documented open-source approximation of both SF Pro (Apple) and Linear's custom sans. No substitution is required for this project. If Inter is unavailable, `system-ui` resolves to the platform sans. JetBrains Mono and Geist Mono are interchangeable for the mono slot.

## Layout

### Spacing System
- **Base unit:** 4px — inherited from Linear and Claude (Apple's 17px-biased ladder was tuned for marketing rhythm and is wrong here).
- **Tokens:** `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px · `{spacing.section}` 96px.
- **Section padding:** `{spacing.section}` (96px) between top-level dashboard sections — but interior view padding is tighter (`{spacing.xl}` 32px) because a working screen shows more per viewport than a marketing page.
- **Card padding:** `{spacing.lg}` (24px) for feature/KPI/data-table cards; 20px for the compact KPI tile.
- **Button padding:** 8px vertical × 14px horizontal — Linear's compact spec, sized for dense toolbars.
- **Input padding:** 8px × 12px.

### Grid & Container
- **App shell:** Fixed `{component.sidebar-nav}` (240px) + flexible content area; `{component.top-nav}` (56px) sticky above.
- **Content max width:** ~1280px for the content column on wide screens; tables and Kanban boards may use the full content width.
- **KPI grid:** 4-up at ≥1280px → 2-up at tablet → 1-up at mobile.
- **Data tables:** fluid width within the content column; columns sized by content, with the primary identifier column pinned left.
- **Kanban board:** horizontal scroll of 320px columns; the board never wraps to vertical stacks at any breakpoint (Kanban is inherently horizontal; wrapping breaks the workflow metaphor).
- **Feature/insight cards:** 3-up at desktop → 2-up at tablet → 1-up at mobile.

### Whitespace Philosophy
The dark canvas **is** the whitespace — Linear's principle, adopted directly. Sections separate by lifting content onto `{colors.surface-1}` panels, not by adding gaps of background color. Inside a panel, `{spacing.lg}` (24px) between blocks; `{spacing.xl}` (32px) between a section header and its content. Whitespace is deliberately tighter than Apple's 80px-tile pacing because an operations user wants to see many things at once — generosity here would read as emptiness.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 (flat) | No shadow, no border | Body type, hero text, footer |
| 1 (surface-1 lift) | `{colors.surface-1}` background on canvas + 1px `{colors.hairline}` | Default cards, KPI tiles, table shells, Kanban columns |
| 2 (surface-2 lift) | `{colors.surface-2}` background + 1px `{colors.hairline-strong}` | Kanban cards, modal panels, hovered rows, selected tabs |
| 3 (surface-3 lift) | `{colors.surface-3}` background + 1px `{colors.hairline-strong}` | Command palette, toasts, dropdown menus |
| 4 (focus ring) | 2px `{colors.primary-focus}` outline at 50% opacity | Focused input, focused button |
| 5 (floating chrome) | surface lift + the rare drop shadow | `{component.modal-panel}`, `{component.command-palette}` — the only shadows in the system |

### Elevation Philosophy — Surface Ladder + Hairlines, Shadows Rejected on Chrome
This is a clean adoption of **Linear's elevation philosophy**, not an average. The reasoning:

- Apple permits **exactly one** shadow system-wide (product photography). AssetFlow has no hero product photography, so Apple's one-shadow allowance is irrelevant and dropped.
- Claude is flat with one rare subtle hover shadow. Its *rarity discipline* is adopted as a guardrail, but the shadow itself is not — Claude's `rgba(20,20,19,0.08)` hover shadow is calibrated for a cream canvas and disappears on near-black.
- Linear rejects shadows entirely in favor of a surface ladder + hairline system. This is correct for a dark canvas: drop shadows on near-black are nearly invisible and add visual noise. The four-step surface ladder + three-weight hairline system carries hierarchy more reliably, and scales cleanly to the many overlapping layers a dashboard requires.

The one deliberate exception — where Claude's rarity discipline wins out over Linear's total rejection — is **truly floating chrome**: `{component.modal-panel}` and `{component.command-palette}` carry a real, heavy shadow (`0 16px 48px rgba(0,0,0,0.44)` and `0 24px 64px rgba(0,0,0,0.56)` respectively). These elements must read as *floating above* the page, and on a dark canvas only a deep, high-alpha shadow achieves that detachment. This is the only shadow in the system, it lives only on floating chrome, and it never touches a card, button, or input. The rule: **surface lift for cards; shadow only for things that float.**

In **light mode** those two shadow alphas are *reduced, not reused* — the dark alphas exist specifically because shadows barely register on near-black, which is not true on white, where they would read as oppressive. Light mode starts at ~`rgba(0,0,0,0.12)` (modal) and ~`rgba(0,0,0,0.16)` (palette), tuned by eye. `{component.modal-backdrop}` and `{colors.semantic-overlay}` stay black-based in both themes — a scrim must recede the background regardless of canvas color.

### Theming & Toggle Implementation

AssetFlow is dual-theme: **dark is the default/root identity, light is a runtime override.** The two are switchable from a single toggle button in `{component.top-nav}` (next to the notification bell) with no page reload — the same pattern GitHub, Linear, and Vercel use. The mechanism, documented so future contributors don't have to reverse-engineer it from source:

- **One CSS custom property per token.** Every entry under `colors:` (both the theme-bearing ones and the constant ones like `primary`) is emitted as a `--color-<token>` custom property. `:root, [data-theme="dark"]` carry the dark values; `[data-theme="light"]` overrides only the ones that change. `data-theme` lives on `<html>`.
- **Tailwind points at the variables, not static hex.** `canvas: 'var(--color-canvas)'`, `surface-1: 'var(--color-surface-1)'`, … so every `bg-surface-1` / `text-ink` / `border-hairline` className resolves to whichever theme is active. **No `dark:` variant prefix is used anywhere** — that would mean duplicating every className instead of letting the variables do the work.
- **No flash-of-wrong-theme.** A small inline `<script>` at the very top of `<head>` synchronously reads `localStorage` / `matchMedia` and sets `data-theme` on `<html>` before first paint.
- **`ThemeProvider`** (React Context) exposes `{ theme, toggleTheme, setTheme }`. Resolution order: `localStorage.getItem('assetflow-theme')` → `window.matchMedia('(prefers-color-scheme: dark)')` → fall back to `'dark'`. `toggleTheme()` flips the value, persists it, and writes `data-theme` to `<html>`.
- **The toggle button** follows `{component.button-icon-circular}` (36px, surface-2 fill, hairline border, rounded-full), cross-fading `Sun`/`Moon` over `{motion.duration-fast}` with `{motion.ease-standard}`, gated by `prefers-reduced-motion`.
- **What does NOT theme-swap:** the modal backdrop scrim and overlay stay black in both themes; the two heavy shadows and `{component.sticky-filter-bar}`'s frosted fill get light-specific values (white-based `rgba(255,255,255,0.75)` for the filter bar) rather than reusing the dark near-black.

### Decorative Depth
- **Backdrop-blur on `{component.sticky-filter-bar}`** — `blur(20px) saturate(180%)` at 80% surface alpha (dark: near-black `rgba(15,16,17,0.80)`; light: white-based `rgba(255,255,255,0.75)`). Borrowed from Apple's frosted sub-nav. Functional (keeps context visible behind a sticky filter/sort bar), not decorative.
- **Subtle top-edge highlight on lifted panels** — Linear's faint lighter edge that gives dark surfaces a "pixel-rendered" feel. Optional in implementation.
- **Data is the protagonist** — the equivalent of Linear's product screenshots. Dense, real tables and Kanban boards do the visual work; the chrome stays out of the way.

## Motion & 3D Animation

> Original section — none of the three source files cover motion. This is held to the same rigor as the rest of the file: named patterns with concrete token values, a library recommendation grounded in this repo's actual stack, and a hard accessibility clause.

### Tokens
The `motion:` block in the frontmatter defines a deliberate duration ladder and named easings. The durations follow a ~1.6× progression — **deliberately tighter than the framework-default 100/200/300/400ms ladder**. AssetFlow is a tool professionals use all day; no one wants to wait 300ms for a dropdown. The four tiers:

- `{motion.duration-instant}` 80ms — state changes that should read as immediate (focus-ring appearance, toggle flip). Below the 100ms perception threshold.
- `{motion.duration-fast}` 140ms — button press, filter-pill state change, toast in.
- `{motion.duration-base}` 220ms — default for most UI: staggered-entrance per-item, modal rise.
- `{motion.duration-slow}` 360ms — large section reveals, route view-transition crossfade.
- `{motion.duration-page}` 520ms — the rare full-page view transition.

Easings (named cubic-beziers, not framework defaults):
- `{motion.ease-standard}` `cubic-bezier(0.2, 0, 0, 1)` — the workhorse; sharp in, long deceleration.
- `{motion.ease-entrance}` `cubic-bezier(0, 0, 0.2, 1)` — accelerating-in for things appearing.
- `{motion.ease-exit}` `cubic-bezier(0.4, 0, 1, 1)` — decelerating-out for things leaving.
- `{motion.spring-*}` (stiffness 320 / damping 30 / mass 1) — physics, not a bezier; reserved for drag.

### Named Patterns

**`staggered-entrance`** — Dashboard cards, table rows, and KPI tiles fade-and-rise in on mount, each item delayed by 40ms after the previous. Per-item: `opacity 0 → 1`, `translateY 8px → 0`, duration `{motion.duration-base}` (220ms), easing `{motion.ease-entrance}`. Cap the stagger at ~6 items; beyond that, render instantly to avoid making a 200-row table feel sluggish. For long lists, use the `scroll-linked-depth-reveal` variant instead: items below the fold reveal as they enter the viewport via `IntersectionObserver`, same per-item properties. *Motion: `motion/react` `staggerChildren`.*

**`view-transition-route`** — Route-to-route navigation uses the View Transitions API (React Router v7 supports it natively via `viewTransition` on `NavLink`/routes). Outgoing view: `opacity 1 → 0` + `translateY 0 → -6px` over `{motion.duration-slow}` (360ms), `{motion.ease-exit}`. Incoming view: `opacity 0 → 1` + `translateY 6px → 0` over `{motion.duration-slow}`, `{motion.ease-entrance}`. The sidebar and top-nav persist across the transition (they are named non-participating elements). *No library beyond React Router's built-in support.*

**`kanban-card-move`** — Dragging a maintenance-request card between Kanban columns uses spring physics, not a duration. On release, the card settles into its target column with `{motion.spring-stiffness}` 320 / `{motion.spring-damping}` 30 / `{motion.spring-mass}` 1 — a responsive but controlled settle that conveys physical weight without bounce. Other cards in the target column shift position over `{motion.duration-fast}` (140ms), `{motion.ease-standard}`, to make room. This is the most expressive pattern in the system and it is justified: the Kanban is a *core product surface* (the 6-step maintenance workflow named in the README), and the drag is a *primary user action*, not decoration. *Motion: `motion/react` `drag` + `layout` + `Reorder`.*

**`state-pill-shift`** — When an asset's lifecycle state changes (Available → Allocated → Maintenance → Disposed), its `{component.status-badge-*}` cross-fades between the old and new color rather than snapping. Implementation animates `opacity` of an overlaying new-state pill over the old one across `{motion.duration-fast}` (140ms), `{motion.ease-standard}` — **never** the raw `background-color` (paint-heavy; see Accessibility). The pill's text content swaps at the midpoint of the fade. *Motion: `motion/react` `AnimatePresence` with `mode="wait"`-style crossfade.*

**`modal-layer-rise`** — Modals and the command palette rise through the surface ladder: backdrop fades `opacity 0 → 1` over `{motion.duration-base}` (220ms); panel scales `0.96 → 1` and rises `translateY 12px → 0` over `{motion.duration-base}`, `{motion.ease-entrance}`. Exit reverses with `{motion.ease-exit}`. The panel's heavy shadow (see Elevation) tightens as it settles, reinforcing "floating chrome descending onto the page." *Motion: `motion/react` `AnimatePresence`.*

**`count-up-kpi`** — KPI values animate from their previous to current number on data refresh, not on mount. Duration scales with the magnitude of change: fixed `{motion.duration-slow}` (360ms) for the tween, easing `{motion.ease-standard}`, with tabular numerals (`{typography.data-tabular}`) so the digits don't jitter as they count. On first page load the count runs from 0; on subsequent refreshes it runs from the previous value. *Motion: `motion/react` `useMotionValue` + `animate` + `useTransform`, or `motion/react`'s `useSpring` for a softer settle.*

**Rejected patterns.** For the record, the obvious "showcase" motion patterns were considered and rejected as wrong for an operational tool: `hover-tilt-3d` (perspective + rotateX/Y on hover) and `magnetic-cursor-follow` are marketing-playful and would distract in a dense data view; `parallax-layer-shift` presupposes long-scroll hero pages a dashboard doesn't have; a full `card-flip-3d` for asset detail is gimmicky when a modal does the same job more legibly. The system's motion is functional — confirming state changes, aiding spatial understanding, and providing measured polish — never decorative.

### Library Recommendation
Based on `frontend/package.json` (React 19, Vite, Tailwind, React Router v7, lucide-react; **no animation library currently installed**):

- **Motion** — install as `motion`, import from `motion/react`. The primary library for every pattern above except the route transition. Chosen because it is the React-native animation library (formerly Framer Motion, now rebranded and re-published as `motion`), it supports the spring physics and `layout`/`Reorder` primitives the Kanban needs, and it composes cleanly with React 19 and Vite. This is the only animation dependency AssetFlow should add by default.
- **GSAP + ScrollTrigger** — reach for this only if scroll-linked sequences in long dashboard panels (audit logs, activity feeds) grow complex enough to outgrow Motion's `whileInView`. Default to Motion; promote to GSAP when a single coordinated timeline drives many elements. Not a default install.
- **React Three Fiber + drei** — **explicitly not recommended.** AssetFlow has no true WebGL/3D scene requirement. Adding R3F would be unjustified bundle weight for a tool whose "3D" needs are fully met by CSS transforms. If a genuine 3D asset visualization ever becomes a requirement (e.g., a 3D equipment model), revisit; until then, do not add it.

> Note: a live web check of current versions timed out during synthesis; these are the well-established current picks (Motion as the `motion/react` package, GSAP for scroll, R3F for WebGL) and the task named them as the default choices. Confirm the latest version numbers at install time.

### Accessibility — `prefers-reduced-motion` & Performance
**Every pattern must degrade cleanly under `prefers-reduced-motion: reduce`.** Specifically:

- `staggered-entrance` and `scroll-linked-depth-reveal` → render at final state instantly (no fade, no rise).
- `view-transition-route` → either skip the transition (instant swap) or reduce to a plain opacity crossfade at `{motion.duration-instant}`.
- `kanban-card-move` → drag still works; the spring is replaced with a snap to position (duration `{motion.duration-instant}`). The interaction's *functionality* is never gated behind motion.
- `state-pill-shift` → swap to final color and text instantly.
- `modal-layer-rise` → panel appears at final position and scale instantly; backdrop may keep a `{motion.duration-fast}` opacity fade (barely perceptible, aids comprehension) or appear instantly.
- `count-up-kpi` → display the final value immediately.

Implementation pattern: a single `useReducedMotion()` hook (Motion provides this) gates every animation, returning the static end-state values when the user preference is set. Never override `prefers-reduced-motion` for delight.

**GPU-cheap properties — animate freely:** `transform` (`translate`, `scale`, `rotate`), `opacity`. These are compositor-only and never trigger layout or paint.

**Expensive properties — never animate:** `box-shadow`, `width`, `height`, `top`, `left`, `margin`, `padding`, `filter`, and raw `background-color`. These trigger layout or heavy paint on every frame and will jank a dense dashboard. When a color must change (the `state-pill-shift` pattern), animate via a cross-fading overlay using `opacity`, or via `background-color` only when the change is discrete (hover), never across a tween. Width/height changes (an expanding panel) should be implemented as `transform: scaleX/Y` on a wrapper, not as animated `width`.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 4px | Small chips, dense inline tags |
| `{rounded.sm}` | 6px | Inline row-action icon buttons (`{component.button-icon-row}`) |
| `{rounded.md}` | 8px | **Every button, every input, Kanban cards, sidebar items** — the action radius |
| `{rounded.lg}` | 12px | Cards (feature, KPI, data-table, Kanban column), CTA banner |
| `{rounded.xl}` | 16px | Modal panels, command palette |
| `{rounded.xxl}` | 24px | Oversized CTA banners (rare) |
| `{rounded.pill}` | 9999px | **Status badges and filter tabs only — the state radius** |
| `{rounded.full}` | 9999px / 50% | Avatar circles, circular icon buttons |

### Shape Grammar
The merged system resolves the button-shape conflict decisively: **rounded-rect (`{rounded.md}`, 8px) for every action; pill (`{rounded.pill}`) reserved exclusively for state.** This is the Claude/Linear lineage; Apple's full-pill primary CTA is rejected.

The reasoning is density. Apple's pill works because a marketing page shows one or two CTAs at a time and they are the loudest element on screen. A dashboard puts dozens of actions on screen simultaneously — every table row has actions, every Kanban card has controls, every toolbar is dense. A pill on each would be visual noise and would waste horizontal padding on every side. The 8px rounded-rect is compact, consistent, and scales to dense toolbars without strain.

The pill is retained, but **only where its shape carries semantic meaning**: a status badge is a *state token* (it labels the state of a thing), and a filter tab is a *state toggle* (it labels the active filter). In both cases the pill says "this is a label of state, not an action you perform." This keeps the grammar unambiguous: **rounded-rect = "do"; pill = "is."** Never mix them — a pill button or a rounded-rect status badge both break the system.

### Data Visualization Geometry
- KPI sparklines and charts (Recharts) render directly on `{colors.surface-1}` card backgrounds; chart grid lines use `{colors.hairline}`, axis labels use `{typography.caption}` in `{colors.ink-subtle}`, and data series use the semantic spectrum or lavender — never decorative colors.
- Booking-calendar heatmaps encode density on a single-hue ramp of `{colors.primary}` (lavender at low → `{colors.primary-hover}` at high) so intensity reads without introducing a second hue.
- Avatars crop to `{rounded.full}` at 32–40px.

## Components

### Navigation

**`top-nav`** — Sticky 56px bar. `{colors.canvas}` background, 1px `{colors.hairline}` bottom border. Left: AssetFlow wordmark in `{colors.ink}` (with a small lavender mark glyph). Center-left: breadcrumb of current view (`Dashboard / Assets / AST-00482`) in `{typography.nav-link}`. Right: global search trigger, notifications bell, and the signed-in user's avatar. The bar is dense and quiet — Linear's pattern.

**`sidebar-nav`** — Fixed 240px left rail. `{colors.canvas}` background, 1px `{colors.hairline}` right border. Organized by role-relevant sections (`{component.sidebar-section-label}` in `{typography.eyebrow}` uppercase — Dashboard, Assets, Allocations, Resources, Maintenance, Audits, Analytics, Admin). Nav items in `{typography.nav-link}` at `{colors.ink-subtle}`; active item lifts to `{component.sidebar-nav-item-active}` (`{colors.surface-1}` fill, `{colors.ink}` text, `{colors.primary}` 2px left accent bar). Collapses to an icon rail below tablet; to a hamburger drawer at mobile.

**`sticky-filter-bar`** — Below the page title on list views (Assets, Allocations, Audits). `{colors.surface-1}` at 80% alpha with `backdrop-filter: blur(20px) saturate(180%)` (Apple's frosted-bar treatment, borrowed). 52px tall, 1px `{colors.hairline}` bottom border. Holds filter `{component.filter-tab-*}` pills, a sort dropdown, and a `{component.text-input}` search. Sticks to the top of the scroll container.

### Buttons

**`button-primary`** — The signature action. Background `{colors.primary}` (lavender), text `{colors.on-primary}`, type `{typography.button}` (Inter 14px / 500), `{rounded.md}` (8px), padding 8px × 14px, height 36px. Hover → `{component.button-primary-hover}` (`{colors.primary-hover}` lighter lavender). Pressed → `{component.button-primary-pressed}` (`{colors.primary-focus}`). Focus → 2px `{colors.primary-focus}` outline at 50% opacity. **Always 8px radius, never a pill.**

**`button-secondary`** — Secondary CTA ("Cancel", "Export"). `{colors.surface-1}` fill, `{colors.ink}` text, 1px `{colors.hairline}` border, same padding/height/radius as primary. The border + surface lift is what makes it read as a button without a shadow.

**`button-tertiary`** — Quiet text action ("View details", inline row links). Transparent background, `{colors.ink-muted}` text, no border. Hover: text lifts to `{colors.ink}`.

**`button-danger`** — Destructive action ("Dispose asset", "Reject request"). `{colors.semantic-error}` fill, `{colors.on-primary}` text. The one place a semantic color appears on a button — because the button's *function* is a semantic data action (destruction/disposal), not generic chrome. Used sparingly; always paired with a confirmation modal.

**`button-icon-row`** — Compact 32px icon button for dense table-row actions (edit, view, transfer). Transparent, `{colors.ink-subtle}` icon, `{rounded.sm}`. Hover: `{colors.surface-2}` fill, `{colors.ink}` icon.

**`button-icon-circular`** — 36px circular icon button for modal close, carousel controls, help. `{colors.surface-2}` fill, 1px `{colors.hairline}` border, `{rounded.full}`. The only circular non-avatar element.

**`text-link`** — Inline body links in `{colors.primary}`. Underlined on hover/press only.

### Cards & Containers

**`kpi-card`** — The dashboard signature. `{colors.surface-1}`, 1px `{colors.hairline}`, `{rounded.lg}`, padding 20px. Carries: an `{typography.eyebrow}` label ("Total Assets"), the value in `{typography.kpi-value}` with tabular numerals (animated via `count-up-kpi` on refresh), and a delta indicator (▲/▼ in `{colors.semantic-success}` or `{colors.semantic-error}`, `{typography.caption}`). Hover is a no-op — KPI cards are not interactive; no lift, no shadow.

**`feature-card`** — Generic insight/feature tile in analytics and home views. `{colors.surface-1}`, 1px `{colors.hairline}`, `{rounded.lg}`, padding 24px. Carries an `{typography.card-title}` heading and `{typography.body-sm}` description. May host a Recharts chart.

**`data-table`** + **`data-table-header`** + **`data-table-row`** / **`data-table-row-hover`** — The primary data surface. Shell on `{colors.surface-1}` with `{rounded.lg}` and 1px `{colors.hairline}`. Header row on `{colors.surface-2}` with `{typography.eyebrow}` uppercase labels in `{colors.ink-subtle}`. Body rows at `{typography.body-sm}`, 12px × 16px padding, 1px `{colors.hairline}` row dividers. Hover lifts the row to `{colors.surface-2}` (a surface step, never a shadow). Numeric cells use `{typography.data-tabular}` for column alignment. State columns carry the relevant `{component.status-badge-*}`. Row actions appear via `{component.button-icon-row}` on hover.

**`kanban-column`** + **`kanban-card`** — The 6-step maintenance workflow board. Columns: 320px wide, `{colors.surface-1}`, `{rounded.lg}`, 12px padding, an `{typography.eyebrow}` header with stage name and count, 1px `{colors.hairline}` border. Cards: `{colors.surface-2}`, `{rounded.md}`, 12px padding, 1px `{colors.hairline}` border, carrying request title in `{typography.body-sm}` (weight 500), asset ID in `{typography.mono}`, assignee avatar, and a `{component.status-badge-*}`. Cards move via `kanban-card-move` spring physics.

**`modal-backdrop`** + **`modal-panel`** — Layered chrome for create/edit forms (allocate asset, transfer, raise audit discrepancy). Backdrop: `{colors.semantic-overlay}` at 72% alpha. Panel: `{colors.surface-2}`, `{rounded.xl}`, 24px padding, 1px `{colors.hairline-strong}` border, and the system's heavy floating shadow (`0 16px 48px rgba(0,0,0,0.44)` — one of only two shadows in the system). Enters via `modal-layer-rise`.

**`command-palette`** — Cmd/Ctrl+K quick action. `{colors.surface-3}`, `{rounded.lg}`, 8px padding, 1px `{colors.hairline-strong}` border, and the heaviest shadow in the system (`0 24px 64px rgba(0,0,0,0.56)`). Carries a `{component.text-input}` at top and a list of action rows. Enters via `modal-layer-rise`.

**`toast`** — State-change confirmation ("Asset AST-00482 allocated to Logistics"). `{colors.surface-3}`, `{rounded.md}`, 12px × 16px padding, 1px `{colors.hairline-strong}` border. Carries an icon in the relevant semantic color, a message in `{typography.body-sm}`, and an optional undo `{component.button-tertiary}`. Slides in from the bottom-right over `{motion.duration-fast}`.

### Inputs & Forms

**`text-input`** / **`text-input-focused`** — Standard field. `{colors.surface-1}` fill, `{colors.ink}` text, `{typography.body}`, `{rounded.md}`, 8px × 12px padding, 36px height, 1px `{colors.hairline}` border. Focused: border swaps to 1px `{colors.primary-focus}` plus a 3px lavender-at-15%-alpha outer ring. Error state (not tokenized separately): border becomes 1px `{colors.semantic-error}` with an inline message in `{colors.semantic-error}` `{typography.caption}`.

### State Tokens

**`status-badge-available`** / **`-allocated`** / **`-maintenance`** / **`-disposed`** — Pill-shaped state labels for asset lifecycle. Each uses its semantic color at ~14–16% alpha for the fill and the full-strength semantic color for the text, in `{typography.eyebrow}` (uppercase, positive tracking). The low-alpha fill is deliberate: it lets the color carry meaning without screaming, so a table with many badges stays calm. Transitions via `state-pill-shift` when the state changes.

**`badge-lavender`** — A *brand* badge for "NEW", "BETA", featured flags. Distinct from status badges precisely because lavender ≠ semantic spectrum. Same shape grammar (`{rounded.pill}`), same `{typography.eyebrow}`.

**`filter-tab-default`** / **`filter-tab-selected`** — Pill toggle in the sticky filter bar and on list-page tabs. Default: transparent, `{colors.ink-subtle}` text. Selected: `{colors.surface-2}` fill, `{colors.ink}` text, 1px `{colors.hairline-strong}` border — selection reads as a surface lift, not a color change.

### Footer & Banner

**`cta-banner`** — Closing CTA panel on home/analytics pages. `{colors.surface-1}`, `{rounded.lg}`, 48px padding, 1px `{colors.hairline}` border, heading in `{typography.display-md}`, with a `{component.button-primary}`.

**`footer`** — `{colors.canvas}`, 1px `{colors.hairline}` top border, `{colors.ink-subtle}` text in `{typography.caption}`, padding 48px × 32px. Dense link grid (Product / Resources / Legal) plus the wordmark. Stays on canvas — the footer is not lifted, only divided by a hairline.

## Do's and Don'ts

### Do
- Anchor every screen on `{colors.canvas}`. Both themes resolve through the same token — dark is `#010102`, light is `#fafbfc`, and the faint cool tint is intentional in each. Never reach for a literal hex in a component; reference `{colors.*}` so the runtime toggle works.
- Carry hierarchy with the **surface ladder** (`surface-1` → `surface-3`) and **hairline weights** (`hairline` → `hairline-tertiary`), not shadows. This is the depth system.
- Reserve `{colors.primary}` (lavender) for **interaction chrome only** — brand mark, primary CTA, focus rings, links, active nav.
- Reserve the **semantic spectrum** for **data state only** — asset lifecycle, workflow stage, severity, validation.
- Set display type in Inter 600 with negative letter-spacing (`-0.6 → -1.8px`); body in Inter 400 at 16px. The boundary is unbreakable.
- Use **tabular numerals** (`{typography.data-tabular}`) on every numeric table cell, KPI value, and delta. Non-tabular figures misalign in columns.
- Use `{rounded.md}` (8px) for every button and input; reserve `{rounded.pill}` for status badges and filter tabs. The shape encodes the grammar: rect = action, pill = state.
- Apply the heavy floating shadow **only** to `{component.modal-panel}` and `{component.command-palette}`. Nothing else gets a shadow.
- Use `prefers-reduced-motion` gating on every animation; the Kanban drag must remain functional (snap instead of spring) when reduced motion is set.

### Don't
- Every new component must define **both** a dark and light value for any non-token color it introduces — never ship a component that only renders correctly in one theme. In practice this means: don't introduce a non-token color at all; extend the `{colors.*}` set instead.
- `{colors.primary}` stays **identical** across both themes; only surfaces, hairlines, ink, and the semantic spectrum carry theme-specific values. Don't theme-tint the brand mark.
- Don't hardcode hex/`rgb()` values or Tailwind arbitrary-value classes (`bg-[#…]`) in components. Anything that bypasses the `{colors.*}` token system will silently ignore the theme toggle. (The inverse/print tokens are the only literal hex outside the runtime theme.)
- Don't use Tailwind's `dark:` variant prefix to theming — the CSS-variable-per-token approach means every className resolves to the active theme automatically. Duplicating each class with `dark:` would defeat that.
- Don't use lavender as a data color, or a semantic color as a chrome color. The two systems never cross.
- Don't add drop shadows to cards, buttons, inputs, or text. Shadow is reserved for floating chrome.
- Don't use Apple's full-pill CTA, Claude's serif display, or any marketing-surface convention (full-bleed tiles, 80px section padding) — this is a working tool, not a gallery.
- Don't animate `box-shadow`, `width`, `height`, `top`, `left`, `margin`, `padding`, `filter`, or raw `background-color` across a tween. Animate `transform` and `opacity`; cross-fade color changes via an overlay.
- Don't mix radii grammars — rect for actions, pill for states, nothing in between on the same element type.
- Don't use `{colors.semantic-error}` (red) for the "Disposed" asset state — disposal is terminal/neutral, not danger. Use `{colors.status-disposed}` (slate).
- Don't set body type at weight 700 — the ladder is 400 / 500 / 600. Heavy display is 600.
- Don't promote React Three Fiber into the bundle without a genuine WebGL requirement. AssetFlow's motion needs are fully met by Motion + CSS transforms.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Mobile | ≤ 640px | Sidebar → hamburger drawer; KPI grid 1-up; tables switch to card-list mode (each row becomes a stacked card); Kanban board keeps horizontal scroll (never wraps); top-nav collapses breadcrumb |
| Tablet | 641–1024px | Sidebar → icon rail (48px); KPI grid 2-up; feature cards 2-up; tables remain tabular |
| Desktop | 1025–1280px | Full sidebar (240px); KPI grid 4-up; feature cards 3-up |
| Wide | ≥ 1281px | Same as desktop; content column caps ~1280px, margins absorb extra width |

The structural breakpoints that matter: 1280px (desktop full layout), 1024px (sidebar collapses to icon rail, grids reduce), 640px (mobile shell, tables → card-list).

### Touch Targets
- `{component.button-primary}` and all button variants hold 36px tap height on desktop, growing to 44px on touch viewports.
- `{component.button-icon-row}` is 32px on desktop (precision pointer) and grows to 44px on touch.
- `{component.text-input}` is 36px on desktop, 44px on touch.
- Kanban cards remain draggable via touch; the spring physics still apply.

### Collapsing Strategy
- **Sidebar**: full 240px rail → 48px icon rail (1024px) → hamburger drawer (640px). Active state is preserved across all three.
- **Tables**: tabular layout on desktop/tablet → "card list" at mobile, where each row renders as a stacked `{component.feature-card}`-style block (label + value pairs) rather than forcing horizontal scroll.
- **Kanban board**: never wraps to vertical. Horizontal scroll of 320px columns is preserved at every breakpoint — wrapping would break the left-to-right workflow metaphor that is the whole point of a Kanban.
- **Filter bar**: filter `{component.filter-tab-*}` pills wrap to a second row; never collapse into a dropdown (the pills' visibility is the point).
- **Display type**: `{typography.hero-display}` (56px) scales to `{typography.display-md}` (28px) at mobile; `{typography.display-lg}` (40px) scales to `{typography.display-md}`.

### Data & Image Behavior
- Charts (Recharts) maintain aspect ratio; axis labels stay at `{typography.caption}` and never shrink below 10px — if a chart can't fit its labels legibly, it stacks instead.
- Avatars crop to `{rounded.full}` at every breakpoint.
- Tables in card-list mode at mobile preserve their status badges and row actions.

## Iteration Guide

1. Focus on ONE component at a time. Reference its YAML key directly (`{component.kpi-card}`, `{component.kanban-card}`).
2. Variants of an existing component (`-hover`, `-pressed`, `-focused`, `-selected`) live as separate entries in `components:`.
3. Use `{token.refs}` everywhere — never inline hex, px, or ms once a token exists.
4. Never document hover as a primary state — default + active/pressed/focused only (per the source files' convention). Hover is implementation detail.
5. Display headlines stay Inter 600 with negative tracking. Body stays Inter 400 at 16px. Mono stays JetBrains Mono. The split is unbreakable.
6. When introducing a new component, decide first **which surface lift** it lives on (`surface-1` / `surface-2` / `surface-3`) — that decision implies its border weight and whether it may carry a shadow (only floating chrome may).
7. When deciding whether a new element is lavender or semantic: if it speaks **to the user about chrome** (button, link, nav, focus) → lavender; if it speaks **about data** (state, severity, validation) → semantic spectrum. There is no third option.
8. When adding motion, reference the `motion:` tokens (`{motion.duration-base}`, `{motion.ease-entrance}`) and the named patterns. Add a new named pattern to this file rather than inlining an ad-hoc animation.
9. Every new animation must specify its `prefers-reduced-motion` fallback. No exceptions.
10. When in doubt about emphasis: lift a surface step before adding chrome (border, color, or shadow).

## Known Gaps

- The semantic spectrum values (success/info/warning/error and the four asset-state colors) are synthesized for contrast on `{colors.canvas}` rather than extracted from a shipping AssetFlow instance; confirm WCAG AA contrast against the dark surface once the components are implemented, especially the low-alpha status-badge fills against their full-strength text.
- Light-theme semantic and status-badge values were derived by contrast logic (deepened from the GitHub-dark-derived dark values), not extracted from a shipping instance — confirm WCAG AA once rendered, especially the low-alpha badge fills against their full-strength text on a white canvas.
- Form validation states beyond `{component.text-input-focused}` are described in prose (error border + inline message) but not yet tokenized as separate component entries; a real validation flow (allocation form, audit discrepancy form) should drive formalizing them.
- Recharts theming (grid line color, axis label type, series colors) is specified in principle under *Shapes → Data Visualization Geometry* but not formalized as component tokens; a chart-theme config should be derived from those rules.
- The `motion:` tokens and named patterns are original design work and have not been validated against a live Motion implementation in this repo; the spring constants (`stiffness 320 / damping 30 / mass 1`) in particular should be tuned by feel once the Kanban drag is built.
- The asset-lifecycle state → color mapping (Available=green, Allocated=blue, Maintenance=amber, Disposed=slate) is a design decision; confirm it matches the actual `status` enum in the Prisma schema before locking it in, and adjust the neutral "Disposed" choice if the product team reads disposal as destructive.
- The library versions for Motion / GSAP / R3F were not live-verified (web check timed out during synthesis); confirm current versions at install time.
