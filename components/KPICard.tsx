
import React from 'react';

interface KPICardProps {
  title: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  color: string;
  variation?: number;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, unit, icon, color, variation }) => {
  const variationColor = variation !== undefined 
    ? variation > 0 ? 'text-green-400' : variation < 0 ? 'text-red-400' : 'text-slate-400'
    : '';
  const variationSign = variation !== undefined && variation > 0 ? '+' : '';

  return (
    <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 shadow-lg flex items-center space-x-4">
      <div className={`p-3 rounded-full bg-slate-700 ${color}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-slate-100 flex items-baseline">
          <span className={variation !== undefined ? variationColor : ''}>
            {variation !== undefined ? variationSign : ''}{value}
          </span>
          <span className="text-sm font-medium text-slate-400 ml-1">{unit}</span>
        </p>
      </div>
    </div>
  );
};

export default KPICard;
