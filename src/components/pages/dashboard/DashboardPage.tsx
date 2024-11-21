import React, { useState, useEffect } from 'react';
import { useWidgets } from '../../../context/WidgetContext';
import './DashboardPage.css';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar,
  LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter,
  ComposedChart, RadialBarChart, RadialBar
} from 'recharts';
import { ResponsiveContainer } from 'recharts';

type IconType = 'circle' | 'plainline' | 'square' | 'rect' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye';

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

  const renderGraph = (widget: any) => {
    const { type, selectedData, colors } = widget.data;

    // Common chart configurations
    const commonProps = {
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
      style: {
        background: 'linear-gradient(165deg, rgba(255, 255, 255, 0.95), rgba(252, 253, 255, 0.9))',
        borderRadius: '12px',
      }
    };

    // Enhanced CartesianGrid props
    const gridProps = {
      strokeDasharray: '3 3',
      stroke: 'rgba(203, 213, 225, 0.4)',
      vertical: true
    };

    // Enhanced Tooltip props
    const tooltipProps = {
      contentStyle: {
        background: 'rgba(255, 255, 255, 0.98)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        borderRadius: '8px',
        padding: '0.75rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(8px)'
      }
    };

    // Enhanced Legend props with dynamic positioning
    const legendProps = {
      wrapperStyle: {
        padding: '0.5rem',
        borderRadius: '8px',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(4px)'
      } as React.CSSProperties,
      iconSize: 10,
      iconType: 'circle' as IconType,
      layout: 'vertical' as const,
      align: 'right' as const,
      verticalAlign: 'middle' as const,
      onMouseEnter: (e: any) => {
        if (e.target) {
          e.target.style.transform = 'translateX(-2px)';
        }
      },
      onMouseLeave: (e: any) => {
        if (e.target) {
          e.target.style.transform = 'translateX(0)';
        }
      }
    };

    // Function to calculate legend position based on container size
    const calculateLegendPosition = (containerWidth: number) => {
      if (containerWidth < 400) {
        return {
          ...legendProps,
          layout: 'horizontal' as const,
          align: 'center' as const,
          verticalAlign: 'bottom' as const,
          wrapperStyle: {
            ...legendProps.wrapperStyle,
            marginTop: '1rem'
          } as React.CSSProperties
        };
      }
      return legendProps;
    };

    // Enhanced Axis props
    const axisProps = {
      tick: { fill: '#64748b', fontSize: 12 },
      axisLine: { stroke: '#cbd5e1' },
      tickLine: { stroke: '#cbd5e1' }
    };

    switch (type) {
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={commonProps.margin} style={commonProps.style}>
              <CartesianGrid {...gridProps} />
              <XAxis {...axisProps} dataKey="label" />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipProps} cursor={{ strokeDasharray: '3 3' }} />
              <Legend {...legendProps} />
              <Scatter
                name="Data Points"
                data={selectedData}
                fill="#4f46e5"
                stroke="#ffffff"
                strokeWidth={1}
                r={6}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'verticalBar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={selectedData} 
              margin={commonProps.margin} 
              style={commonProps.style}
            >
              <CartesianGrid {...gridProps} />
              <XAxis {...axisProps} dataKey="label" />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipProps} />
              <Legend {...calculateLegendPosition(window.innerWidth)} />
              <Bar 
                dataKey="Entry" 
                fill="#059669"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
                animationBegin={0}
                animationDuration={1500}
              />
              <Bar 
                dataKey="Exit" 
                fill="#dc2626"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
                animationBegin={200}
                animationDuration={1500}
              />
              <Bar 
                dataKey="Total" 
                fill="#4f46e5"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
                animationBegin={400}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={commonProps.margin} style={commonProps.style}>
              <Pie
                data={selectedData}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius="80%"
                label
              >
                {selectedData.map((entry: any, index: number) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colors?.[`vehicle-${index}`]?.total || '#4f46e5'} 
                  />
                ))}
              </Pie>
              <Tooltip {...tooltipProps} />
              <Legend {...legendProps} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'simpleLine':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={selectedData} margin={commonProps.margin} style={commonProps.style}>
              <CartesianGrid {...gridProps} />
              <XAxis {...axisProps} dataKey="label" />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipProps} />
              <Legend {...legendProps} />
              <Line 
                type="monotone" 
                dataKey="Total" 
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ fill: '#ffffff', stroke: '#4f46e5', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                animationDuration={1500}
              />
              <Line 
                type="monotone" 
                dataKey="Entry" 
                stroke="#059669"
                strokeWidth={2}
                dot={{ fill: '#ffffff', stroke: '#059669', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                animationDuration={1500}
              />
              <Line 
                type="monotone" 
                dataKey="Exit" 
                stroke="#dc2626"
                strokeWidth={2}
                dot={{ fill: '#ffffff', stroke: '#dc2626', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'composed':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={selectedData} margin={commonProps.margin} style={commonProps.style}>
              <CartesianGrid {...gridProps} />
              <XAxis {...axisProps} dataKey="label" />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipProps} />
              <Legend {...legendProps} />
              <Bar 
                dataKey="Total" 
                fill="#4f46e5"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
                animationBegin={0}
                animationDuration={1500}
              />
              <Line 
                type="monotone" 
                dataKey="Entry" 
                stroke="#059669"
                strokeWidth={2}
                dot={{ fill: '#ffffff', stroke: '#059669', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                animationDuration={1500}
              />
              <Line 
                type="monotone" 
                dataKey="Exit" 
                stroke="#dc2626"
                strokeWidth={2}
                dot={{ fill: '#ffffff', stroke: '#dc2626', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                animationDuration={1500}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      // Add similar enhancements for other graph types...

      default:
        console.warn(`Unsupported graph type: ${type}`);
        return (
          <div className="unsupported-graph">
            <p>Graph type not supported: {type}</p>
          </div>
        );
    }
  };

  // Add resize observer to check minimum size
  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        const { width, height } = entry.contentRect;
        const container = entry.target as HTMLElement;
        
        if (width < 400 || height < 250) {
          container.classList.add('min-size');
        } else {
          container.classList.remove('min-size');
        }
      });
    });

    const widgets = document.querySelectorAll('.widget-container');
    widgets.forEach(widget => resizeObserver.observe(widget));

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

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
                <div 
                  className="widget-container"
                  style={{ 
                    background: 'transparent',
                    boxShadow: 'none',
                    border: 'none'
                  }}
                >
                  <div 
                    className="card-content draggable-area"
                    style={{ 
                      padding: 0,
                      background: 'transparent'
                    }}
                  >
                    {widget.type === 'graph' ? (
                      <div 
                        className="graph-content"
                        style={{
                          background: 'transparent',
                          boxShadow: 'none'
                        }}
                      >
                        {renderGraph(widget)}
                        <button 
                          className="graph-delete-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveWidget(widget.id);
                          }}
                          title="Delete Graph"
                        >
                          <svg 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <path d="M18 6L6 18M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="widget-content"
                        style={{
                          background: 'transparent',
                          boxShadow: 'none'
                        }}
                        dangerouslySetInnerHTML={{ __html: widget.content }}
                      />
                    )}
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