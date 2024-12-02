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

// Add these interfaces at the top level, after the KPICard interface
interface PreparedField {
  id: string;
  name: string;
  value: number;
  styling: {
    color: string;
    size: string;
    icon?: string;
  };
  source: {
    collection: string;
    videoSource: string;
    rule: string;
  };
}

interface PreparedKPICard {
  id: string;
  title: string;
  design: string;
  fields: PreparedField[];
}

// Now the style utility functions can use PreparedField
const getFieldStyles = (styling: PreparedField['styling']) => {
  // Base styles
  const baseStyles: React.CSSProperties = {
    color: styling.color,
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

  return {
    container: {
      ...baseStyles,
      ...sizeStyles[styling.size],
    },
    value: {
      ...valueStyles[styling.size],
      color: styling.color,
      fontWeight: 600,
      lineHeight: 1.2,
    },
    icon: {
      ...iconStyles[styling.size],
      color: styling.color,
    },
    label: {
      fontSize: `${sizeStyles[styling.size].fontSize}`,
      color: `${styling.color}99`, // Add transparency to the color
      fontWeight: 500,
    }
  };
};

// Add hover effect styles
const getHoverStyles = (styling: PreparedField['styling']): React.CSSProperties => ({
  transform: 'translateY(-4px)',
  boxShadow: `0 8px 16px ${styling.color}15`,
  background: `${styling.color}05`,
});

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

  // Add this new component
  const BlankWindow = () => {
    const [kpiCards, setKpiCards] = useState<PreparedKPICard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [realTimeValues, setRealTimeValues] = useState<{[key: string]: number}>({});

    const transformKpiData = (receivedData: ReceivedKpiData): { kpiCards: KPICardValue[] } => {
      if (!receivedData.fieldCounts) {
        return { kpiCards: [] };
      }

      // If fieldCounts is an array, use it directly
      if (Array.isArray(receivedData.fieldCounts)) {
        return {
          kpiCards: receivedData.fieldCounts.map(card => ({
            ...card,
            fields: card.fields || [],
            kpi_name: card.kpi_name,
            design_type: card.design_type,
            collection_name: card.collection_name,
            video_source: card.video_source
          }))
        };
      }

      // If fieldCounts is an object, transform it to array
      const kpiCards = Object.entries(receivedData.fieldCounts).map(([key, value]) => ({
        fields: value.fields || [],
        kpi_name: value.kpi_name,
        design_type: value.design_type,
        collection_name: value.collection_name,
        video_source: value.video_source
      }));

      return { kpiCards };
    };

    // Using Fetch API
    const fetchKPICardsWithFetch = async () => {
      try {
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
          console.log('Raw Response Data:', JSON.stringify(data, null, 2));

          if (!data.fieldCounts || !Array.isArray(data.fieldCounts)) {
            console.error('Invalid data structure:', data);
            return;
          }

          const preparedCards = data.fieldCounts.map(card => {
            if (!card.fields || !Array.isArray(card.fields)) {
              return {
                id: card._id.toString(),
                title: card.kpi_name,
                design: card.design_type || 'modern',
                fields: []
              };
            }

            // Transform fields to match the expected structure
            const transformedFields = card.fields.map(field => ({
              field_id: field.field_id,
              field_name: field.field_name,
              field_value: field.field_value,
              styling: {
                color: field.styling?.color || '#4f46e5',
                size: field.styling?.size || 'medium',
                icon: field.styling?.icon
              },
              source: {
                collection: field.collection_name,
                videoSource: field.video_source,
                rule: field.rule_name
              }
            }));

            return {
              id: card._id.toString(),
              title: card.kpi_name,
              design: card.design_type || 'modern',
              fields: transformedFields
            };
          });

          console.log('Prepared KPI Cards:', preparedCards);
          setKpiCards(preparedCards);
        } else {
          const errorText = await response.text();
          console.error('Fetch Error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
        }
      } catch (error) {
        console.error('Fetch Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Using Axios
    const fetchKPICardsWithAxios = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/api/v1/Collection/kpiCards`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });

        // Log detailed response data
        console.log('KPI Cards Data (Axios):', {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: JSON.stringify(response.data, null, 2)
        });

      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Axios Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            error: error.response?.data
          });
        } else {
          console.error('Unexpected Error:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Use one of these in your useEffect
    useEffect(() => {
      // Choose either Fetch or Axios implementation
      fetchKPICardsWithFetch();
      // OR
      // fetchKPICardsWithAxios();

      // Set up interval for periodic updates
      const interval = setInterval(() => {
        fetchKPICardsWithFetch();
        // OR
        // fetchKPICardsWithAxios();
      }, 5000);

      return () => clearInterval(interval);
    }, []);

    // Update the fetchFieldData function
    const fetchFieldData = async (field: PreparedField) => {
      try {
        const response = await fetch(
          `${API_URL}/api/v1/Collection/filtered?collection=${encodeURIComponent(field.source.collection)}&VideoSource=${encodeURIComponent(field.source.videoSource)}&Rule=${encodeURIComponent(field.source.rule)}`,
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
          if (data && data.fieldCounts && data.fieldCounts[field.source.rule] !== undefined) {
            setRealTimeValues(prev => ({
              ...prev,
              [field.id]: data.fieldCounts[field.source.rule]
            }));
          }
        }
      } catch (error) {
        console.error(`Error fetching data for field ${field.name}:`, error);
      }
    };

    // Update the useEffect that uses fetchFieldData
    useEffect(() => {
      if (kpiCards.length === 0) return;

      // Initial fetch for all fields
      kpiCards.forEach(card => {
        card.fields.forEach(field => {
          // Check source properties
          if (field.source && field.source.collection && field.source.videoSource) {
            fetchFieldData(field);
          }
        });
      });

      // Set up interval for updates
      const interval = setInterval(() => {
        kpiCards.forEach(card => {
          card.fields.forEach(field => {
            // Check source properties
            if (field.source && field.source.collection && field.source.videoSource) {
              fetchFieldData(field);
            }
          });
        });
      }, 5000);

      return () => clearInterval(interval);
    }, [kpiCards]);

    // Update the field rendering in BlankWindow component
    const renderField = (field: any) => {
      // Extract values from field object
      const {
        field_id,
        field_name,
        field_value,
        styling = {
          color: '#4f46e5',
          size: 'medium'
        }
      } = field;

      // Get styles for the field
      const styles = getFieldStyles(styling);
      
      return (
        <div 
          key={field_id} 
          className={`kpi-field ${styling.size || 'medium'}`}
          style={styles.container}
        >
          {styling.icon && iconMap[styling.icon] && (
            <div className="field-icon" style={styles.icon}>
              {iconMap[styling.icon]}
            </div>
          )}
          <div className="field-value" style={styles.value}>
            {realTimeValues[field_id] !== undefined 
              ? String(realTimeValues[field_id])
              : String(field_value)}
          </div>
          <div className="field-label" style={styles.label}>
            {field_name}
          </div>
        </div>
      );
    };

    // Update the KPI card rendering
    const renderKPICard = (card: PreparedKPICard) => (
      <div key={card.id} className={`kpi-preview-${card.design}`}>
        <div className="kpi-main-content">
          <div className="kpi-header">
            <h3 className="kpi-title">{card.title}</h3>
          </div>
          <div className="kpi-fields-grid">
            {Array.isArray(card.fields) ? 
              card.fields.map(field => renderField(field))
              : null
            }
          </div>
        </div>
      </div>
    );

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
            ) : kpiCards.length === 0 ? (
              <div className="empty-state">
                <h3>No KPI Cards Found</h3>
                <p>Create your first KPI card to see it here.</p>
              </div>
            ) : (
              <div className="kpi-cards-grid">
                {kpiCards.map(card => {
                  try {
                    return renderKPICard(card);
                  } catch (error) {
                    console.error('Error rendering card:', card, error);
                    return (
                      <div key={card.id} className="error-card">
                        Error rendering card: {card.title}
                      </div>
                    );
                  }
                })}
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