
import React from 'react';

const MapPlaceholder: React.FC = () => {
  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-lg h-full">
      <h2 className="text-xl font-semibold text-slate-100 mb-4">Ubicación del Embalse</h2>
      <div className="aspect-w-1 aspect-h-1">
        <svg width="100%" height="100%" viewBox="0 0 200 200" className="rounded-md">
          {/* Background */}
          <rect width="200" height="200" fill="#1e293b" />
          
          {/* Water body */}
          <path d="M 50 20 C 80 10, 120 40, 150 30 S 180 50, 190 80 C 200 110, 170 140, 140 150 S 100 180, 70 170 C 40 160, 20 130, 30 100 C 40 70, 20 30, 50 20 Z" fill="#0e7490" stroke="#06b6d4" strokeWidth="1" />

          {/* Landmass / Peninsula */}
          <path d="M 0 0 L 80 0 C 100 50, 60 120, 80 150 L 0 200 Z" fill="#475569" />
          <path d="M 200 0 L 120 0 C 100 50, 140 120, 120 150 L 200 200 Z" fill="#475569" />

          {/* Dam location marker */}
          <g transform="translate(100, 120)">
            <circle cx="0" cy="0" r="8" fill="rgba(239, 68, 68, 0.5)" />
            <circle cx="0" cy="0" r="4" fill="#ef4444" stroke="#f87171" strokeWidth="1.5" />
            <animateTransform 
              attributeName="transform"
              type="scale"
              values="1; 1.5; 1"
              keyTimes="0; 0.5; 1"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </g>
          <text x="105" y="145" fontFamily="sans-serif" fontSize="10" fill="#f1f5f9">Embalse</text>

        </svg>
      </div>
    </div>
  );
};

export default MapPlaceholder;
