import React, { useState, useRef, useEffect } from 'react';
import { VehicleStats } from '../../../data/vehicleData';
import { useGraphs, ColorState } from '../../../context/GraphContext';
import { useWidgets } from '../../../context/WidgetContext';
import './GraphModal.css';
import { ChromePicker } from 'react-color';
import {
  ScatterChart, Scatter, ComposedChart, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, Bar, Line, Cell,
  LineChart, BarChart, PieChart, Pie, AreaChart, Area
} from 'recharts';
import { ResponsiveContainer } from 'recharts';
import { API_URL } from '../../../utils/config';

interface GraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedData: VehicleStats[];
  onGraphCreated?: () => void;
}

type GraphType = 'bar' | 'line' | 'pie' | 'area' | 'composed' | 'scatter' | 'bubble' | 'stackedArea' | 'dumbbell';

interface FormattedData {
  label: string;
  Entry: number;
  Exit: number;
  Total: number;
  value: number;
}

interface CollectionData {
  collection: string;
  fieldCounts: {
    [key: string]: number;
  };
}

const formatVehicleData = (vehicle: VehicleStats): FormattedData => {
  const ruleCounts = vehicle.filteredStats?.RuleCounts || {
    Entry: 0,
    Exit: 0,
    Total: 0
  };

  return {
    label: vehicle.vehicleType,
    Entry: ruleCounts.Entry || 0,
    Exit: ruleCounts.Exit || 0,
    Total: vehicle.count || 0,
    value: ruleCounts.Entry || 0 // For pie chart
  };
};

