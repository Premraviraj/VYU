import React from 'react';
import './Widget.css';

interface WidgetProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  className?: string;
}

const Widget: React.FC<WidgetProps> = ({
  title,
  value,
  icon,
  trend,
  onClick,
  className = ''
}) => {
  return (
    <div className={`widget ${className}`} onClick={onClick}>
      <div className="widget-header">
        <div className="widget-icon">{icon}</div>
        <div className="widget-title">{title}</div>
      </div>
      <div className="widget-content">
        <div className="widget-value">{value}</div>
        {trend && (
          <div className={`widget-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </div>
  );
};

export default Widget; 