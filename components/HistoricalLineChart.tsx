
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChartDataPoint } from '../types';

interface HistoricalLineChartProps {
  data: ChartDataPoint[];
  selectedYear: number;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-700 border border-slate-600 p-3 rounded-md shadow-lg">
        <p className="font-bold text-slate-200">{label}</p>
        {payload.map((pld: any) => (
          <p key={pld.dataKey} style={{ color: pld.color }} className="text-sm">
            {`${pld.name}: ${pld.value !== null ? pld.value.toFixed(2) : 'N/A'} hm³`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const HistoricalLineChart: React.FC<HistoricalLineChartProps> = ({ data, selectedYear }) => {
  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <LineChart
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
          <YAxis tick={{ fill: '#94a3b8' }} fontSize={12} domain={['dataMin', 'auto']} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: '#cbd5e1', fontSize: '14px' }} />
          <Line type="monotone" dataKey="Mínima Histórica" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" />
          <Line type="monotone" dataKey="Máxima Histórica" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="5 5" />
          <Line type="monotone" dataKey="Media Histórica" stroke="#f59e0b" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey={selectedYear.toString()} stroke="#22d3ee" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoricalLineChart;
