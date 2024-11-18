import React, { useState } from 'react';
import { useWidgets } from '../../../context/WidgetContext';
import './DashboardPage.css';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  const handleRemoveWidget = (id: string) => {
    const toastId = toast.info(
      <div>
        <p style={{ marginBottom: '10px' }}>Are you sure you want to delete this widget?</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={() => {
              removeWidget(id);
              toast.dismiss(toastId);
              toast.success('Widget deleted successfully!', {
                position: "top-right",
                autoClose: 2000
              });
            }}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(toastId)}
            style={{
              background: '#64748b',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        closeButton: false
      }
    );
  };

  return (
    <div className="dashboard-container">
      <ToastContainer />
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
                  <button 
                    className="delete-bin-button"
                    onClick={() => handleRemoveWidget(widget.id)}
                    title="Remove Widget"
                  >
                    <svg 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      width="16"
                      height="16"
                    >
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                    </svg>
                  </button>
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