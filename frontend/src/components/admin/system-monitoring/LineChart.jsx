/**
 * Line Chart Component
 * 
 * Recharts line chart for displaying latency trends and time-series data.
 * 
 * REF: THEME/REFACTOR: Updated to use theme tokens instead of hardcoded colors
 * 
 * @component
 */

import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
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
 * LineChart Component
 * 
 * @param {Array} data - Chart data array
 * @param {string} dataKey - Key for data values
 * @param {string} name - Chart name
 * @param {string} color - Line color (optional, uses theme primary if not provided)
 * @param {number} height - Chart height
 */
const LineChart = ({ 
  data = [], 
  dataKey = 'value', 
  name = 'Metric',
  color = null, // REF: THEME/REFACTOR: Will use theme primary if not provided
  height = 300,
  showGrid = true,
  showLegend = false
}) => {
  // REF: THEME/REFACTOR: Get theme-aware colors
  const { theme } = useTheme();
  const lineColor = color || getThemeToken(theme, 'chartPrimary');
  
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
      <RechartsLineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
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
        <Line
          type="monotone"
          dataKey={dataKey}
          name={name}
          stroke={lineColor}
          strokeWidth={2}
          dot={{ fill: lineColor, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default LineChart;

