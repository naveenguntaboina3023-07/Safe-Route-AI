import React from 'react';
import { Clock, Navigation, AlertTriangle, Shield, Lightbulb, Star, ChevronRight } from 'lucide-react';
import ScoreBadge from './ScoreBadge.jsx';
import { getScoreBg } from '../utils/helpers.js';

export default function RouteCard({ route, recommended, onSelect, selected }) {
  const bgBorder = getScoreBg(route.safetyScore);

  return (
    <div
      className={`card p-4 cursor-pointer transition-all hover:shadow-md
        ${selected ? 'ring-2 ring-primary-500' : ''}
        ${recommended ? `border-2 ${bgBorder.includes('green') ? 'border-green-300' : 'border-amber-300'}` : ''}
      `}
      onClick={() => onSelect?.(route)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-sm">{route.name}</h3>
            {recommended && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                <Star size={10} fill="currentColor" /> Recommended
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">*Estimate based on available data</p>
        </div>
        <ScoreBadge score={route.safetyScore} size="sm" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Navigation size={13} className="text-primary-500 flex-shrink-0" />
          {route.distance}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Clock size={13} className="text-primary-500 flex-shrink-0" />
          {route.estimatedTime}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" />
          {route.reportCount ?? route.approvedReports?.length ?? 0} report(s)
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Shield size={13} className="text-blue-500 flex-shrink-0" />
          {route.securityPointCount} security pt(s)
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600 col-span-2">
          <Lightbulb size={13} className="text-yellow-500 flex-shrink-0" />
          Lighting: <span className="font-medium ml-0.5">{route.lightingQuality}</span>
        </div>
      </div>

      {/* Risk level */}
      <div className={`rounded-lg px-3 py-2 mb-3 ${
        route.safetyScore >= 80 ? 'bg-green-50 border border-green-200' :
        route.safetyScore >= 50 ? 'bg-amber-50 border border-amber-200' :
                                   'bg-red-50 border border-red-200'
      }`}>
        <p className={`text-xs font-semibold ${
          route.safetyScore >= 80 ? 'text-green-800' :
          route.safetyScore >= 50 ? 'text-amber-800' : 'text-red-800'
        }`}>
          {route.riskLevel}
        </p>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onSelect?.(route); }}
        className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
      >
        View details <ChevronRight size={13} />
      </button>
    </div>
  );
}
