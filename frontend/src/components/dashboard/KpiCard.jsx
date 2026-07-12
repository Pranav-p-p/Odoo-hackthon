import React from 'react';

/**
 * KpiCard component.
 * Displays a statistic count with a title, icon, and custom color accents.
 *
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {number|string} props.value - Count value to display
 * @param {React.ReactNode} props.icon - Lucide icon component
 * @param {string} [props.colorClass] - Text color and border accent class
 * @param {string} [props.bgGradient] - Custom gradient background
 */
export default function KpiCard({ title, value, icon, colorClass = 'text-blue-600', bgGradient = 'from-blue-50 to-indigo-50' }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      {/* Background Gradient Accent */}
      <div className={`absolute top-0 right-0 h-24 w-24 bg-gradient-to-br ${bgGradient} opacity-30 rounded-bl-full`} />

      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-gray-500">{title}</span>
          <h3 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{value}</h3>
        </div>
        <div className={`rounded-xl p-3 bg-gray-50 ${colorClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
