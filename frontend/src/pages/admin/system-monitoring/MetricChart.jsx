/**
 * Metric Chart Component
 * 
 * Animated progress bar for displaying metrics like CPU, memory, disk usage.
 * 
 * @component
 */

import React from 'react';

const MetricChart = ({ value, max = 100, color = '#E43636', label }) => {
  const percentage = Math.min((parseFloat(value) || 0), max);
  const normalizedPercentage = (percentage / max) * 100;
  
  const getColor = () => {
    if (normalizedPercentage > 90) return '#E43636'; // Red for critical
    if (normalizedPercentage > 70) return '#F59E0B'; // Orange for warning
    return '#10B981'; // Green for healthy
  };

  const barColor = color === '#E43636' ? getColor() : color;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-theme-secondary">{label}</span>
          <span className="text-sm font-semibold text-theme-primary">{value}</span>
        </div>
      )}
      <div className="relative w-full h-3 bg-theme-surface rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${normalizedPercentage}%`,
            background: `linear-gradient(90deg, ${barColor} 0%, ${barColor}dd 100%)`,
            boxShadow: `0 0 10px ${barColor}40`
          }}
        />
        <div
          className="absolute top-0 left-0 h-full w-full rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${barColor}20 50%, transparent 100%)`,
            animation: 'shimmer 2s infinite'
          }}
        />
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default MetricChart;

