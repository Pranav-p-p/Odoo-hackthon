import React, { useEffect, useRef } from 'react';

/**
 * KpiCard — DESIGN.md dark-canvas version
 *
 * - surface-1 background, hairline border, rounded-lg (12px)
 * - Eyebrow label (type-eyebrow)
 * - Value in hero-display size with tabular numerals (type-tabular)
 * - count-up-kpi animation on value change (via motion/react useAnimate)
 * - No hover lift / no shadow — KPI cards are non-interactive per DESIGN.md
 *
 * @param {Object} props
 * @param {string} props.title      — Eyebrow label (e.g. "Total Assets")
 * @param {number} props.value      — Numeric KPI value
 * @param {React.ReactNode} [props.icon]   — Lucide icon (16px, ink-subtle color)
 * @param {string} [props.delta]    — Optional delta string (e.g. "+12%")
 * @param {'up'|'down'|null} [props.deltaDir] — Delta direction for color
 */
export default function KpiCard({ title, value, icon, delta, deltaDir }) {
  const numRef = useRef(null);
  const prevRef = useRef(0);

  /* count-up-kpi — animate from previous to current value on change */
  useEffect(() => {
    const target = Number(value) || 0;
    const from   = prevRef.current;
    prevRef.current = target;

    if (from === target) return;

    /* Skip animation if prefers-reduced-motion */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (numRef.current) numRef.current.textContent = target.toLocaleString();
      return;
    }

    const DURATION = 360; /* motion.duration-slow */
    const startTime = performance.now();

    function tick(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      /* ease-standard: cubic-bezier(0.2, 0, 0, 1) approximated */
      const t = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (target - from) * t);
      if (numRef.current) numRef.current.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [value]);

  const deltaColor = deltaDir === 'up'
    ? '#3fb950'   /* semantic-success */
    : deltaDir === 'down'
    ? '#f85149'   /* semantic-error */
    : '#8a8f98';  /* ink-subtle */

  return (
    <div className="kpi-card" aria-label={`${title}: ${value}`}>
      {/* ── Header row: label + icon ─────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="type-eyebrow" style={{ color: '#8a8f98' }}>{title}</span>
        {icon && (
          <span style={{ color: '#8a8f98', display: 'flex', alignItems: 'center' }}>
            {icon}
          </span>
        )}
      </div>

      {/* ── KPI value — tabular numerals ─────────────────────────────────── */}
      <p
        ref={numRef}
        className="type-tabular"
        style={{
          fontSize:    40,
          fontWeight:  600,
          lineHeight:  1.12,
          letterSpacing: '-1.0px',
          color:       '#f7f8f8',
          margin:      0,
        }}
      >
        {Number(value).toLocaleString()}
      </p>

      {/* ── Optional delta ───────────────────────────────────────────────── */}
      {delta && (
        <p className="type-caption" style={{ color: deltaColor, marginTop: 6 }}>
          {delta}
        </p>
      )}
    </div>
  );
}
