import React from 'react';
import { Activity, User, Monitor, Key, FileText, CheckCircle2 } from 'lucide-react';

/**
 * RecentActivityPanel — DESIGN.md dark canvas version
 *
 * Data-table–style activity feed on surface-1 card.
 * Timeline connector uses hairline color.
 * Timestamps in mono font (type-mono).
 * Icon backgrounds use semantic spectrum at ~14% alpha.
 */

/* Action → { icon, dotColor, title } */
function getActionConfig(action) {
  switch (action) {
    case 'USER_SIGNUP':
    case 'USER_LOGIN':
      return { icon: User,        dotColor: 'var(--color-status-allocated)', title: 'User Event' };
    case 'ASSET_REGISTERED':
    case 'ASSET_UPDATED':
      return { icon: Monitor,     dotColor: 'var(--color-status-available)', title: 'Asset Core' };
    case 'ALLOCATION_CREATED':
    case 'ALLOCATION_RETURNED':
      return { icon: Key,         dotColor: 'var(--color-primary)', title: 'Allocation' };
    case 'AUDIT_CYCLE_CREATED':
    case 'AUDIT_CYCLE_CLOSED':
    case 'AUDIT_ITEM_VERIFIED':
      return { icon: CheckCircle2, dotColor: 'var(--color-status-maintenance)', title: 'Audit System' };
    default:
      return { icon: FileText,    dotColor: 'var(--color-ink-subtle)', title: 'System Activity' };
  }
}

function formatTimestamp(iso) {
  try {
    const d = new Date(iso);
    return (
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      + ' · '
      + d.toLocaleDateString([], { month: 'short', day: 'numeric' })
    );
  } catch {
    return iso;
  }
}

function getActionText(log) {
  const d = log.details || {};
  switch (log.action) {
    case 'USER_SIGNUP':           return 'New employee registered.';
    case 'USER_LOGIN':            return 'User logged into the system.';
    case 'ASSET_REGISTERED':      return `Asset registered: ${d.assetTag || 'unknown'} (${d.name || 'unnamed'}).`;
    case 'ASSET_UPDATED':         return `Asset updated: ${d.name || 'unnamed'}.`;
    case 'ALLOCATION_CREATED':    return `Asset allocated to user: ${d.assetTag || 'unknown'}.`;
    case 'ALLOCATION_RETURNED':   return `Asset returned: ${d.assetTag || 'unknown'}.`;
    case 'AUDIT_CYCLE_CREATED':   return `Audit cycle initiated: "${d.name || 'Cycle'}".`;
    case 'AUDIT_CYCLE_CLOSED':    return `Audit cycle "${d.name || 'Cycle'}" closed.`;
    case 'AUDIT_ITEM_VERIFIED':   return `Asset ${d.assetTag || 'unknown'} verified as ${d.actualStatus || 'PENDING'}.`;
    default:                      return `${log.action.replace(/_/g, ' ')} on ${log.entityType}`;
  }
}

export default function RecentActivityPanel({ logs = [] }) {
  return (
    <div className="feature-card">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{
        display:       'flex',
        alignItems:    'center',
        justifyContent:'space-between',
        paddingBottom: 16,
        borderBottom:  '1px solid #23252a',
        marginBottom:  20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={16} color='var(--color-ink-subtle)' />
          <h2 className="type-card-title" style={{ margin: 0, color: 'var(--color-ink)' }}>
            Recent Activity
          </h2>
        </div>
        <span className="type-caption" style={{ color: 'var(--color-ink-tertiary)' }}>Real-time logs</span>
      </div>

      {/* ── Log list ─────────────────────────────────────────────────────── */}
      {logs.length === 0 ? (
        <div style={{
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          padding:        '32px 0',
          gap:            10,
          color:          'var(--color-ink-tertiary)',
        }}>
          <Activity size={28} color='var(--color-hairline-tertiary)' />
          <p className="type-body-sm" style={{ color: 'var(--color-ink-tertiary)', margin: 0 }}>
            No activity recorded yet.
          </p>
        </div>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {logs.map((log, idx) => {
            const { icon: Icon, dotColor, title } = getActionConfig(log.action);
            const isLast = idx === logs.length - 1;

            return (
              <li key={log.id || idx} style={{ position: 'relative', paddingBottom: isLast ? 0 : 20 }}>
                {/* ── Vertical connector line ──────────────────────────── */}
                {!isLast && (
                  <span
                    aria-hidden="true"
                    style={{
                      position:   'absolute',
                      top:        28,
                      left:       14,
                      bottom:     0,
                      width:      1,
                      backgroundColor: 'var(--color-hairline)', /* hairline */
                    }}
                  />
                )}

                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  {/* ── Icon dot ──────────────────────────────────────── */}
                  <div style={{
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    width:           28,
                    height:          28,
                    borderRadius:    8,
                    backgroundColor: `${dotColor}22`, /* ~13% alpha */
                    flexShrink:      0,
                    position:        'relative',
                    zIndex:          1,
                  }}>
                    <Icon size={14} color={dotColor} />
                  </div>

                  {/* ── Content ───────────────────────────────────────── */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: 'var(--color-ink)', margin: 0 }}>
                      <span style={{ fontWeight: 600, marginRight: 6 }}>{title}</span>
                      {getActionText(log)}
                    </p>
                    <p className="type-mono" style={{ color: 'var(--color-ink-tertiary)', marginTop: 3 }}>
                      {formatTimestamp(log.createdAt)}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
