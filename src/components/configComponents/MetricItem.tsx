import React from 'react';

interface MetricItemProps {
  icon: string;
  label: string;
  value: number;
}

const MetricItem: React.FC<MetricItemProps> = ({ icon, label, value }) => {
  return (
    <div className="metric-item">
      <span className="metric-icon">{icon}</span>
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
    </div>
  );
};

export default MetricItem; 