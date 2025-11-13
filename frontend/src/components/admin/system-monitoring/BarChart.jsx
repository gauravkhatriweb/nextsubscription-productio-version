/**
 * Bar Chart Component
 * 
 * Recharts bar chart for displaying response rates and metrics by subsystem.
 * 
 * REF: THEME/REFACTOR: Updated to use theme tokens instead of hardcoded colors
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
import { useTheme } from '../../../theme/ThemeProvider';
import { getThemeToken } from '../../../constants/themeTokens';

/**
 * BarChart Component
 * 
 * @param {Array} data - Chart data array
 * @param {Array} dataKeys - Array of data keys to display (with optional color override)
 * @param {number} height - Chart height
 */
const BarChart = ({ 
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
      <RechartsBarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.3} />}
        <XAxis 
          dataKey="name" 
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

