/**
 * System Card Component
 * 
 * Reusable glass card for displaying system metrics.
 * 
 * @component
 */

import React from 'react';

const SystemCard = ({ title, value, status, icon, subtitle, children }) => {
  const getStatusColor = () => {
    if (status === 'critical') return 'text-error border-error/30';
    if (status === 'warning') return 'text-warning border-warning/30';
    return 'text-success border-success/30';
  };

  return (
    <div className={`glass-card rounded-2xl p-6 border-2 ${getStatusColor()}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{icon}</span>
            <h3 className="text-lg font-semibold text-theme-primary">{title}</h3>
          </div>
          {subtitle && (
            <p className="text-xs text-theme-secondary">{subtitle}</p>
          )}
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          status === 'critical' ? 'bg-error/20 text-error' :
          status === 'warning' ? 'bg-warning/20 text-warning' :
          'bg-success/20 text-success'
        }`}>
          {status?.toUpperCase() || 'HEALTHY'}
        </div>
      </div>
      <div className="text-3xl font-bold text-theme-primary mb-2">
        {value}
      </div>
      {children}
    </div>
  );
};

export default SystemCard;