const GraphModal: React.FC<GraphModalProps> = ({ isOpen, onClose, selectedData, onGraphCreated }) => {
  const [selectedGraphType, setSelectedGraphType] = useState<GraphType>('bar');
  const { addGraph } = useGraphs();
  const { addWidget } = useWidgets();
  const [graphTitle, setGraphTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Initialize colors with default values
  const [colors, setColors] = useState<ColorState>({});
  
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

  // Function to generate default colors
  function getDefaultColor(index: number): string {
    const defaultColors = [
      '#6B4DE6', // Primary purple
      '#059669', // Green
      '#dc2626', // Red
      '#2563eb', // Blue
      '#d97706', // Orange
      '#7c3aed', // Violet
      '#db2777', // Pink
      '#0891b2', // Cyan
      '#4f46e5'  // Indigo
    ];
    return defaultColors[index % defaultColors.length];
  }

  // Add this near the top with other useState declarations
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  // Move this useEffect after all the useState declarations but before other code
  useEffect(() => {
    const newColors: ColorState = {};
    selectedFields.forEach((_, index) => {
      newColors[`vehicle-${index}`] = {
        total: getDefaultColor(index * 3),
        in: getDefaultColor(index * 3 + 1),
        out: getDefaultColor(index * 3 + 2)
      };
    });
    setColors(newColors);
  }, [selectedFields]);

  const handleColorChange = (color: { hex: string }, vehicleIndex: number, constraint: 'total' | 'in' | 'out') => {
    setColors(prev => ({
      ...prev,
      [`vehicle-${vehicleIndex}`]: {
        ...prev[`vehicle-${vehicleIndex}`],
        [constraint]: color.hex
      }
    }));
  };

  const graphOptions = [
    { 
      type: 'bar',
      label: 'Bar Chart',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="graph-icon">
          <path d="M4 20h16M4 20V4m0 16l4-4v4m4 0V10m0 10l4-8v8m4 0V6l-4 14" 
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Compare values across categories',
      features: ['Easy to read', 'Shows exact values', 'Good for comparisons'],
      bestFor: 'Comparing quantities between different categories'
    },
    { 
      type: 'line',
      label: 'Line Chart',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="graph-icon">
          <path d="M3 12h4l3-9 4 18 3-9h4M3 20h18" 
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Show trends over time',
      features: ['Shows trends', 'Good for continuous data', 'Displays patterns'],
      bestFor: 'Visualizing trends and patterns over time'
    },
    { 
      type: 'pie',
      label: 'Pie Chart',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="graph-icon">
          <path d="M12 2v10l8.5 5M12 2a10 10 0 1 0 8.5 15L12 12" 
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Show proportions of a whole',
      features: ['Shows parts of a whole', 'Good for percentages', 'Visual distribution'],
      bestFor: 'Displaying parts of a whole as percentages'
    },
    { 
      type: 'area',
      label: 'Area Chart',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="graph-icon">
          <path d="M3 3v18h18M7 14l3-6 4 8 3-4" 
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 14l3-6 4 8 3-4V20H7z" fill="currentColor" fillOpacity="0.2"/>
        </svg>
      ),
      description: 'Visualize cumulative totals',
      features: ['Shows volume over time', 'Good for cumulative data', 'Highlights trends'],
      bestFor: 'Showing accumulated values over time'
    },
    { 
      type: 'composed',
      label: 'Composed Chart',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="graph-icon">
          <path d="M4 20h16M4 20V4m0 16l4-4v4m4 0V10m0 10l4-8v8m4 0V6l-4 14" 
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 12h4l3-9 4 18 3-9h4" 
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4"/>
        </svg>
      ),
      description: 'Combine different chart types',
      features: ['Multiple chart types', 'Complex data visualization', 'Flexible display'],
      bestFor: 'Combining multiple types of data visualization'
    },
    { 
      type: 'scatter',
      label: 'Scatter Plot',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="graph-icon">
          <path d="M3 3v18h18M7 14l2 2m3-7l2 2m2 4l2-2m1-5l2 2" 
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Show data point distribution',
      features: ['Data correlation', 'Pattern detection', 'Distribution view'],
      bestFor: 'Showing relationships between variables'
    },
    { 
      type: 'bubble',
      label: 'Bubble Chart',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="graph-icon">
          <circle cx="8" cy="8" r="3" />
          <circle cx="16" cy="16" r="5" />
          <circle cx="8" cy="16" r="2" />
          <circle cx="16" cy="8" r="4" />
        </svg>
      ),
      description: 'Compare three dimensions',
      features: ['Size comparison', 'Position analysis', 'Multi-dimensional'],
      bestFor: 'Comparing Entry/Exit with total volume'
    },
    { 
      type: 'stackedArea',
      label: 'Stacked Area',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="graph-icon">
          <path d="M3 3v18h18M7 14l3-6 4 8 3-4" 
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 14l3-6 4 8 3-4v8H7z" fill="currentColor" fillOpacity="0.2"/>
          <path d="M7 8l3-4 4 6 3-2v6l-3 4-4-8-3 6z" fill="currentColor" fillOpacity="0.1"/>
        </svg>
      ),
      description: 'Show cumulative trends',
      features: ['Trend analysis', 'Part-to-whole', 'Time series'],
      bestFor: 'Visualizing Entry/Exit accumulation over categories'
    },
    { 
      type: 'dumbbell',
      label: 'Dumbbell Chart',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="graph-icon">
          <circle cx="6" cy="8" r="2" fill="currentColor"/>
          <circle cx="18" cy="8" r="2" fill="currentColor"/>
          <line x1="6" y1="8" x2="18" y2="8" strokeWidth="2"/>
          <circle cx="6" cy="16" r="2" fill="currentColor"/>
          <circle cx="18" cy="16" r="2" fill="currentColor"/>
          <line x1="6" y1="16" x2="18" y2="16" strokeWidth="2"/>
        </svg>
      ),
      description: 'Compare Entry vs Exit',
      features: ['Direct comparison', 'Clear differences', 'Simple visualization'],
      bestFor: 'Comparing Entry and Exit values directly'
    }
  ] as const;

  const generateChartComponent = (type: GraphType) => {
    // Format the data for charts
    const formattedData = selectedFields.map(field => ({
      label: field,
      Entry: availableFields[field] || 0,
      Exit: availableFields[field] || 0,
      Total: availableFields[field] || 0,
      value: availableFields[field] || 0 // For pie chart
    }));

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

    // Only render if we have data
    if (formattedData.length === 0) {
      return (
        <div className="no-data-message" style={{ 
          height: '300px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#666'
        }}>
          Select fields to preview graph
        </div>
      );
    }

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
        color: '#1e293b',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          background: 'rgba(255, 255, 255, 1)'
        }
      },
      inactiveStyle: {
        opacity: 0.5
      }
    };

    // Add custom formatter for legend icons
    const CustomLegendIcon = ({ color }: { color: string }) => (
      <svg width="20" height="20" viewBox="0 0 20 20">
        <rect
          x="2"
          y="2"
          width="16"
          height="16"
          rx="8"
          fill={color}
          style={{
            filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1))'
          }}
        />
        <rect
          x="6"
          y="6"
          width="8"
          height="8"
          rx="4"
          fill="white"
          fillOpacity="0.4"
        />
      </svg>
    );

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
            <BarChart data={formattedData} {...commonProps}>
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
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#E5E7EB" 
                opacity={0.5}
              />
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
              <Legend 
                {...customLegendStyle}
                iconType="circle"
                iconSize={12}
                formatter={(value, entry) => (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CustomLegendIcon color={entry.color || '#000'} />
                    <span>{value}</span>
                  </span>
                )}
                onClick={(data) => {
                  // Optional: Add click handler for toggling visibility
                  console.log('Legend clicked:', data);
                }}
              />
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
            <LineChart data={formattedData} {...commonProps}>
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
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#E5E7EB" 
                opacity={0.5}
              />
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
              <Legend 
                {...customLegendStyle}
                iconType="circle"
                iconSize={12}
                formatter={(value, entry) => (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CustomLegendIcon color={entry.color || '#000'} />
                    <span>{value}</span>
                  </span>
                )}
                onClick={(data) => {
                  // Optional: Add click handler for toggling visibility
                  console.log('Legend clicked:', data);
                }}
              />
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

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart {...commonProps}>
              <defs>
                {formattedData.map((_, index) => (
                  <linearGradient key={`gradient-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors[`vehicle-${index}`]?.total || getDefaultColor(index * 3)} stopOpacity={0.8}/>
                    <stop offset="100%" stopColor={colors[`vehicle-${index}`]?.total || getDefaultColor(index * 3)} stopOpacity={0.4}/>
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={formattedData}
                dataKey="Total"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                label
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {formattedData.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={`url(#pieGradient-${index})`}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }}/>
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={formattedData} {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="Total" 
                fill="#4f46e5" 
                stroke="#4f46e5"
                fillOpacity={0.3}
              />
              <Area 
                type="monotone" 
                dataKey="Entry" 
                fill="#059669" 
                stroke="#059669"
                fillOpacity={0.3}
              />
              <Area 
                type="monotone" 
                dataKey="Exit" 
                fill="#dc2626" 
                stroke="#dc2626"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'composed':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={formattedData} {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="Total" 
                fill="#4f46e5"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
              <Line 
                type="monotone" 
                dataKey="Entry" 
                stroke="#059669"
                strokeWidth={2}
                dot={{ fill: '#ffffff', stroke: '#059669', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="Exit" 
                stroke="#dc2626"
                strokeWidth={2}
                dot={{ fill: '#ffffff', stroke: '#dc2626', strokeWidth: 2, r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="label" 
                type="category"
                tick={{ fill: '#4B5563' }}
                axisLine={{ stroke: '#9CA3AF' }}
              />
              <YAxis 
                dataKey="Total"
                tick={{ fill: '#4B5563' }}
                axisLine={{ stroke: '#9CA3AF' }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }}/>
              <Scatter 
                name="Total" 
                data={formattedData} 
                fill="#4F46E5"
                fillOpacity={0.6}
              >
                {formattedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={colors[`vehicle-${index}`]?.total || getDefaultColor(index * 3)}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'bubble':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="Entry"
                name="Entry"
                tick={{ fill: '#4B5563' }}
                label={{ value: 'Entry Count', position: 'bottom', fill: '#4B5563' }}
              />
              <YAxis 
                dataKey="Exit"
                name="Exit"
                tick={{ fill: '#4B5563' }}
                label={{ value: 'Exit Count', angle: -90, position: 'left', fill: '#4B5563' }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }}/>
              <Scatter 
                name="Vehicles" 
                data={formattedData}
                fill="#4F46E5"
              >
                {formattedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={colors[`vehicle-${index}`]?.total || getDefaultColor(index * 3)}
                  >
                    <circle r={Math.sqrt(entry.Total) * 2} />
                  </Cell>
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'stackedArea':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={formattedData} {...commonProps}>
              <defs>
                <linearGradient id="stackedEntry" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="stackedExit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="label"
                tick={{ fill: '#4B5563' }}
              />
              <YAxis 
                tick={{ fill: '#4B5563' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }}/>
              <Area
                type="monotone"
                dataKey="Entry"
                stackId="1"
                stroke="#10B981"
                fill="url(#stackedEntry)"
                animationDuration={1500}
                animationEasing="ease-out"
              />
              <Area
                type="monotone"
                dataKey="Exit"
                stackId="1"
                stroke="#EF4444"
                fill="url(#stackedExit)"
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'dumbbell':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={formattedData} {...commonProps}>
              <defs>
                <linearGradient id="dumbbellGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10B981"/>
                  <stop offset="100%" stopColor="#EF4444"/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="label" 
                tick={{ fill: '#4B5563' }}
                axisLine={{ stroke: '#9CA3AF' }}
              />
              <YAxis 
                tick={{ fill: '#4B5563' }}
                axisLine={{ stroke: '#9CA3AF' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }}/>
              {formattedData.map((entry, index) => (
                <Line
                  key={`connector-${index}`}
                  data={[
                    { ...entry, value: entry.Entry },
                    { ...entry, value: entry.Exit }
                  ]}
                  dataKey="value"
                  stroke="url(#dumbbellGradient)"
                  strokeWidth={2}
                  dot={false}
                />
              ))}
              <Scatter
                name="Entry"
                data={formattedData}
                dataKey="Entry"
                fill="#10B981"
                shape="circle"
              >
                {formattedData.map((_, index) => (
                  <Cell 
                    key={`entry-${index}`}
                    fill="#10B981"
                    stroke="#ffffff"
                    strokeWidth={2}
                    r={6}
                  />
                ))}
              </Scatter>
              <Scatter
                name="Exit"
                data={formattedData}
                dataKey="Exit"
                fill="#EF4444"
                shape="circle"
              >
                {formattedData.map((_, index) => (
                  <Cell 
                    key={`exit-${index}`}
                    fill="#EF4444"
                    stroke="#ffffff"
                    strokeWidth={2}
                    r={6}
                  />
                ))}
              </Scatter>
            </ComposedChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="unsupported-graph">
            <p>Graph type not supported: {type}</p>
          </div>
        );
    }
  };

  const handleGraphTypeSelect = (type: GraphType) => {
    setSelectedGraphType(type);
  };

  const [availableCollections, setAvailableCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [availableVideoSources, setAvailableVideoSources] = useState<string[]>([]);
  const [selectedVideoSource, setSelectedVideoSource] = useState<string>('1');
  const [availableFields, setAvailableFields] = useState<{[key: string]: number}>({});

  const fetchCollections = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/allCollections`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableCollections(data.collections);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const fetchVideoSources = async (collection: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/Collection/videoSources?collection=${collection}`,
        { credentials: 'include' }
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableVideoSources(data.videoSources.map((vs: any) => vs.source));
      }
    } catch (error) {
      console.error('Error fetching video sources:', error);
    }
  };

  const fetchFields = async (collection: string, videoSource: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/Collection/filtered/count?collection=${collection}&VideoSource=${videoSource}`,
        { credentials: 'include' }
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableFields(data.fieldCounts);
      }
    } catch (error) {
      console.error('Error fetching fields:', error);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleCreateGraph = () => {
    if (selectedFields.length === 0) {
      console.warn('Please select at least one field');
      return;
    }

    try {
      // Format the data for the chart
      const formattedData = selectedFields.map(field => ({
        label: field,
        Entry: availableFields[field] || 0,
        Exit: availableFields[field] || 0,
        Total: availableFields[field] || 0,
        value: availableFields[field] || 0
      }));

      // Create unique ID for the widget
      const graphId = `graph-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create the widget
      const newWidget = {
        id: graphId,
        type: 'graph' as const,
        title: graphTitle || 'Vehicle Statistics',
        content: '', // We don't need content as we're using chartProps
        backgroundColor: selectedColor,
        chartProps: {
          type: selectedGraphType,
          data: formattedData,
          colors: colors
        }
      };

      // Add the widget using the context
      addWidget(newWidget);
      
      // Show success message
      console.log('Graph created successfully');
      
      // Close modal and notify parent
      onGraphCreated?.();
      onClose();
      
    } catch (error) {
      console.error('Error creating graph widget:', error);
    }
  };

  const handleCollectionSelect = (collection: string) => {
    setSelectedCollection(collection);
    fetchVideoSources(collection);
    setSelectedFields([]); // Reset selected fields
    setSelectedVideoSource(''); // Reset video source
  };

  const handleVideoSourceSelect = (source: string) => {
    setSelectedVideoSource(source);
    fetchFields(selectedCollection, source);
    setSelectedFields([]); // Reset selected fields
  };

  const colorOptions = [
    { 
      mainColor: '#FFB5B5', // Light Red
      shades: ['#FFD1D1', '#FFE3E3', '#FFF0F0']
    },
    { 
      mainColor: '#B5E8FF', // Light Blue
      shades: ['#D1F0FF', '#E3F6FF', '#F0FAFF']
    },
    { 
      mainColor: '#B5FFD9', // Light Green
      shades: ['#D1FFE7', '#E3FFF0', '#F0FFF6']
    },
    { 
      mainColor: '#FFE5B5', // Light Orange
      shades: ['#FFEED1', '#FFF4E3', '#FFF8F0']
    },
    { 
      mainColor: '#E0B5FF', // Light Purple
      shades: ['#EBD1FF', '#F2E3FF', '#F7F0FF']
    }
  ];

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    
    // Add active class to trigger rotation animation
    const wheel = document.querySelector('.color-wheel');
    const centerCircle = document.querySelector('.center-circle');
    
    if (wheel && centerCircle) {
      wheel.classList.add('active');
      centerCircle.classList.add('active');
      
      setTimeout(() => {
        wheel.classList.remove('active');
        centerCircle.classList.remove('active');
      }, 1000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="graph-modal-overlay">
      <div className="graph-modal">
        <div className="graph-modal-header">
          <h2>Create Graph</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="graph-modal-content">
          <input
            type="text"
            value={graphTitle}
            onChange={(e) => setGraphTitle(e.target.value)}
            placeholder="Enter widget title"
            className="graph-title-input"
          />

          <div className="color-selection-section">
            <h3>Background Color</h3>
            <div className="color-cards">
              {colorOptions.map((card) => (
                <div key={card.mainColor} className="color-card">
                  <div
                    className="main-color"
                    style={{ background: card.mainColor }}
                    onClick={() => setSelectedColor(card.mainColor)}
                  />
                  <div className="color-shades">
                    {card.shades.map((shade, index) => (
                      <div
                        key={index}
                        className="shade"
                        style={{ background: shade }}
                        onClick={() => setSelectedColor(shade)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="config-section field-config">
            <div className="section-header">
              <h3>Select Data</h3>
            </div>

            <div className="data-selection-flow">
              {/* Collection Selection */}
              <div className="selection-group">
                <h4>Select Collection</h4>
                <div className="collection-buttons">
                  {availableCollections.map(collection => (
                    <button
                      key={collection}
                      className={`selection-button ${selectedCollection === collection ? 'selected' : ''}`}
                      onClick={() => handleCollectionSelect(collection)}
                    >
                      {collection}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video Source Selection */}
              {selectedCollection && (
                <div className="selection-group">
                  <h4>Select Video Source</h4>
                  <div className="source-buttons">
                    {availableVideoSources.map(source => (
                      <button
                        key={source}
                        className={`source-button ${selectedVideoSource === source ? 'selected' : ''}`}
                        onClick={() => handleVideoSourceSelect(source)}
                      >
                        Source {source}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Field Selection */}
              {selectedCollection && selectedVideoSource && (
                <div className="selection-group">
                  <h4>Select Fields</h4>
                  <div className="fields-grid">
                    {Object.entries(availableFields).map(([field, count]) => (
                      <div
                        key={field}
                        className={`field-item ${selectedFields.includes(field) ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedFields(prev => {
                            const isSelected = prev.includes(field);
                            if (isSelected) {
                              return prev.filter(f => f !== field);
                            } else {
                              return [...prev, field];
                            }
                          });
                        }}
                      >
                        <div className="field-name">{field}</div>
                        <div className="field-count">{count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="config-section">
            <h3>Select Graph Type</h3>
            <div className="graph-options">
              {graphOptions.map(option => (
                <div
                  key={option.type}
                  className={`graph-option ${selectedGraphType === option.type ? 'selected' : ''}`}
                  onClick={() => handleGraphTypeSelect(option.type)}
                >
                  <div className="graph-option-icon">
                    {option.icon}
                  </div>
                  <div className="graph-option-content">
                    <h4>{option.label}</h4>
                    <p className="graph-description">{option.description}</p>
                    <div className="graph-features">
                      {option.features.map((feature, index) => (
                        <span key={index} className="feature-tag">{feature}</span>
                      ))}
                    </div>
                    <div className="best-for">
                      <span className="best-for-label">Best for:</span>
                      <span className="best-for-text">{option.bestFor}</span>
                    </div>
                  </div>
                  {selectedGraphType === option.type && (
                    <div className="selected-indicator">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Color Options Section */}
          {selectedFields.length > 0 && (
          <div className="color-options">
            <h3>Color Settings</h3>
            <div className="color-pickers">
                {selectedFields.map((field, index) => (
                  <div key={`field-${index}`} className="vehicle-colors">
                    <h4>{field}</h4>
                  <div className="constraint-colors">
                    <div className="color-picker">
                      <label>Total</label>
                      <div 
                        className="color-swatch"
                        style={{ backgroundColor: colors[`vehicle-${index}`]?.total || getDefaultColor(index * 3) }}
                        onClick={() => setActiveColorPicker(`${index}-total`)}
                      />
                        {activeColorPicker === `${index}-total` && (
                        <div className="color-popover">
                          <div 
                            className="color-cover"
                            onClick={() => setActiveColorPicker(null)}
                          />
                          <ChromePicker
                              color={colors[`vehicle-${index}`]?.total || getDefaultColor(index * 3)}
                              onChange={(color) => handleColorChange(color, index, 'total')}
                          />
                        </div>
                      )}
                    </div>

                    <div className="color-picker">
                      <label>In</label>
                      <div 
                        className="color-swatch"
                        style={{ backgroundColor: colors[`vehicle-${index}`]?.in || getDefaultColor(index * 3 + 1) }}
                        onClick={() => setActiveColorPicker(`${index}-in`)}
                      />
                        {activeColorPicker === `${index}-in` && (
                        <div className="color-popover">
                          <div 
                            className="color-cover"
                            onClick={() => setActiveColorPicker(null)}
                          />
                          <ChromePicker
                              color={colors[`vehicle-${index}`]?.in || getDefaultColor(index * 3 + 1)}
                              onChange={(color) => handleColorChange(color, index, 'in')}
                          />
                        </div>
                      )}
                    </div>

                    <div className="color-picker">
                      <label>Out</label>
                      <div 
                        className="color-swatch"
                        style={{ backgroundColor: colors[`vehicle-${index}`]?.out || getDefaultColor(index * 3 + 2) }}
                        onClick={() => setActiveColorPicker(`${index}-out`)}
                      />
                        {activeColorPicker === `${index}-out` && (
                        <div className="color-popover">
                          <div 
                            className="color-cover"
                            onClick={() => setActiveColorPicker(null)}
                          />
                          <ChromePicker
                              color={colors[`vehicle-${index}`]?.out || getDefaultColor(index * 3 + 2)}
                              onChange={(color) => handleColorChange(color, index, 'out')}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          <div className="graph-preview">
            <h3>Preview</h3>
            <div 
              ref={previewRef}
              style={{ width: '400px', height: '300px', margin: '0 auto' }}
            >
              {generateChartComponent(selectedGraphType)}
            </div>
          </div>
        </div>

        <div className="graph-modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="create-button"
            onClick={handleCreateGraph}
            disabled={!selectedFields.length}
          >
            Create Graph
          </button>
        </div>
      </div>
    </div>
  );
};

export default GraphModal; 