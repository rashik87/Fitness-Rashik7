import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WeightEntry } from '../../types';

interface ProgressChartProps {
  data: WeightEntry[];
  theme: 'light' | 'dark';
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data, theme }) => {
  if (data.length < 2) {
    return null; // Don't render a chart with less than 2 data points
  }

  // Define colors based on the theme
  const gridColor = theme === 'dark' ? '#334155' : '#E2E8F0'; // slate-700 : slate-200
  const textColor = theme === 'dark' ? '#94A3B8' : '#64748B'; // slate-400 : slate-500
  const axisLineColor = theme === 'dark' ? '#475569' : '#CBD5E1'; // slate-600 : slate-300

  // Recharts needs the data to be in ascending order of the x-axis variable (date)
  const chartData = [...data]
    .map(entry => ({
      ...entry,
      // Format date for display on the chart
      formattedDate: new Date(entry.date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
      weight: entry.weight,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-card/80 border border-border rounded-md shadow-lg backdrop-blur-sm">
          <p className="label text-sm text-textMuted">{`${label}`}</p>
          <p className="intro text-md font-semibold text-secondary">{`الوزن: ${payload[0].value} كجم`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 250 }} className="mt-4">
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 10,
            left: -15, // Adjust to bring Y-axis labels closer
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            dataKey="formattedDate"
            tick={{ fill: textColor, fontSize: 12 }} 
            axisLine={{ stroke: axisLineColor }}
            tickLine={{ stroke: axisLineColor }}
          />
          <YAxis 
            domain={['dataMin - 2', 'dataMax + 2']}
            tick={{ fill: textColor, fontSize: 12 }}
            axisLine={{ stroke: axisLineColor }}
            tickLine={{ stroke: axisLineColor }}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366F1', strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Legend 
            wrapperStyle={{ fontSize: '14px', bottom: -10 }} 
          />
          <Line 
            type="monotone" 
            dataKey="weight" 
            stroke="#2DD4BF" // secondary color
            strokeWidth={2}
            activeDot={{ r: 8, fill: '#2DD4BF', stroke: 'rgb(var(--color-background))', strokeWidth: 2 }} 
            dot={{ r: 4, fill: '#2DD4BF' }}
            name="الوزن (كجم)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;