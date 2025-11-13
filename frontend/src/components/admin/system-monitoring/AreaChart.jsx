/**
 * Area Chart Component
 * 
 * Recharts area chart for displaying CPU and memory usage trends.
 * 
 * @component
 */

import React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

/**
 * AreaChart Component
 * 
 * @param {Array} data - Chart data array
 * @param {Array} dataKeys - Array of data keys to display
 * @param {Array} colors - Array of colors for each area
 * @param {number} height - Chart height
 */
const AreaChart = ({ 
  data = [], 
  dataKeys = [{ key: 'value', name: 'Metric', color: '#E43636' }],
  height = 300,
  showGrid = true,
  showLegend = true
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px] text-theme-secondary">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          {dataKeys.map((item, index) => (
            <linearGradient key={index} id={`color${item.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={item.color} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={item.color} stopOpacity={0.1}/>
            </linearGradient>
          ))}
        </defs>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />}
        <XAxis 
          dataKey="time" 
          stroke="#9CA3AF"
          fontSize={12}
          tick={{ fill: '#9CA3AF' }}
        />
        <YAxis 
          stroke="#9CA3AF"
          fontSize={12}
          tick={{ fill: '#9CA3AF' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#F9FAFB'
          }}
          labelStyle={{ color: '#9CA3AF' }}
        />
        {showLegend && <Legend />}
        {dataKeys.map((item, index) => (
          <Area
            key={item.key}
            type="monotone"
            dataKey={item.key}
            name={item.name}
            stroke={item.color}
            fill={`url(#color${item.key})`}
            strokeWidth={2}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChart;

