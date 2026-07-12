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
  UPCOMING:  'bg-blue-500',
  ONGOING:   'bg-green-500',
  COMPLETED: 'bg-gray-400',
  CANCELLED: 'bg-red-300',
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
function CalendarTimeline({ bookings, selectedDate }) {
  const hourSlots = Array.from({ length: 12 }, (_, i) => i + 8); // 8 → 19

  return (
    <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Hour grid */}
      <div className="flex">
        {/* Time labels */}
        <div className="w-16 flex-shrink-0 border-r border-gray-100">
          {hourSlots.map((hour) => (
            <div key={hour} className="h-12 flex items-start px-2 pt-1">
              <span className="text-xs text-gray-400">
                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </span>
            </div>
          ))}
        </div>

        {/* Booking area */}
        <div className="flex-1 relative" style={{ height: `${hourSlots.length * 3}rem` }}>
          {/* Hour lines */}
          {hourSlots.map((_, i) => (
            <div
              key={i}
              className="absolute w-full border-t border-gray-100"
              style={{ top: `${i * 3}rem` }}
            />
          ))}

          {/* Booking blocks */}
          {bookings
            .filter((b) => b.status !== 'CANCELLED')
            .map((b) => {
              const startMins = Math.max(dateToMinutes(b.startTime), CALENDAR_START);
              const endMins   = Math.min(dateToMinutes(b.endTime),   CALENDAR_END);
              if (endMins <= startMins) return null;

              const topPct    = ((startMins - CALENDAR_START) / CALENDAR_RANGE) * 100;
              const heightPct = ((endMins - startMins)        / CALENDAR_RANGE) * 100;
              const colorClass = STATUS_COLORS[b.status] ?? 'bg-blue-400';

              return (
                <div
                  key={b.id}
                  className={`absolute left-1 right-1 rounded px-1 py-0.5 text-white text-xs overflow-hidden ${colorClass} opacity-90 shadow-sm`}
                  style={{
                    top:    `${topPct}%`,
                    height: `${heightPct}%`,
                    minHeight: '1.25rem',
                  }}
                  title={`${b.user?.name ?? 'Unknown'} — ${formatTime(b.startTime)}–${formatTime(b.endTime)}${b.purpose ? ` — ${b.purpose}` : ''}`}
                >
                  <span className="font-medium">{b.user?.name ?? 'Booked'}</span>
                  <span className="ml-1 opacity-80">{formatTime(b.startTime)}–{formatTime(b.endTime)}</span>
                </div>
              );
            })}
        </div>
      </div>

      {bookings.filter((b) => b.status !== 'CANCELLED').length === 0 && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-gray-400 pointer-events-none">
          No bookings on this day
        </p>
      )}
    </div>
  );
}

/** 409 Conflict banner */
function ConflictBanner({ conflict, requestedStart, requestedEnd, onDismiss }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
      <AlertTriangle className="text-red-500 mt-0.5 flex-shrink-0" size={18} />
      <div className="flex-1 text-sm">
        <p className="font-semibold text-red-800">Time slot unavailable</p>
        <p className="text-red-700 mt-0.5">
          Requested {formatTime(requestedStart)} – {formatTime(requestedEnd)} conflicts with an existing booking:
        </p>
        <p className="text-red-600 mt-1">
          <strong>{conflict.bookedBy}</strong> — {formatTime(conflict.startTime)} – {formatTime(conflict.endTime)}
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="text-red-400 hover:text-red-600 flex-shrink-0"
        aria-label="Dismiss conflict"
      >
        <X size={16} />
      </button>
    </div>
  );
}

