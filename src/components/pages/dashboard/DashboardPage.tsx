import React, { useState } from 'react';
import { useWidgets } from '../../../context/WidgetContext';
import { Widget, GraphType, isGraphWidget } from '../../../types/Widget';
import { ColorState } from '../../../context/GraphContext';
import './DashboardPage.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import {
  BarChart, LineChart, 
  Bar, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import GraphModal from '../widgets/GraphModal';

const ResponsiveGridLayout = WidthProvider(Responsive);

const MIN_WIDTH = 372;
const MIN_HEIGHT = 250;
const INITIAL_WIDTH = 372;
const INITIAL_HEIGHT = 250;

const DashboardPage: React.FC = () => {
  const [isBlankWindowOpen, setIsBlankWindowOpen] = useState(false);
  const { widgets, removeWidget } = useWidgets();
  const [isLoading, setIsLoading] = useState(true);
  const [layouts, setLayouts] = useState({});

  const handleRemoveWidget = (id: string) => {
    removeWidget(id);
    toast.success('Widget deleted successfully!', {
      position: "top-right",
      autoClose: 2000
    });
  };

  // Default layout configuration with specific dimensions
  const defaultLayout = widgets.map((widget, index) => ({
    i: widget.id,
    x: (index % 3) * 4,
    y: Math.floor(index / 3) * 4,
    w: Math.ceil(INITIAL_WIDTH / 100),
    h: Math.ceil(INITIAL_HEIGHT / 100),
    minW: Math.ceil(MIN_WIDTH / 100),
    minH: Math.ceil(MIN_HEIGHT / 100),
    maxW: 12,
    maxH: 8
  }));

  const handleResize = (layout: any, oldItem: any, newItem: any) => {
    const newWidth = newItem.w * 100;
    const newHeight = newItem.h * 100;

    if (newWidth < MIN_WIDTH || newHeight < MIN_HEIGHT) {
      toast.warn(`Cannot resize below minimum dimensions (${MIN_WIDTH}px × ${MIN_HEIGHT}px)`, {
        position: "top-center",
        autoClose: 2000,
      });
      return false;
    }

    // Update the content size when resizing
    const widgetElement = document.querySelector(`[data-grid-id="${newItem.i}"]`);
    if (widgetElement) {
      const contentElement = widgetElement.querySelector('.widget-content');
      if (contentElement) {
        (contentElement as HTMLElement).style.width = `${newWidth}px`;
        (contentElement as HTMLElement).style.height = `${newHeight - 50}px`; // Subtract header height
      }
    }
    return true;
  };

  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case 'graph':
        return (
          <div className="widget-content">
            <div className="widget-header">
              <h3>{widget.title}</h3>
            </div>
            <div className="widget-body">
              {widget.chartProps ? generateChartComponent(
                widget.chartProps.type,
                widget.chartProps.data,
                widget.chartProps.colors
              ) : (
                <div>No chart data available</div>
              )}
            </div>
          </div>
        );
      // ... other widget types
      default:
        return null;
    }
  };

  // Add this helper function to generate charts
  const generateChartComponent = (type: GraphType, data: any[], colors: ColorState) => {
    const commonProps = {
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
      style: {
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(249, 250, 251, 0.95))',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05), 0 8px 16px rgba(0, 0, 0, 0.05)',
        padding: '15px',
        filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
      }
    };

    const customLegendStyle = {
      wrapperStyle: {
        paddingTop: '20px',
        paddingBottom: '15px',
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        flexWrap: 'wrap' as const
      },
      itemStyle: {
        padding: '8px 16px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '30px',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#1e293b'
      }
    };

    const customTooltipStyle = {
      contentStyle: {
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderRadius: '12px',
        border: 'none',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        padding: '12px 16px'
      }
    };

    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} {...commonProps}>
              <defs>
                <linearGradient id="entryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.4}/>
                </linearGradient>
                <linearGradient id="exitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0.4}/>
                </linearGradient>
                <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.4}/>
                </linearGradient>
                <filter id="shadow">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2"/>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
              <XAxis 
                dataKey="label" 
                tick={{ fill: '#4B5563', fontSize: 12 }}
                axisLine={{ stroke: '#9CA3AF' }}
                tickLine={{ stroke: '#9CA3AF' }}
              />
              <YAxis 
                tick={{ fill: '#4B5563', fontSize: 12 }}
                axisLine={{ stroke: '#9CA3AF' }}
                tickLine={{ stroke: '#9CA3AF' }}
              />
              <Tooltip {...customTooltipStyle} />
              <Legend {...customLegendStyle} />
              <Bar 
                dataKey="Entry" 
                fill="url(#entryGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
                animationDuration={1500}
                animationEasing="ease-out"
                filter="url(#shadow)"
              />
              <Bar 
                dataKey="Exit" 
                fill="url(#exitGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
                animationDuration={1500}
                animationEasing="ease-out"
                filter="url(#shadow)"
              />
              <Bar 
                dataKey="Total" 
                fill="url(#totalGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
                animationDuration={1500}
                animationEasing="ease-out"
                filter="url(#shadow)"
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} {...commonProps}>
              <defs>
                <linearGradient id="totalLineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="5%" stopColor="#6366F1"/>
                  <stop offset="95%" stopColor="#4F46E5"/>
                </linearGradient>
                <linearGradient id="entryLineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="5%" stopColor="#10B981"/>
                  <stop offset="95%" stopColor="#059669"/>
                </linearGradient>
                <linearGradient id="exitLineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="5%" stopColor="#EF4444"/>
                  <stop offset="95%" stopColor="#DC2626"/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
              <XAxis 
                dataKey="label" 
                tick={{ fill: '#4B5563', fontSize: 12 }}
                axisLine={{ stroke: '#9CA3AF' }}
              />
              <YAxis 
                tick={{ fill: '#4B5563', fontSize: 12 }}
                axisLine={{ stroke: '#9CA3AF' }}
              />
              <Tooltip {...customTooltipStyle} />
              <Legend {...customLegendStyle} />
              <Line 
                type="monotone" 
                dataKey="Total" 
                stroke="url(#totalLineGradient)"
                strokeWidth={3}
                dot={{ fill: '#ffffff', stroke: '#4F46E5', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#ffffff', strokeWidth: 2 }}
                animationDuration={1500}
                animationEasing="ease-out"
              />
              <Line 
                type="monotone" 
                dataKey="Entry" 
                stroke="url(#entryLineGradient)"
                strokeWidth={3}
                dot={{ fill: '#ffffff', stroke: '#059669', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#ffffff', strokeWidth: 2 }}
                animationDuration={1500}
                animationEasing="ease-out"
              />
              <Line 
                type="monotone" 
                dataKey="Exit" 
                stroke="url(#exitLineGradient)"
                strokeWidth={3}
                dot={{ fill: '#ffffff', stroke: '#DC2626', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#ffffff', strokeWidth: 2 }}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  // Add this new component
  const BlankWindow = () => {
    return (
      <div className="blank-window-overlay">
        <div className="blank-window">
          <div className="blank-window-header">
            <h2>Widgets</h2>
            <button 
              className="close-button"
              onClick={() => setIsBlankWindowOpen(false)}
            >
              ×
            </button>
          </div>
          <div className="blank-window-content">
            {/* Content will be added later with API integration */}
          </div>
        </div>
      </div>
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
            cols={{ lg: 12, md: 9, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={100}
            onLayoutChange={(layout, layouts) => setLayouts(layouts)}
            isDraggable={true}
            isResizable={true}
            resizeHandles={['se']}
            margin={[20, 20]}
            containerPadding={[20, 20]}
            draggableHandle=".widget-header"
            onResize={handleResize}
            preventCollision={false}
            compactType={null}
          >
            {widgets.map(widget => (
              <div 
                key={widget.id} 
                className="widget-item"
                data-grid-id={widget.id}
                style={{ 
                  minWidth: MIN_WIDTH,
                  minHeight: MIN_HEIGHT,
                  width: '100%',
                  height: '100%'
                }}
              >
                <div className="widget-header">
                  <h3>{widget.title}</h3>
                  <div className="widget-controls">
                    <button 
                      className="delete-button"
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
                        width="18"
                        height="18"
                      >
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div 
                  className="widget-content"
                  style={{
                    width: '100%',
                    height: 'calc(100% - 50px)',
                    overflow: 'hidden'
                  }}
                >
                  {isGraphWidget(widget) && widget.chartProps && (
                    generateChartComponent(
                      widget.chartProps.type,
                      widget.chartProps.data,
                      widget.chartProps.colors
                    )
                  )}
                </div>
              </div>
            ))}
          </ResponsiveGridLayout>
        ) : (
          <div 
            className="empty-state" 
            onClick={() => setIsBlankWindowOpen(true)}
          >
            <div className="plus-icon"></div>
            <h3>No Widgets Yet</h3>
            <p>Click to add some widgets to your dashboard</p>
          </div>
        )}
      </div>

      {/* Replace GraphModal with BlankWindow */}
      {isBlankWindowOpen && <BlankWindow />}
    </div>
  );
};

export default DashboardPage;