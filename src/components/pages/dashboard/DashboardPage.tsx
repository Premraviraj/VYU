import React, { useState, useEffect } from 'react';
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
  LineChart, 
  Bar, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
  BarChart as RechartsBarChart
} from 'recharts';
import GraphModal from '../widgets/GraphModal';
import {
  Dashboard, TrendingUp, Assessment, PieChart,
  BarChart as BarChartIcon,
  ShowChart, BubbleChart, DonutLarge, Insights, Analytics,
  Speed, Timer, AccessTime, CalendarToday, Event,
  Person, Group, Groups, Business, Store,
  LocalShipping, DirectionsCar, FlightTakeoff, Train,
  Security, Shield, Gavel, VerifiedUser,
  Notifications, Warning, Error as ErrorIcon, CheckCircle
} from '@mui/icons-material';
import { API_URL } from '../../../utils/config';
import { ReceivedKpiData } from '../../../types/kpiTypes';
import axios from 'axios';

interface PreparedKPICard {
  id: string;
  title: string;
  design: string;
  fields: PreparedField[];
}

const ResponsiveGridLayout = WidthProvider(Responsive);

const MIN_WIDTH = 372;
const MIN_HEIGHT = 250;
const INITIAL_WIDTH = 372;
const INITIAL_HEIGHT = 250;

interface KPICardValue {
  fields: {
    field_id: string;
    field_name: string;
    field_value: number;
    collection_name: string;
    video_source: string;
    rule_name: string;
    styling?: {
      color: string;
      size: string;
      icon?: string;
    };
  }[] | Record<string, any>;
  kpi_name?: string;
  design_type?: string;
  collection_name?: string;
  video_source?: string;
}

const iconMap: { [key: string]: JSX.Element } = {
  'Dashboard': <Dashboard />,
  'Trending': <TrendingUp />,
  'Assessment': <Assessment />,
  'Analytics': <Analytics />,
  'Insights': <Insights />,
  'Pie Chart': <PieChart />,
  'Bar Chart': <BarChartIcon />,
  'Line Chart': <ShowChart />,
  'Bubble Chart': <BubbleChart />,
  'Donut Chart': <DonutLarge />,
  'Speed': <Speed />,
  'Timer': <Timer />,
  'Clock': <AccessTime />,
  'Calendar': <CalendarToday />,
  'Event': <Event />,
  'Person': <Person />,
  'Group': <Group />,
  'Groups': <Groups />,
  'Business': <Business />,
  'Store': <Store />,
  'Shipping': <LocalShipping />,
  'Car': <DirectionsCar />,
  'Flight': <FlightTakeoff />,
  'Train': <Train />,
  'Security': <Security />,
  'Shield': <Shield />,
  'Rules': <Gavel />,
  'Verified': <VerifiedUser />,
  'Notification': <Notifications />,
  'Warning': <Warning />,
  'Error': <ErrorIcon />,
  'Success': <CheckCircle />
};

// Update the PreparedField interface
interface PreparedField {
  field_id: string;
  field_name: string;
  fieldvalue: number;
  collection_name: string;
  video_source: string;
  rule_name: string;
  styling?: {
    color: string;
    size: string;
    icon?: string;
  };
}

// Now the style utility functions can use PreparedField
const getFieldStyles = (styling: PreparedField['styling']) => {
  // Default styling if not provided
  const defaultStyling = {
    color: '#4f46e5',
    size: 'medium',
    icon: 'Dashboard'
  };

  // Use provided styling or default
  const style = styling || defaultStyling;

  // Base styles
  const baseStyles: React.CSSProperties = {
    color: style.color,
    transition: 'all 0.3s ease',
  };

  // Size-specific styles
  const sizeStyles: { [key: string]: React.CSSProperties } = {
    small: {
      padding: '0.75rem',
      fontSize: '0.875rem',
    },
    medium: {
      padding: '1rem',
      fontSize: '1rem',
    },
    large: {
      padding: '1.5rem',
      fontSize: '1.25rem',
    }
  };

  // Value-specific styles
  const valueStyles: { [key: string]: React.CSSProperties } = {
    small: {
      fontSize: '1.5rem',
    },
    medium: {
      fontSize: '2rem',
    },
    large: {
      fontSize: '2.5rem',
    }
  };

  // Icon-specific styles
  const iconStyles: { [key: string]: React.CSSProperties } = {
    small: {
      width: '24px',
      height: '24px',
    },
    medium: {
      width: '32px',
      height: '32px',
    },
    large: {
      width: '40px',
      height: '40px',
    }
  };

  // Use the size from styling or default to 'medium'
  const size = style.size || 'medium';

  return {
    container: {
      ...baseStyles,
      ...sizeStyles[size],
    },
    value: {
      ...valueStyles[size],
      color: style.color,
      fontWeight: 600,
      lineHeight: 1.2,
    },
    icon: {
      ...iconStyles[size],
      color: style.color,
    },
    label: {
      fontSize: `${sizeStyles[size].fontSize}`,
      color: `${style.color}99`, // Add transparency to the color
      fontWeight: 500,
    }
  };
};