/** Individual booking card in the list below the calendar */
function BookingCard({ booking, onCancel }) {
  const canCancel = booking.status === 'UPCOMING' || booking.status === 'ONGOING';

  return (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className={`inline-block w-2.5 h-2.5 rounded-full ${STATUS_COLORS[booking.status] ?? 'bg-gray-400'}`}
        />
        <div>
          <p className="text-sm font-medium text-gray-800">
            {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
          </p>
          {booking.purpose && (
            <p className="text-xs text-gray-500">{booking.purpose}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-0.5 rounded-full text-white ${STATUS_COLORS[booking.status] ?? 'bg-gray-400'}`}>
          {STATUS_LABELS[booking.status]}
        </span>
        {canCancel && (
          <button
            onClick={() => onCancel(booking.id)}
            className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 rounded px-2 py-0.5 transition-colors"
          >
            Cancel
          </button>
        )}
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

  // Booking form state
  const [startTime, setStartTime]       = useState('09:00');
  const [endTime, setEndTime]           = useState('10:00');
  const [purpose, setPurpose]           = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [success, setSuccess]           = useState('');
  const [error, setError]               = useState('');

  // Conflict state (from 409 response)
  const [conflict, setConflict]         = useState(null);
  const [conflictRequested, setConflictRequested] = useState({ start: null, end: null });

  // ── Load bookable assets on mount ─────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    getBookableAssets()
      .then((data) => {
        setAssets(data);
        if (data.length > 0) setSelectedAsset(data[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Fetch bookings when asset or date changes ─────────────────────────────
  const fetchBookings = useCallback(async () => {
    if (!selectedAsset) return;
    setFetchingBookings(true);
    try {
      const res = await getBookings({ assetId: selectedAsset.id, date: selectedDate });
      setBookings(res.data ?? []);
    } catch (err) {
      console.error('[ResourceBookingPage] fetchBookings error:', err);
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
    } catch (err) {
      setError(err.response?.data?.error?.message ?? 'Failed to cancel booking.');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    // TODO [MEMBER 1]: Replace outer div with <DashboardLayout> once it's delivered
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 space-y-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={24} className="text-blue-600" />
              Resource Booking
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Book shared resources like conference rooms and projectors.
            </p>
          </div>
          <button
            onClick={fetchBookings}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 border border-gray-200 hover:border-blue-300 rounded-lg px-3 py-1.5 transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* ── Asset + Date Selectors ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Asset selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Resource
            </label>
            {loading ? (
              <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
            ) : (
              <select
                id="resource-selector"
                value={selectedAsset?.id ?? ''}
                onChange={(e) => {
                  const asset = assets.find((a) => a.id === e.target.value);
                  setSelectedAsset(asset ?? null);
                  setConflict(null);
                  setError('');
                  setSuccess('');
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {assets.length === 0 && (
                  <option value="">No bookable resources found</option>
                )}
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.assetTag} — {a.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Date
            </label>
            <input
              id="booking-date"
              type="date"
              value={selectedDate}
              min={toLocalDateString(new Date())}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setConflict(null);
                setError('');
                setSuccess('');
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* ── Main content: Calendar + Form ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Calendar timeline — 3/5 width */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Clock size={14} />
                {selectedAsset ? `${selectedAsset.name} — ${selectedDate}` : 'Select a resource'}
              </h2>
              {fetchingBookings && (
                <span className="text-xs text-blue-500 animate-pulse">Loading…</span>
              )}
            </div>

            <CalendarTimeline bookings={bookings} selectedDate={selectedDate} />

            {/* Booking list */}
            {bookings.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Existing Bookings ({bookings.length})
                </p>
                {bookings.map((b) => (
                  <BookingCard key={b.id} booking={b} onCancel={handleCancel} />
                ))}
              </div>
            )}
          </div>

          {/* Booking form — 2/5 width */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="text-base font-semibold text-gray-900">New Booking</h2>

              {/* Conflict banner */}
              {conflict && (
                <ConflictBanner
                  conflict={conflict}
                  requestedStart={conflictRequested.start}
                  requestedEnd={conflictRequested.end}
                  onDismiss={() => setConflict(null)}
                />
              )}

              {/* Success message */}
              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                  <CheckCircle size={16} className="text-green-600" />
                  {success}
                </div>
              )}

              {/* Generic error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" id="booking-form">
                {/* Start time */}
                <div>
                  <label htmlFor="start-time" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      setConflict(null);
                      setSuccess('');
                      setError('');
                    }}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* End time */}
                <div>
                  <label htmlFor="end-time" className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(e.target.value);
                      setConflict(null);
                      setSuccess('');
                      setError('');
                    }}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {/* Duration hint */}
                  {startTime && endTime && (
                    <p className="text-xs text-gray-400 mt-1">
                      Duration: {Math.max(0, timeToMinutes(endTime) - timeToMinutes(startTime))} min
                      &nbsp;(min 15 min, max 8 h)
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
        </div>
      </div>
    </div>
  );
}
