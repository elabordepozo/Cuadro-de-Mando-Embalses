
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChartDataPoint } from '../types';

interface YearlyComparisonBarChartProps {
  data: ChartDataPoint[];
  selectedYear: number;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-700 border border-slate-600 p-3 rounded-md shadow-lg">
          <p className="font-bold text-slate-200">{label}</p>
          {payload.map((pld: any) => (
            <p key={pld.dataKey} style={{ color: pld.fill }} className="text-sm">
              {`${pld.name}: ${pld.value !== null ? pld.value.toFixed(2) : 'N/A'} hm³`}
            </p>
          ))}
        </div>
      );
    }
    return null;
};

const YearlyComparisonBarChart: React.FC<YearlyComparisonBarChartProps> = ({ data, selectedYear }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart 
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: -10,
              bottom: 5,
            }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="month" tick={{ fill: '#94a3b8' }} fontSize={12} />
          <YAxis tick={{ fill: '#94a3b8' }} fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: '#cbd5e1', fontSize: '14px' }} />
          <Bar dataKey="Media Histórica" fill="#f59e0b" />
          <Bar dataKey={selectedYear.toString()} fill="#22d3ee" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default YearlyComparisonBarChart;