// Add hover effect styles
const getHoverStyles = (styling: PreparedField['styling']): React.CSSProperties => {
  const defaultColor = '#4f46e5';
  const color = styling?.color || defaultColor;
  
  return {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 16px ${color}15`,
    background: `${color}05`,
  };
};

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
            <RechartsBarChart data={data} {...commonProps}>
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
            </RechartsBarChart>
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

  // Add handleCardDoubleClick function at the component level
  const handleCardDoubleClick = (card: PreparedKPICard) => {
    // TODO: Implement adding card to dashboard
    console.log('Double clicked card:', card);
    toast.info('Adding card to dashboard...');
    setIsBlankWindowOpen(false);
  };

  // Update BlankWindow component to use the parent's handleCardDoubleClick
  const BlankWindow = () => {
    const [kpiCards, setKpiCards] = useState<PreparedKPICard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [realTimeValues, setRealTimeValues] = useState<{[key: string]: number}>({});
    const [cachedKpiCards, setCachedKpiCards] = useState<PreparedKPICard[]>([]);
    const CACHE_DURATION = 30000; // 30 seconds cache
    const [lastFetchTime, setLastFetchTime] = useState(0);

    // Add useEffect to fetch data on mount
    useEffect(() => {
      console.log('BlankWindow mounted, fetching KPI cards...');
      fetchKPICardsWithFetch();
    }, []); // Empty dependency array means this runs once on mount

    // Update fetchKPICardsWithFetch function with caching
    const fetchKPICardsWithFetch = async () => {
      try {
        const currentTime = Date.now();
        
        // Return cached data if it's still valid
        if (cachedKpiCards.length > 0 && (currentTime - lastFetchTime) < CACHE_DURATION) {
          console.log('Using cached KPI cards');
          setKpiCards(cachedKpiCards);
          setIsLoading(false);
          return;
        }

        console.log('Fetching fresh KPI cards...');
        setIsLoading(true);
        
        const response = await fetch(`${API_URL}/api/v1/kpiCards`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Received KPI data:', data); // Add this log
          const cardsData = Array.isArray(data) ? data : data.kpiCards || [];
          
          const preparedCards = cardsData.map((card: any) => ({
            id: card.kpi_id || `kpi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: card.kpi_name || 'Untitled KPI',
            design: card.design_type || 'modern',
            fields: Array.isArray(card.fields) ? card.fields.map((field: any) => ({
              field_id: field.field_id || `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              field_name: field.field_name || field.rule_name || 'Unnamed Field',
              fieldvalue: field.field_value || field.fieldvalue || 0,
              collection_name: field.collection_name || card.collection_name || '',
              video_source: field.video_source || card.video_source || '',
              rule_name: field.rule_name || field.field_name || '',
              styling: {
                color: field.styling?.color || '#4f46e5',
                size: field.styling?.size || 'medium',
                icon: field.styling?.icon || 'Dashboard'
              }
            })) : []
          }));

          console.log('Prepared cards:', preparedCards); // Add this log

          // Update cache and state
          setCachedKpiCards(preparedCards);
          setLastFetchTime(currentTime);
          setKpiCards(preparedCards);

          // Fetch field values in the background
          if (preparedCards.length > 0) {
            fetchFieldValues(preparedCards).catch(console.error);
          }
        } else {
          console.error('Failed to fetch KPI cards:', response.status);
          const errorText = await response.text();
          console.error('Error response:', errorText);
        }
      } catch (error) {
        console.error('Error fetching KPI cards:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Update fetchFieldValues to be non-blocking
    const fetchFieldValues = async (cards: PreparedKPICard[]) => {
      const fetchPromises = cards.flatMap(card =>
        card.fields.map(field => fetchFieldData(field))
      );

      // Execute all fetches in parallel
      await Promise.allSettled(fetchPromises);
    };

    // Optimize fetchFieldData
    const fetchFieldData = async (field: PreparedField) => {
      try {
        const response = await fetch(
          `${API_URL}/api/v1/Collection/filtered/count?collection=${encodeURIComponent(field.collection_name)}&VideoSource=${encodeURIComponent(field.video_source)}&Rule=${encodeURIComponent(field.rule_name)}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data?.fieldCounts?.[field.rule_name] !== undefined) {
            setRealTimeValues(prev => ({
              ...prev,
              [field.field_id]: data.fieldCounts[field.rule_name]
            }));
          }
        }
      } catch (error) {
        console.error(`Error fetching data for field ${field.field_name}:`, error);
      }
    };

    // Update the field rendering logic
    const renderField = (field: PreparedField) => {
      if (!field || !field.field_id) {
        console.error('Invalid field data:', field);
        return null;
    }

      const styles = getFieldStyles(field.styling || {
        color: '#4f46e5',
        size: 'medium'
      });
      
      return (
        <div 
          key={field.field_id} 
          className={`kpi-field ${field.styling?.size || 'medium'}`}
          style={styles.container}
        >
          {field.styling?.icon && iconMap[field.styling.icon] && (
            <div className="field-icon" style={styles.icon}>
              {iconMap[field.styling.icon]}
            </div>
          )}
          <div className="field-value" style={styles.value}>
            {typeof realTimeValues[field.field_id] !== 'undefined'
              ? realTimeValues[field.field_id].toLocaleString()
              : (field.fieldvalue || 0).toLocaleString()}
          </div>
          <div className="field-label" style={styles.label}>
            {field.field_name || 'Unnamed Field'}
          </div>
        </div>
      );
    };

    // Update the renderKPICard function
    const renderKPICard = (card: PreparedKPICard) => {
      try {
        console.log('Rendering KPI card:', card);
        return (
          <div 
            className="kpi-preview-modern"
            onDoubleClick={() => handleCardDoubleClick(card)}
            style={{ cursor: 'pointer' }}
            title="Double click to add to dashboard"
          >
            <div className="kpi-main-content">
              <div className="kpi-header">
                <h3 className="kpi-title">{card.title || 'Card Title'}</h3>
              </div>
              <div className="kpi-fields-grid">
                {Array.isArray(card.fields) && card.fields.map((field: PreparedField) => (
                  <div key={field.field_id}>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      } catch (error) {
        console.error('Error rendering card:', card, error);
        return (
          <div key={card.id} className="error-card">
            Error rendering card: {card.title}
          </div>
        );
      }
    };

    return (
      <div className="blank-window-overlay">
        <div className="blank-window">
          <div className="blank-window-header">
            <h2>KPI Cards</h2>
            <button 
              className="close-button"
              onClick={() => setIsBlankWindowOpen(false)}
            >
              ×
            </button>
          </div>
          <div className="blank-window-content">
            {isLoading ? (
              <div className="loading-state">Loading KPI Cards...</div>
            ) : kpiCards && kpiCards.length > 0 ? (
              <div className="kpi-cards-grid">
                {kpiCards.map((card) => (
                  <div key={card.id}>
                    {renderKPICard(card)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No KPI Cards Found</h3>
                <p>Create your first KPI card to see it here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Add this function to create a new KPI card
  const createNewKPICard = async (title: string, fields: any, designType: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/kpiCards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          kpi_name: title,
          fields: fields,
          design_type: designType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create KPI card');
      }

      const data = await response.json();
      console.log('KPI Card created:', data);
      return data;
    } catch (error) {
      console.error('Error creating KPI card:', error);
      throw error;
    }
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