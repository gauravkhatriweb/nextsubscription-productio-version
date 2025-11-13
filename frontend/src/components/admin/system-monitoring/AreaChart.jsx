/**
 * Area Chart Component
 * 
 * Recharts area chart for displaying CPU and memory usage trends.
 * 
 * REF: THEME/REFACTOR: Updated to use theme tokens instead of hardcoded colors
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
import { useTheme } from '../../../theme/ThemeProvider';
import { getThemeToken } from '../../../constants/themeTokens';

/**
 * AreaChart Component
 * 
 * @param {Array} data - Chart data array
 * @param {Array} dataKeys - Array of data keys to display (with optional color override)
 * @param {number} height - Chart height
 */
const AreaChart = ({ 
  data = [], 
  dataKeys = [{ key: 'value', name: 'Metric' }], // REF: THEME/REFACTOR: Color will use theme if not provided
  height = 300,
  showGrid = true,
  showLegend = true
}) => {
  // REF: THEME/REFACTOR: Get theme-aware colors
  const { theme } = useTheme();
  const defaultColor = getThemeToken(theme, 'chartPrimary');
  
  // REF: THEME/REFACTOR: Apply theme colors to dataKeys if not provided
  const themedDataKeys = dataKeys.map(item => ({
    ...item,
    color: item.color || defaultColor
  }));
  
  // REF: THEME/REFACTOR: Theme-aware tooltip and axis colors
  const tooltipBg = theme === 'dark' ? '#1F2937' : '#FFFFFF';
  const tooltipBorder = theme === 'dark' ? '#374151' : '#E5E7EB';
  const tooltipText = theme === 'dark' ? '#F9FAFB' : '#111827';
  const axisColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';
  const gridColor = theme === 'dark' ? '#374151' : '#E5E7EB';
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
          {themedDataKeys.map((item, index) => (
            <linearGradient key={index} id={`color${item.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={item.color} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={item.color} stopOpacity={0.1}/>
            </linearGradient>
          ))}
        </defs>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.3} />}
        <XAxis 
          dataKey="time" 
          stroke={axisColor}
          fontSize={12}
          tick={{ fill: axisColor }}
        />
        <YAxis 
          stroke={axisColor}
          fontSize={12}
          tick={{ fill: axisColor }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: tooltipBg,
            border: `1px solid ${tooltipBorder}`,
            borderRadius: '8px',
            color: tooltipText
          }}
          labelStyle={{ color: axisColor }}
        />
        {showLegend && <Legend />}
        {themedDataKeys.map((item, index) => (
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

