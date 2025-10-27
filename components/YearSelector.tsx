
import React from 'react';

interface YearSelectorProps {
  years: number[];
  selected: number;
  onSelect: (year: number) => void;
}

const YearSelector: React.FC<YearSelectorProps> = ({ years, selected, onSelect }) => {
  return (
    <div className="max-h-60 overflow-y-auto bg-slate-900/50 p-2 rounded-md border border-slate-700">
      <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {years.map(year => (
          <button
            key={year}
            onClick={() => onSelect(year)}
            className={`
              px-2 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200
              ${selected === year 
                ? 'bg-cyan-500 text-white shadow-lg' 
                : 'bg-slate-700 text-slate-300 hover:bg-cyan-600 hover:text-white'}
            `}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );
};

export default YearSelector;
