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
  Notifications, Warning, Error as ErrorIcon, CheckCircle,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { API_URL } from '../../../utils/config';
import { ReceivedKpiData } from '../../../types/kpiTypes';
import type { DashboardKPICard } from '../../../types/kpiTypes';
import axios from 'axios';
// import { createStyles } from '@mui/styles';

interface KPICardData {
  _id: string;
  kpi_id: string;
  kpi_name: string;
  kpi_type: string;
  design_type: string;
  created_at: string;
  updated_at: string;
  field_id: string;
  field_name: string;
  field_value: string;
  collection_name: string;
  video_source: string;
  rule_name: string;
  style_color: string;
  style_size: string;
  style_icon: string;
  config: {
    refresh_interval: number;
    layout: Object;
  };
  createdAt: string;
  updatedAt: string;
}

const ResponsiveGridLayout = WidthProvider(Responsive);

const MIN_WIDTH = 250;
const MIN_HEIGHT = 180;
const INITIAL_WIDTH = 250;
const INITIAL_HEIGHT = 180;

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
  'Success': <CheckCircle />,
  'Edit': <EditIcon />,
  'Delete': <DeleteIcon />
};

// Update the RawData interface
interface RawData {
  data?: any[];
  ruleCounts?: { [key: string]: number };
  fieldCounts?: { [key: string]: number };
  metadata?: any;
  latestDataPoint?: {
    Rule: string;
    Count: number;
    Name: string;
    Value: number;
  };
}

// Update the PreparedField interface
interface PreparedField {
  field_id: string;
  field_name: string;
  field_value?: number;
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

// Update the RawDataResponse interface
interface RawDataResponse {
  data: Array<{
    Rule: string;
    Count: number;
    Name: string;
    Value: number;
  }>;
  metadata?: any;
}

// Replace the styles constant with createStyles
const useStyles = () => {
  return {
    kpiCardsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1rem',
      padding: '1rem'
    },
    kpiCard: {
      background: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '1rem'
    },
    kpiCardHeader: {
      marginBottom: '1rem',
      paddingBottom: '0.5rem',
      borderBottom: '1px solid #e5e7eb'
    },
    kpiCardHeaderTitle: {
      margin: 0,
      color: '#1f2937',
      fontSize: '1.25rem'
    },
    kpiField: {
      padding: '1rem',
      marginBottom: '0.5rem',
      borderRadius: '0.375rem',
      background: '#f9fafb'
    },
    fieldHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.5rem'
    },
    fieldName: {
      fontWeight: 600
    },
    fieldSource: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    fieldValue: {
      fontSize: '2rem',
      fontWeight: 700,
      textAlign: 'center',
      margin: '1rem 0'
    },
    fieldFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '0.75rem',
      color: '#6b7280'
    }
  };
};

// Update BlankWindow component to receive setIsBlankWindowOpen
interface BlankWindowProps {
  setIsBlankWindowOpen: (isOpen: boolean) => void;
  addWidget: (widget: Widget | DashboardKPICard) => void;
}

