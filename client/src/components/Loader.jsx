import React from 'react';

export default function Loader({ text = 'Loading…', fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
        <Spinner size={10} />
        {text && <p className="mt-3 text-sm text-gray-500">{text}</p>}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Spinner size={8} />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
}

export function Spinner({ size = 6, color = 'text-primary-600' }) {
  return (
    <svg
      className={`animate-spin h-${size} w-${size} ${color}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function InlineLoader() {
  return <Spinner size={4} color="text-white" />;
}
