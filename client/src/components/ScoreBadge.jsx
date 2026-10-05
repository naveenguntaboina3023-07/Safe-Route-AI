import React from 'react';
import { getScoreColor, getRiskLabel } from '../utils/helpers.js';

export default function ScoreBadge({ score, showLabel = true, size = 'md' }) {
  const color = getScoreColor(score);
  const label = getRiskLabel(score);

  const sizeMap = {
    sm: { ring: 40, text: '14px', sub: '9px' },
    md: { ring: 56, text: '18px', sub: '10px' },
    lg: { ring: 72, text: '22px', sub: '11px' },
  };
  const { ring, text, sub } = sizeMap[size] || sizeMap.md;
  const radius = (ring - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={ring} height={ring} viewBox={`0 0 ${ring} ${ring}`}>
        <circle cx={ring / 2} cy={ring / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle
          cx={ring / 2} cy={ring / 2} r={radius}
          fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${ring / 2} ${ring / 2})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
          fontSize={text} fontWeight="700" fill={color}>
          {score}
        </text>
      </svg>
      {showLabel && (
        <span style={{ color, fontSize: sub }} className="font-medium text-center leading-tight">
          {label}
        </span>
      )}
    </div>
  );
}
