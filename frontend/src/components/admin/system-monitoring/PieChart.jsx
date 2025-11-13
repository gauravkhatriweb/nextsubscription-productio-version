/**
 * Pie Chart Component
 * 
 * Recharts pie chart for displaying external service status breakdown.
 * 
 * REF: THEME/REFACTOR: Updated to use theme tokens instead of hardcoded colors
 * 
 * @component
 */

import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useTheme } from '../../../theme/ThemeProvider';
import { getThemeToken } from '../../../constants/themeTokens';

/**
 * PieChart Component
 * 
 * @param {Array} data - Chart data array
 * @param {string} dataKey - Key for data values
 * @param {string} nameKey - Key for name/label
 * @param {number} height - Chart height
 */
const PieChart = ({ 
  data = [], 
  dataKey = 'value',
  nameKey = 'name',
  height = 300,
  colors = null // REF: THEME/REFACTOR: Will use theme tokens if not provided
}) => {
  // REF: THEME/REFACTOR: Get theme-aware colors
  const { theme } = useTheme();
  const defaultColors = colors || [
    getThemeToken(theme, 'chartSuccess'),
    getThemeToken(theme, 'chartWarning'),
    getThemeToken(theme, 'chartPrimary'),
    getThemeToken(theme, 'chartInfo'),
    '#8B5CF6' // Purple accent - add to theme tokens if needed
  ];
  const chartColors = colors || defaultColors;
  
  // REF: THEME/REFACTOR: Theme-aware tooltip and legend colors
  const tooltipBg = theme === 'dark' ? '#1F2937' : '#FFFFFF';
  const tooltipBorder = theme === 'dark' ? '#374151' : '#E5E7EB';
  const tooltipText = theme === 'dark' ? '#F9FAFB' : '#111827';
  const axisColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px] text-theme-secondary">
        No data available
      </div>
    );
  }

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill={tooltipText} 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={80}
          fill={getThemeToken(theme, 'chartPrimary')}
          dataKey={dataKey}
          nameKey={nameKey}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: tooltipBg,
            border: `1px solid ${tooltipBorder}`,
            borderRadius: '8px',
            color: tooltipText
          }}
          labelStyle={{ color: axisColor }}
        />
        <Legend 
          wrapperStyle={{ color: axisColor }}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

export default PieChart;

