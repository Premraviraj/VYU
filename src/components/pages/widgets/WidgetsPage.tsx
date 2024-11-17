import React, { useState, useEffect } from 'react';
import Widget from './Widget';
import CreateWidgetModal from './CreateWidgetModal';
import './WidgetsPage.css';

type WidgetType = 'bus' | 'car' | 'bike' | 'truck';

interface WidgetData {
  id: number;
  title: string;
  type: WidgetType;
  isCustom?: boolean;
  chartType?: string;
  graphData?: {
    config: any;
    data: any[];
  };
}

const defaultWidgets: WidgetData[] = [
  { id: 1, title: 'Car Status', type: 'car' },
  { id: 2, title: 'Bus Monitor', type: 'bus' },
  { id: 3, title: 'Bike Status', type: 'bike' },
  { id: 4, title: 'Truck Location', type: 'truck' }
];

const WidgetsPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [widgets, setWidgets] = useState<WidgetData[]>(defaultWidgets);

  // Load widgets from localStorage on component mount
  useEffect(() => {
    const savedWidgets = localStorage.getItem('dashboardWidgets');
    if (savedWidgets) {
      const parsedWidgets = JSON.parse(savedWidgets);
      // Merge default widgets with saved custom widgets
      const mergedWidgets = [
        ...defaultWidgets,
        ...parsedWidgets.filter((widget: WidgetData) => widget.isCustom)
      ];
      setWidgets(mergedWidgets);
    }
  }, []);

  // Save widgets to localStorage whenever they change
  useEffect(() => {
    // Only save custom widgets
    const customWidgets = widgets.filter(widget => widget.isCustom);
    localStorage.setItem('dashboardWidgets', JSON.stringify(customWidgets));
  }, [widgets]);

  const handleCreateWidget = (widgetName: string, chartType: string, graphData?: any) => {
    const newWidget: WidgetData = {
      id: Date.now(), // Use timestamp as unique ID
      title: widgetName,
      type: 'car',
      isCustom: true,
      chartType: chartType,
      graphData: graphData
    };
    
    setWidgets(prevWidgets => [...prevWidgets, newWidget]);
    setIsCreateModalOpen(false);
  };

  const handleDeleteWidget = (widgetId: number) => {
    setWidgets(prevWidgets => prevWidgets.filter(widget => 
      !widget.isCustom || widget.id !== widgetId
    ));
  };

  return (
    <div className="widgets-container">
      <div className="widgets-header">
        <h1>Vehicle Monitoring</h1>
        <p>Track and monitor all vehicle systems</p>
      </div>
      
      <div className="widgets-grid">
        {widgets.map(widget => (
          <Widget 
            key={widget.id}
            title={widget.title}
            type={widget.type}
            isCustom={widget.isCustom}
            chartType={widget.chartType}
            graphData={widget.graphData}
            onDelete={widget.isCustom ? () => handleDeleteWidget(widget.id) : undefined}
          />
        ))}
      </div>

      {/* Create Widget Section */}
      <div className="section-divider"></div>
      <div className="create-widget-section">
        <div className="section-header">
          <h2>Create Custom Widget</h2>
          <p>Design and configure your own monitoring widget</p>
        </div>
        <div className="create-widget-grid">
          <div className="create-widget-card">
            <div className="create-widget-icon">
              <i className="fas fa-chart-bar"></i>
            </div>
            <h3>Custom Analytics</h3>
            <p>Create a new analytics widget</p>
            <div className="analytics-preview">
              <i className="fas fa-chart-line"></i>
              <i className="fas fa-chart-pie"></i>
              <i className="fas fa-chart-area"></i>
            </div>
            <button 
              className="create-button"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <i className="fas fa-plus"></i> Create Widget
            </button>
          </div>
        </div>
      </div>

      <CreateWidgetModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateWidget={handleCreateWidget}
      />
    </div>
  );
};

export default WidgetsPage; 