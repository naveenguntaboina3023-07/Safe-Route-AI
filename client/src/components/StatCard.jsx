import React from 'react';

export default function StatCard({ icon: Icon, label, value, color = 'primary', trend }) {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-700',
    green:   'bg-green-50 text-green-700',
    amber:   'bg-amber-50 text-amber-700',
    red:     'bg-red-50 text-red-700',
    blue:    'bg-blue-50 text-blue-700',
    purple:  'bg-purple-50 text-purple-700',
  };

  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 truncate">{label}</p>
        {trend && <p className="text-xs text-gray-400 mt-0.5">{trend}</p>}
      </div>
    </div>
  );
}
