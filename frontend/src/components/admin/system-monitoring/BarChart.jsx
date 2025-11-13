/**
 * Bar Chart Component
 * 
 * Recharts bar chart for displaying response rates and metrics by subsystem.
 * 
 * @component
 */

import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

/**
 * BarChart Component
 * 
 * @param {Array} data - Chart data array
 * @param {Array} dataKeys - Array of data keys to display
 * @param {Array} colors - Array of colors for each bar
 * @param {number} height - Chart height
 */
const BarChart = ({ 
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
      <RechartsBarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />}
        <XAxis 
          dataKey="name" 
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
          <Bar
            key={item.key}
            dataKey={item.key}
            name={item.name}
            fill={item.color}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;

