import React, { useState } from 'react';
import { Save, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

/**
 * AuditItemRow component.
 * Displays a single audit item line inside the audit detail checklist.
 */
export default function AuditItemRow({ item, onSave, isClosed }) {
  const [actualStatus, setActualStatus] = useState(item.actualStatus);
  const [notes, setNotes] = useState(item.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(item.id, { actualStatus, notes });
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'MISSING':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'DAMAGED':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <HelpCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
        {item.asset.assetTag}
      </td>
      <td className="px-6 py-4 text-sm text-gray-700 font-medium">
        {item.asset.name}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
        {item.expectedLocation || 'Not Assigned'}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
        <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600 ring-1 ring-inset ring-gray-500/10">
          {item.expectedStatus}
        </span>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          {getStatusIcon(actualStatus)}
          <select
            value={actualStatus}
            disabled={isClosed}
            onChange={(e) => setActualStatus(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
          >
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="MISSING">Missing</option>
            <option value="DAMAGED">Damaged</option>
          </select>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        <input
          type="text"
          value={notes}
          disabled={isClosed}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add verification notes..."
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
      </td>
      {!isClosed && (
        <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </td>
      )}
    </tr>
  );
}
