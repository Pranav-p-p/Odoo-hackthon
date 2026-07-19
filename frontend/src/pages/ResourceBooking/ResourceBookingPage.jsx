// ============================================================================
// ResourceBookingPage.jsx — Member 3: Screen 6 — Resource Booking
// WORKFLOW.md: Section 6 — Resource Booking Workflow
// API Contract: Module 3 / Bookings
// Features:
//   - Bookable asset selector
//   - Date picker
//   - Calendar/timeline view (08:00–20:00) showing existing bookings
//   - Booking form (startTime, endTime, purpose)
//   - ConflictBanner on 409 overlap response
//   - Cancel booking action
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, X, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import {
  getBookableAssets,
  getBookings,
  createBooking,
  cancelBooking,
} from '../../api/bookingApi.js';
import ConfirmModal from '../../components/Modal/ConfirmModal';
import { useToast } from '../../components/Toast/ToastProvider';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function toLocalDateString(date) {
  // Returns YYYY-MM-DD in local time for <input type="date">
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function toLocalTimeString(date) {
  // Returns HH:MM in local time for <input type="time">
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Convert HH:MM to minutes from midnight */
function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** Convert a Date to minutes from midnight */
function dateToMinutes(date) {
  const d = new Date(date);
  return d.getHours() * 60 + d.getMinutes();
}

const STATUS_COLORS = {
  UPCOMING:  { bg: '#1f6feb', text: '#ffffff' },
  ONGOING:   { bg: '#238636', text: '#ffffff' },
  COMPLETED: { bg: 'var(--color-hairline-strong)', text: 'var(--color-status-disposed)' },
  CANCELLED: { bg: '#6e040f', text: '#ffa198' },
};

const STATUS_LABELS = {
  UPCOMING:  'Upcoming',
  ONGOING:   'Ongoing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

// Calendar goes from 08:00 to 20:00 — 12 hours = 720 minutes
const CALENDAR_START = 8 * 60;  // 08:00
const CALENDAR_END   = 20 * 60; // 20:00
const CALENDAR_RANGE = CALENDAR_END - CALENDAR_START;

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Timeline column showing existing bookings as positioned blocks */
function CalendarTimeline({ bookings }) {
  const hourSlots = Array.from({ length: 12 }, (_, i) => i + 8);
  return (
    <div style={{ position: 'relative', border: '1px solid var(--color-hairline)', borderRadius: 8, overflow: 'hidden', backgroundColor: 'var(--color-surface-1)' }}>
      <div style={{ display: 'flex' }}>
        {/* Time labels */}
        <div style={{ width: 52, flexShrink: 0, borderRight: '1px solid var(--color-hairline)' }}>
          {hourSlots.map(hour => (
            <div key={hour} style={{ height: 48, display: 'flex', alignItems: 'flex-start', padding: '4px 6px' }}>
              <span style={{ fontSize: 10, color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-mono)' }}>
                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </span>
            </div>
          ))}
        </div>
        {/* Booking area */}
        <div style={{ flex: 1, position: 'relative', height: `${hourSlots.length * 48}px` }}>
          {hourSlots.map((_, i) => (
            <div key={i} style={{ position: 'absolute', width: '100%', borderTop: '1px solid var(--color-hairline-strong)', top: `${i * 48}px` }} />
          ))}
          {bookings.filter(b => b.status !== 'CANCELLED').map(b => {
            const startMins = Math.max(dateToMinutes(b.startTime), CALENDAR_START);
            const endMins   = Math.min(dateToMinutes(b.endTime),   CALENDAR_END);
            if (endMins <= startMins) return null;
            const topPct    = ((startMins - CALENDAR_START) / CALENDAR_RANGE) * 100;
            const heightPct = ((endMins   - startMins)      / CALENDAR_RANGE) * 100;
            const c = STATUS_COLORS[b.status] ?? STATUS_COLORS.UPCOMING;
            return (
              <div
                key={b.id}
                style={{ position: 'absolute', left: 4, right: 4, borderRadius: 4, padding: '2px 6px', fontSize: 11, overflow: 'hidden', backgroundColor: c.bg, color: c.text, top: `${topPct}%`, height: `${heightPct}%`, minHeight: 20, opacity: 0.92 }}
                title={`${b.user?.name ?? 'Unknown'} — ${formatTime(b.startTime)}–${formatTime(b.endTime)}${b.purpose ? ` — ${b.purpose}` : ''}`}
              >
                <span style={{ fontWeight: 600 }}>{b.user?.name ?? 'Booked'}</span>
                <span style={{ marginLeft: 4, opacity: 0.75 }}>{formatTime(b.startTime)}–{formatTime(b.endTime)}</span>
              </div>
            );
          })}
        </div>
      </div>
      {bookings.filter(b => b.status !== 'CANCELLED').length === 0 && (
        <p style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--color-ink-tertiary)', pointerEvents: 'none' }}>
          No bookings on this day
        </p>
      )}
    </div>
  );
}

/** 409 Conflict banner */
function ConflictBanner({ conflict, requestedStart, requestedEnd, onDismiss }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', backgroundColor: 'var(--color-semantic-error-bg)', border: '1px solid var(--color-semantic-error)', borderRadius: 8 }}>
      <AlertTriangle size={16} style={{ color: 'var(--color-semantic-error)', flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1, fontSize: 13 }}>
        <p style={{ fontWeight: 600, color: 'var(--color-semantic-error)', margin: 0 }}>Time slot unavailable</p>
        <p style={{ color: '#ffa198', marginTop: 4 }}>
          Requested {formatTime(requestedStart)} – {formatTime(requestedEnd)} conflicts with an existing booking:
        </p>
        <p style={{ color: '#ffa198', marginTop: 4 }}>
          <strong>{conflict.bookedBy}</strong> — {formatTime(conflict.startTime)} – {formatTime(conflict.endTime)}
        </p>
      </div>
      <button onClick={onDismiss} style={{ color: 'var(--color-semantic-error)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }} aria-label="Dismiss conflict">
        <X size={15} />
      </button>
    </div>
  );
}

/** Individual booking card in the list below the calendar */
function BookingCard({ booking, onCancel }) {
  const canCancel = booking.status === 'UPCOMING' || booking.status === 'ONGOING';
  const c = STATUS_COLORS[booking.status] ?? STATUS_COLORS.UPCOMING;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-hairline)', borderRadius: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: c.bg, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink-muted)', margin: 0 }}>
            {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
          </p>
          {booking.purpose && (
            <p style={{ fontSize: 11, color: 'var(--color-ink-subtle)', marginTop: 2 }}>{booking.purpose}</p>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, backgroundColor: c.bg, color: c.text }}>
          {STATUS_LABELS[booking.status]}
        </span>
        {canCancel && (
          <button onClick={() => onCancel(booking.id)} className="btn-icon-row" aria-label="Cancel booking">
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

function CalendarSkeleton() {
  const hourSlots = Array.from({ length: 12 }, (_, i) => i + 8);
  return (
    <div style={{ position: 'relative', border: '1px solid var(--color-hairline)', borderRadius: 8, overflow: 'hidden', backgroundColor: 'var(--color-surface-1)' }}>
      <div style={{ display: 'flex' }}>
        <div style={{ width: 52, flexShrink: 0, borderRight: '1px solid var(--color-hairline)' }}>
          {hourSlots.map(h => (
            <div key={h} style={{ height: 48, display: 'flex', alignItems: 'flex-start', padding: '4px 6px' }}>
              <div style={{ height: 10, width: 28, borderRadius: 4, backgroundColor: 'var(--color-hairline)' }} />
            </div>
          ))}
        </div>
        <div style={{ flex: 1, position: 'relative', height: `${hourSlots.length * 48}px` }}>
          {hourSlots.map((_, i) => <div key={i} style={{ position: 'absolute', width: '100%', borderTop: '1px solid var(--color-hairline-strong)', top: `${i * 48}px` }} />)}
          <div style={{ position: 'absolute', left: 4, right: 4, top: '10%', height: '15%', borderRadius: 4, backgroundColor: 'var(--color-hairline)', animation: 'pulse 2s infinite' }} />
          <div style={{ position: 'absolute', left: '33%', top: '40%', height: '20%', width: '25%', borderRadius: 4, backgroundColor: 'var(--color-hairline)', animation: 'pulse 2s infinite' }} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ResourceBookingPage() {
  const [assets, setAssets]             = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedDate, setSelectedDate] = useState(toLocalDateString(new Date()));
  const [bookings, setBookings]         = useState([]);
  const [loading, setLoading]           = useState(false);
  const [fetchingBookings, setFetchingBookings] = useState(false);
  const [assetLoadError, setAssetLoadError]     = useState('');
  const [calendarError, setCalendarError]       = useState('');

  // Booking form state
  const [startTime, setStartTime]       = useState('09:00');
  const [endTime, setEndTime]           = useState('10:00');
  const [purpose, setPurpose]           = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [success, setSuccess]           = useState('');
  const [error, setError]               = useState('');
  const { success: toastSuccess, error: toastError } = useToast();
  const [pendingCancelId, setPendingCancelId] = useState(null);

  // Conflict state (from 409 response)
  const [conflict, setConflict]         = useState(null);
  const [conflictRequested, setConflictRequested] = useState({ start: null, end: null });

  // ── Load bookable assets on mount ─────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setAssetLoadError('');
    getBookableAssets()
      .then((data) => {
        setAssets(data);
        if (data.length > 0) setSelectedAsset(data[0]);
      })
      .catch((err) => setAssetLoadError(err.response?.data?.error?.message ?? 'Failed to load resources. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  // ── Fetch bookings when asset or date changes ─────────────────────────────
  const fetchBookings = useCallback(async () => {
    if (!selectedAsset) return;
    setFetchingBookings(true);
    setCalendarError('');
    try {
      const res = await getBookings({ assetId: selectedAsset.id, date: selectedDate });
      setBookings(res.data ?? []);
    } catch (err) {
      setCalendarError(err.response?.data?.error?.message ?? 'Failed to load calendar data.');
    } finally {
      setFetchingBookings(false);
    }
  }, [selectedAsset, selectedDate]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // ── Handle form submit ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAsset) return;

    setSubmitting(true);
    setConflict(null);
    setError('');
    setSuccess('');

    // Build ISO8601 datetimes from date + time inputs
    const startISO = new Date(`${selectedDate}T${startTime}:00`).toISOString();
    const endISO   = new Date(`${selectedDate}T${endTime}:00`).toISOString();

    try {
      await createBooking({
        assetId:   selectedAsset.id,
        startTime: startISO,
        endTime:   endISO,
        purpose,
      });
      setSuccess('Booking confirmed!');
      setPurpose('');
      await fetchBookings(); // refresh calendar
    } catch (err) {
      if (err.response?.status === 409) {
        // Overlap conflict — show ConflictBanner
        setConflict(err.response.data?.error?.details?.conflictingBooking ?? {});
        setConflictRequested({ start: startISO, end: endISO });
      } else {
        setError(err.response?.data?.error?.message ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Handle cancel booking ─────────────────────────────────────────────────
  const handleCancel = async (bookingId) => {
    try {
      await cancelBooking(bookingId);
      await fetchBookings();
      toastSuccess('Booking cancelled');
    } catch (err) {
      const msg = err.response?.data?.error?.message ?? 'Failed to cancel booking.';
      setError(msg);
      toastError(msg);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Calendar size={18} color='var(--color-primary)' />
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>Resource Booking</h1>
            <p style={{ fontSize: 13, color: 'var(--color-ink-subtle)', marginTop: 6 }}>Book shared resources like conference rooms and projectors.</p>
          </div>
        </div>
        <button onClick={fetchBookings} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 12px', borderRadius: 6, border: '1px solid var(--color-hairline-strong)', backgroundColor: 'var(--color-surface-1)', color: 'var(--color-ink-muted)', cursor: 'pointer' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {assetLoadError ? (
        <div style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-semantic-error)', borderRadius: 12, padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <AlertTriangle size={40} color='var(--color-semantic-error)' style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>Failed to load resources</h2>
          <p style={{ fontSize: 13, color: 'var(--color-ink-subtle)', marginTop: 6, marginBottom: 16 }}>{assetLoadError}</p>
          <button onClick={() => window.location.reload()} style={{ padding: '8px 16px', backgroundColor: '#da3633', color: '#ffffff', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Reload Page</button>
        </div>
      ) : (
        <>
          {/* ── Selectors ─────────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--color-ink-subtle)', marginBottom: 6 }}>Select Resource</label>
              {loading ? (
                <div style={{ height: 36, backgroundColor: 'var(--color-hairline)', borderRadius: 8, animation: 'pulse 2s infinite' }} />
              ) : (
                <select
                  id="resource-selector"
                  value={selectedAsset?.id ?? ''}
                  onChange={(e) => {
                    const asset = assets.find(a => a.id === e.target.value);
                    setSelectedAsset(asset ?? null);
                    setConflict(null); setError(''); setSuccess('');
                  }}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-hairline-strong)', backgroundColor: 'var(--color-surface-1)', color: 'var(--color-ink-muted)', outline: 'none' }}
                >
                  {assets.length === 0 && <option value="">No bookable resources found</option>}
                  {assets.map(a => <option key={a.id} value={a.id}>{a.assetTag} — {a.name}</option>)}
                </select>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--color-ink-subtle)', marginBottom: 6 }}>Select Date</label>
              <input
                id="booking-date"
                type="date"
                value={selectedDate}
                min={toLocalDateString(new Date())}
                onChange={(e) => { setSelectedDate(e.target.value); setConflict(null); setError(''); setSuccess(''); }}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-hairline-strong)', backgroundColor: 'var(--color-surface-1)', color: 'var(--color-ink-muted)', outline: 'none' }}
              />
            </div>
          </div>

          {/* ── Calendar + Form ──────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, alignItems: 'start' }}>

            {/* Calendar timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink-muted)', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                  <Clock size={13} />
                  {selectedAsset ? `${selectedAsset.name} — ${selectedDate}` : 'Select a resource'}
                </h2>
                {fetchingBookings && !calendarError && (
                  <span style={{ fontSize: 11, color: 'var(--color-primary)', animation: 'pulse 2s infinite' }}>Loading…</span>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                {fetchingBookings && !calendarError ? <CalendarSkeleton /> : <CalendarTimeline bookings={bookings} />}
                {calendarError && (
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15,16,17,0.85)', backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 16, zIndex: 10, borderRadius: 8, border: '1px solid var(--color-semantic-error)' }}>
                    <AlertTriangle size={28} color='var(--color-semantic-error)' style={{ marginBottom: 8 }} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-semantic-error)', margin: 0 }}>Calendar Error</p>
                    <p style={{ fontSize: 12, color: '#ffa198', marginTop: 4, marginBottom: 12 }}>{calendarError}</p>
                    <button onClick={fetchBookings} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 6, border: '1px solid var(--color-hairline-strong)', backgroundColor: 'var(--color-surface-1)', color: 'var(--color-ink-muted)', cursor: 'pointer' }}>Retry</button>
                  </div>
                )}
              </div>

              {bookings.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-subtle)', textTransform: 'uppercase' }}>Existing Bookings ({bookings.length})</p>
                  {bookings.map(b => <BookingCard key={b.id} booking={b} onCancel={(id) => setPendingCancelId(id)} />)}
                </div>
              )}
            </div>

            {/* Booking form */}
            <div style={{ backgroundColor: 'var(--color-surface-2)', padding: 16, borderRadius: 12, border: '1px solid var(--color-hairline)' }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 16px' }}>New Booking</h2>

              {conflict && (
                <ConflictBanner conflict={conflict} requestedStart={conflictRequested.start} requestedEnd={conflictRequested.end} onDismiss={() => setConflict(null)} />
              )}
              {success && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', backgroundColor: 'var(--color-status-available-bg)', border: '1px solid var(--color-status-available)', borderRadius: 8, fontSize: 13, color: 'var(--color-status-available)', marginTop: conflict ? 12 : 0, marginBottom: 12 }}>
                  <CheckCircle size={14} />{success}
                </div>
              )}
              {error && (
                <div style={{ padding: '10px 12px', backgroundColor: 'var(--color-semantic-error-bg)', border: '1px solid var(--color-semantic-error)', borderRadius: 8, fontSize: 13, color: 'var(--color-semantic-error)', marginBottom: 12 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} id="booking-form">
                <div>
                  <label htmlFor="start-time" style={{ display: 'block', fontSize: 12, color: 'var(--color-ink-subtle)', marginBottom: 6 }}>Start Time</label>
                  <input id="start-time" type="time" value={startTime} required style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-hairline-strong)', backgroundColor: 'var(--color-surface-1)', color: 'var(--color-ink-muted)', outline: 'none' }}
                    onChange={e => { setStartTime(e.target.value); setConflict(null); setSuccess(''); setError(''); }} />
                </div>
                <div>
                  <label htmlFor="end-time" style={{ display: 'block', fontSize: 12, color: 'var(--color-ink-subtle)', marginBottom: 6 }}>End Time</label>
                  <input id="end-time" type="time" value={endTime} required style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-hairline-strong)', backgroundColor: 'var(--color-surface-1)', color: 'var(--color-ink-muted)', outline: 'none' }}
                    onChange={e => { setEndTime(e.target.value); setConflict(null); setSuccess(''); setError(''); }} />
                  {startTime && endTime && (
                    <p style={{ fontSize: 11, color: 'var(--color-ink-tertiary)', marginTop: 4 }}>
                      Duration: {Math.max(0, timeToMinutes(endTime) - timeToMinutes(startTime))} min (min 15, max 8h)
                    </p>
                  )}
                </div>

                {/* Purpose */}
                <div>
                  <label htmlFor="booking-purpose" className="block text-sm font-medium text-gray-700 mb-1">
                    Purpose <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="booking-purpose"
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Team standup, Client meeting"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !selectedAsset}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg py-2 text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Booking…
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </form>
            </div>
          </div>
      </>
    )}

    <ConfirmModal
      open={pendingCancelId !== null}
      title="Cancel this booking?"
      message="The reserved slot will be released. You can book it again later if needed."
      confirmLabel="Cancel booking"
      onCancel={() => setPendingCancelId(null)}
      onConfirm={async () => {
        const id = pendingCancelId;
        setPendingCancelId(null);
        await handleCancel(id);
      }}
    />
  </div>
  );
}
