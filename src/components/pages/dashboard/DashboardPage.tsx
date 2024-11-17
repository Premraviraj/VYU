import React, { useState } from 'react';
import { useWidgets } from '../../../context/WidgetContext';
import './DashboardPage.css';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const DashboardPage: React.FC = () => {
  const { widgets, removeWidget } = useWidgets();
  const [layouts, setLayouts] = useState({});

  const defaultLayout = widgets.map((widget, index) => ({
    i: widget.id,
    x: (index % 3) * 4,
    y: Math.floor(index / 3) * 4,
    w: 4,
    h: 4,
    minW: 2,
    minH: 3
  }));

  const handleLayoutChange = (layout: any, layouts: any) => {
    setLayouts(layouts);
  };

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>
      
      <div className="widgets-display">
        {widgets.length > 0 ? (
          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: defaultLayout }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={100}
            onLayoutChange={handleLayoutChange}
            isDraggable={true}
            isResizable={true}
            draggableHandle=".card-header"
          >
            {widgets.map(widget => (
              <div key={widget.id} className="grid-item">
                <div className="widget-container">
                  <div className="card-header">
                    <h3>{widget.title}</h3>
                    <button 
                      className="remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeWidget(widget.id);
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <div 
                    className="card-content"
                    style={{ backgroundColor: widget.backgroundColor || '#ffffff' }}
                  >
                    <div 
                      className="widget-content"
                      dangerouslySetInnerHTML={{ __html: widget.content }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </ResponsiveGridLayout>
        ) : (
          <div className="no-widgets-message">
            <p>No widgets created yet. Create widgets from the Widgets page.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;