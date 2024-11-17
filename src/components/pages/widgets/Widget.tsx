import React from 'react';
import './Widget.css';

interface WidgetProps {
  title: string;
  children: React.ReactNode;
  onRemove?: () => void;
}

const Widget: React.FC<WidgetProps> = ({ title, children, onRemove }) => {
  return (
    <div className="widget">
      <div className="widget-header">
        <h3>{title}</h3>
        {onRemove && (
          <button className="widget-remove-btn" onClick={onRemove}>
            ×
          </button>
        )}
      </div>
      <div className="widget-content">
        {children}
      </div>
    </div>
  );
};

export default Widget; 