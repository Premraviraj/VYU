import React from 'react';

interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  change: number;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, change, iconColor }) => {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className={`stat-icon ${iconColor}`}>{icon}</span>
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className={`stat-change ${change < 0 ? 'negative' : 'positive'}`}>
        {change > 0 ? '+' : ''}{change}%
      </div>
    </div>
  );
};

export default StatCard; 