const BlankWindow: React.FC<BlankWindowProps> = ({ setIsBlankWindowOpen, addWidget }) => {
  const [kpiCards, setKpiCards] = useState<KPICardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchKPICardsWithFetch = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/kpiCards`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch KPI cards: ${response.status}`);
      }

      const data = await response.json();
      console.log('Raw API Response:', data);

      // Process each card and ensure all fields are present
      const processedCards = data.map((card: any) => {
        console.log('Processing card:', card);
        
        // Create a processed card with all required fields
        const processedCard = {
          _id: card._id,
          kpi_id: card.kpi_id,
          kpi_name: card.kpi_name,
          kpi_type: card.kpi_type,
          design_type: card.design_type,
          created_at: card.created_at,
          updated_at: card.updated_at,
          field_id: card.field_id,
          field_name: card.field_name || '',  // Provide default values
          field_value: card.field_value || '0',
          collection_name: card.collection_name || '',
          video_source: card.video_source || '',
          rule_name: card.rule_name || '',
          style_color: card.style_color || '#4f46e5',
          style_size: card.style_size || 'medium',
          style_icon: card.style_icon || 'Dashboard',
          config: {
            refresh_interval: card.config?.refresh_interval || 5000,
            layout: card.config?.layout || {}
          }
        };

        console.log('Processed card:', processedCard);
        return processedCard;
      });

      console.log('Final processed cards:', processedCards);
      setKpiCards(processedCards);

    } catch (error) {
      console.error('Error fetching KPI cards:', error);
      toast.error('Failed to load KPI cards');
      setKpiCards([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardDoubleClick = (card: KPICardData) => {
    // Create a dashboard widget from the KPI card
    const dashboardCard: DashboardKPICard = {
      ...card,
      type: 'kpi',
      id: `kpi-${Date.now()}`
    };

    // Add the card to widgets
    addWidget(dashboardCard);
    
    // Show success message and close modal
    toast.success('Card added to dashboard');
    setIsBlankWindowOpen(false);
  };

  const renderKPICard = (card: KPICardData) => {
    return (
      <div 
        key={card._id} 
        className="kpi-card"
        onDoubleClick={() => handleCardDoubleClick(card)}
      >
        <h3 className="kpi-card-title">
          {card.kpi_name}
        </h3>
        <div className="kpi-card-content">
          <div className="kpi-value">
            {card.field_value}
          </div>
          <div className="kpi-name">
            {card.field_name}
          </div>
          <div className="kpi-source">
            Source {card.video_source}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchKPICardsWithFetch();
  }, []);

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
          ) : kpiCards.length > 0 ? (
            <div className="kpi-cards-grid">
              {kpiCards.map((card) => renderKPICard(card))}
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

// First, make sure your WidgetContext is properly typed
interface WidgetContextType {
  widgets: Widget[];
  addWidget: (widget: Widget | DashboardKPICard) => void;
  removeWidget: (id: string) => void;
}

// Update the type guard function
const isKPIWidget = (widget: Widget | DashboardKPICard): widget is DashboardKPICard => {
  return (
    'kpi_name' in widget &&
    'field_value' in widget &&
    'field_name' in widget &&
    'video_source' in widget
  );
};

// Add this interface for the dialog
interface EditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  widget: DashboardKPICard | null;
  onSave: (settings: any) => void;
}

// Add this new component for the edit dialog
const EditDialog: React.FC<EditDialogProps> = ({ isOpen, onClose, widget, onSave }) => {
  const [settings, setSettings] = useState({
    size: widget?.style_size || 'medium',
    color: widget?.style_color || '#4169E1',
    icon: widget?.style_icon || 'Dashboard'
  });

  if (!isOpen || !widget) return null;

  return (
    <div className="edit-dialog-overlay">
      <div className="edit-dialog">
        <div className="edit-dialog-header">
          <h3>Edit {widget.kpi_name}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="edit-dialog-content">
          {/* Size Options */}
          <div className="edit-option">
            <label>Size</label>
            <div className="size-buttons">
              {['small', 'medium', 'large'].map(size => (
                <button
                  key={size}
                  className={`size-btn ${settings.size === size ? 'active' : ''}`}
                  onClick={() => setSettings({ ...settings, size })}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Color Options */}
          <div className="edit-option">
            <label>Color Theme</label>
            <div className="color-picker">
              {['#4169E1', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6'].map(color => (
                <button
                  key={color}
                  className={`color-btn ${settings.color === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSettings({ ...settings, color })}
                />
              ))}
            </div>
          </div>

          {/* Icon Options */}
          <div className="edit-option">
            <label>Icon</label>
            <div className="icon-grid">
              {Object.entries(iconMap).map(([name, icon]) => (
                <button
                  key={name}
                  className={`icon-btn ${settings.icon === name ? 'active' : ''}`}
                  onClick={() => setSettings({ ...settings, icon: name })}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="edit-dialog-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button 
            className="save-btn"
            onClick={() => {
              onSave(settings);
              onClose();
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const [isBlankWindowOpen, setIsBlankWindowOpen] = useState(false);
  const { widgets, addWidget, removeWidget } = useWidgets() as WidgetContextType;
  const [isLoading, setIsLoading] = useState(true);
  const [layouts, setLayouts] = useState({});
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editSettings, setEditSettings] = useState<{
    size?: string;
    color?: string;
    icon?: string;
  }>({});

  // Add this effect to reset edit settings when edit mode changes
  useEffect(() => {
    if (!editMode) {
      setEditSettings({});
    }
  }, [editMode]);

  // Update the handlers to use the state
  const handleSizeChange = (size: string) => {
    setEditSettings(prev => ({ ...prev, size }));
  };

  const handleColorChange = (color: string) => {
    setEditSettings(prev => ({ ...prev, color }));
  };

  const handleIconChange = (iconName: string) => {
    setEditSettings(prev => ({ ...prev, icon: iconName }));
  };

  const handleSaveChanges = (id: string) => {
    // Here you would typically update the widget in your backend
    // For now, we'll just show a success message
    console.log('Saving changes:', { id, settings: editSettings });
    setEditMode(null);
    setFlippedCardId(null);
    toast.success('Changes saved successfully!');
  };

  const handleRemoveWidget = (id: string) => {
    // Add deleting class to trigger animation
    const widgetElement = document.querySelector(`[data-grid-id="${id}"]`);
    if (widgetElement) {
      widgetElement.classList.add('deleting');
      
      // Wait for animation to complete before removing
      setTimeout(() => {
        removeWidget(id);
        toast.success('Widget deleted successfully!', {
          position: "top-right",
          autoClose: 2000
        });
      }, 500);
    }
  };

  // Default layout configuration with specific dimensions
  const defaultLayout = widgets.map((widget, index) => ({
    i: widget.id,
    x: (index % 3) * 4,
    y: Math.floor(index / 3) * 4,
    w: 4,
    h: 3,
    minW: 3,
    minH: 2,
    maxW: 6,
    maxH: 4
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

  // Add this function to render KPI widgets
  const renderWidget = (widget: Widget | DashboardKPICard) => {
    if ('type' in widget && widget.type === 'kpi') {
      const kpiWidget = widget as DashboardKPICard;
      const isFlipped = flippedCardId === kpiWidget.id;

      const handleContextMenu = (e: React.MouseEvent) => {
        // Only trigger if Ctrl key is pressed
        if (e.ctrlKey) {
          e.preventDefault(); // Prevent default context menu
          setFlippedCardId(isFlipped ? null : kpiWidget.id);
        }
      };

      return (
        <div 
          className="widget-item-wrapper"
          onContextMenu={handleContextMenu}
          data-tooltip={isFlipped ? 'Click anywhere to unflip' : 'Ctrl + Right Click to flip'}
          style={{ 
            cursor: isFlipped ? 'default' : 'pointer',
            pointerEvents: 'all'  // Ensure the wrapper can still receive events
          }}
        >
          <div className={`kpi-card-container ${isFlipped ? 'flipped' : ''}`}>
            <div className="kpi-card-flipper">
              {/* Front of card */}
              <div className="kpi-card front">
                <h3 className="kpi-card-title">
                  {kpiWidget.kpi_name}
                </h3>
                <div className="kpi-card-content">
                  <div className="kpi-value">
                    {kpiWidget.field_value}
                  </div>
                  <div className="kpi-name">
                    {kpiWidget.field_name}
                  </div>
                  <div className="kpi-source">
                    Source {kpiWidget.video_source}
                  </div>
                </div>
              </div>

              {/* Back of card */}
              <div className="kpi-card back">
                <div className="card-options">
                  <button 
                    className="card-option-btn edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditMode(kpiWidget.id);
                    }}
                  >
                    <EditIcon />
                  </button>
                  <button 
                    className="card-option-btn remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveWidget(kpiWidget.id);
                    }}
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Return existing widget rendering for other types
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
      default:
        return null;
    }
  };

  // Update the edit mode state handler
  useEffect(() => {
    if (editMode) {
      const currentWidget = widgets.find(w => w.id === editMode);
      if (currentWidget) {
        // Initialize with default values
        const defaultSettings = {
          size: 'medium',
          color: '#4169E1',
          icon: 'Dashboard'
        };

        // Type guard check
        if (isKPIWidget(currentWidget)) {
          const kpiWidget = currentWidget as DashboardKPICard;
          setEditSettings({
            size: kpiWidget.style_size || defaultSettings.size,
            color: kpiWidget.style_color || defaultSettings.color,
            icon: kpiWidget.style_icon || defaultSettings.icon
          });
        } else {
          setEditSettings(defaultSettings);
        }
      }
    } else {
      setEditSettings({});
    }
  }, [editMode, widgets]);

  return (
    <div className="dashboard-container">
      <ToastContainer />
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        {widgets.length > 0 && (
          <button 
            className="add-kpi-button"
            onClick={() => setIsBlankWindowOpen(true)}
          >
            <AddIcon />
          </button>
        )}
      </div>
      
      <div className="widgets-display">
        {widgets.length > 0 ? (
          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: defaultLayout }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 9, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={60}
            onLayoutChange={(layout, layouts) => setLayouts(layouts)}
            isDraggable={true}
            isResizable={false}
            margin={[16, 16]}
            containerPadding={[16, 16]}
            preventCollision={false}
            compactType={null}
            useCSSTransforms={true}
            style={{ 
              background: 'transparent',
              minHeight: '100vh'
            }}
            autoSize={true}
            verticalCompact={false}
            draggableHandle=".kpi-card.front"
          >
            {widgets.map(widget => (
              <div 
                key={widget.id} 
                className="widget-item"
                data-grid-id={widget.id}
              >
                {renderWidget(widget)}
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

      {isBlankWindowOpen && (
        <BlankWindow 
          setIsBlankWindowOpen={setIsBlankWindowOpen}
          addWidget={addWidget}
        />
      )}

      {editMode && (
        <EditDialog
          isOpen={true}
          onClose={() => setEditMode(null)}
          widget={(() => {
            const widget = widgets.find(w => w.id === editMode);
            if (widget && isKPIWidget(widget)) {
              return widget;
            }
            // If widget is not found or not a KPI widget, close edit mode and return null
            setEditMode(null);
            toast.error('Widget not found or invalid type');
            return null;
          })()}
          onSave={handleSaveChanges}
        />
      )}
    </div>
  );
};

export default DashboardPage;