import React from 'react';
import { Activity, User, Monitor, Key, FileText, CheckCircle2 } from 'lucide-react';

/**
 * RecentActivityPanel component.
 * Renders a timeline list of recent activity logs.
 */
export default function RecentActivityPanel({ logs = [] }) {
  // Map actions to icon and color schemes
  const getActionConfig = (action) => {
    const defaultIcon = <Activity className="h-4 w-4" />;
    switch (action) {
      case 'USER_SIGNUP':
      case 'USER_LOGIN':
        return {
          icon: <User className="h-4 w-4 text-blue-600" />,
          bgColor: 'bg-blue-50',
          title: 'User Event',
        };
      case 'ASSET_REGISTERED':
      case 'ASSET_UPDATED':
        return {
          icon: <Monitor className="h-4 w-4 text-emerald-600" />,
          bgColor: 'bg-emerald-50',
          title: 'Asset Core',
        };
      case 'ALLOCATION_CREATED':
      case 'ALLOCATION_RETURNED':
        return {
          icon: <Key className="h-4 w-4 text-purple-600" />,
          bgColor: 'bg-purple-50',
          title: 'Allocation',
        };
      case 'AUDIT_CYCLE_CREATED':
      case 'AUDIT_CYCLE_CLOSED':
      case 'AUDIT_ITEM_VERIFIED':
        return {
          icon: <CheckCircle2 className="h-4 w-4 text-amber-600" />,
          bgColor: 'bg-amber-50',
          title: 'Audit System',
        };
      default:
        return {
          icon: defaultIcon,
          bgColor: 'bg-gray-100',
          title: 'System Activity',
        };
    }
  };

  const formatTimestamp = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString();
    } catch {
      return isoString;
    }
  };

  const getActionText = (log) => {
    const details = log.details || {};
    switch (log.action) {
      case 'USER_SIGNUP':
        return 'New employee registered.';
      case 'USER_LOGIN':
        return 'User logged into the system.';
      case 'ASSET_REGISTERED':
        return `Asset registered: ${details.assetTag || 'unknown'} (${details.name || 'unnamed'}).`;
      case 'ASSET_UPDATED':
        return `Asset updated: ${details.name || 'unnamed'}.`;
      case 'ALLOCATION_CREATED':
        return `Asset allocated to user: ${details.assetTag || 'unknown'}.`;
      case 'ALLOCATION_RETURNED':
        return `Asset returned: ${details.assetTag || 'unknown'}.`;
      case 'AUDIT_CYCLE_CREATED':
        return `Audit cycle initiated: "${details.name || 'Cycle'}".`;
      case 'AUDIT_CYCLE_CLOSED':
        return `Audit cycle "${details.name || 'Cycle'}" closed.`;
      case 'AUDIT_ITEM_VERIFIED':
        return `Asset ${details.assetTag || 'unknown'} verified as ${details.actualStatus || 'PENDING'}.`;
      default:
        return `${log.action.replace(/_/g, ' ')} on ${log.entityType}`;
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-gray-50">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Activity className="h-5 w-5 text-gray-500" />
          Recent System Activity
        </h2>
        <span className="text-xs text-gray-400">Real-time logs</span>
      </div>

      <div className="mt-6 flow-root">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="h-8 w-8 text-gray-300" />
            <p className="mt-2 text-sm text-gray-400">No activity recorded yet.</p>
          </div>
        ) : (
          <ul className="-mb-8">
            {logs.map((log, idx) => {
              const config = getActionConfig(log.action);
              return (
                <li key={log.id || idx}>
                  <div className="relative pb-8">
                    {idx !== logs.length - 1 && (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-100" aria-hidden="true" />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.bgColor} ring-8 ring-white`}>
                          {config.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-800">
                          <span className="font-semibold text-gray-900 mr-2">{config.title}</span>
                          {getActionText(log)}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatTimestamp(log.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
