import React from 'react';
import { Widget } from '../../../types/Widget';
import { DashboardKPICard } from '../../../types/kpiTypes';
import { useWidgets } from '../../../context/WidgetContext';
import './UserHomePage.css';

const UserHomePage: React.FC = () => {
  const { widgets } = useWidgets();

  const renderWidget = (widget: Widget | DashboardKPICard) => {
    if ('type' in widget && widget.type === 'kpi') {
      // Render KPI widget
      const kpiWidget = widget as DashboardKPICard;
      return (
        <div 
          key={kpiWidget.id}
          className="widget-item kpi-widget"
          style={{ backgroundColor: '#ffffff' }}
        >
          <h3>{kpiWidget.kpi_name}</h3>
          <div className="widget-content">
            <div className="kpi-value">{kpiWidget.field_value}</div>
            <div className="kpi-name">{kpiWidget.field_name}</div>
            <div className="kpi-source">Source: {kpiWidget.video_source}</div>
          </div>
        </div>
      );
    } else {
      // Render regular widget
      const regularWidget = widget as Widget;
      return (
        <div 
          key={regularWidget.id}
          className="widget-item"
          style={{ backgroundColor: regularWidget.backgroundColor || '#ffffff' }}
        >
          <h3>{regularWidget.title}</h3>
          <div 
            className="widget-content"
            dangerouslySetInnerHTML={{ __html: regularWidget.content }}
          />
        </div>
      );
    }
  };

  return (
    <div className="user-home-container">
      <div className="widgets-grid">
        {widgets.map(widget => renderWidget(widget))}
      </div>
    </div>
  );
};

export default UserHomePage; 