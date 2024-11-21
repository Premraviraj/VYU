import React, { useState, useRef, useEffect } from 'react';
import { VehicleStats } from '../../../data/vehicleData';
import { useGraphs, Graph, ColorState } from '../../../context/GraphContext';
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

type GraphType = 'bar' | 'line' | 'pie' | 'area' | 'composed';

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
  const [colors, setColors] = useState<ColorState>(() => {
    const initialColors: ColorState = {};
    selectedData.forEach((_, index) => {
      initialColors[`vehicle-${index}`] = {
        total: getDefaultColor(index * 3),
        in: getDefaultColor(index * 3 + 1),
        out: getDefaultColor(index * 3 + 2)
      };
    });
    return initialColors;
  });
  
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

  // Update colors when selectedData changes
  useEffect(() => {
    const newColors: ColorState = {};
    selectedData.forEach((_, index) => {
      newColors[`vehicle-${index}`] = {
        total: getDefaultColor(index * 3),
        in: getDefaultColor(index * 3 + 1),
        out: getDefaultColor(index * 3 + 2)
      };
    });
    setColors(newColors);
  }, [selectedData]);

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
    }
  ] as const;

  const generateChartComponent = (type: GraphType) => {
    const formattedData = selectedData.map(formatVehicleData);

    const commonProps = {
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
      style: {
        background: 'linear-gradient(165deg, rgba(255, 255, 255, 0.95), rgba(252, 253, 255, 0.9))',
        borderRadius: '12px',
      }
    };

    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formattedData} {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="Entry" 
                fill="#059669"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
                animationDuration={1500}
              />
              <Bar 
                dataKey="Exit" 
                fill="#dc2626"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
                animationDuration={1500}
              />
              <Bar 
                dataKey="Total" 
                fill="#4f46e5"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formattedData} {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Total" 
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ fill: '#ffffff', stroke: '#4f46e5', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="Entry" 
                stroke="#059669"
                strokeWidth={2}
                dot={{ fill: '#ffffff', stroke: '#059669', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="Exit" 
                stroke="#dc2626"
                strokeWidth={2}
                dot={{ fill: '#ffffff', stroke: '#dc2626', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart {...commonProps}>
              <Pie
                data={formattedData}
                dataKey="Total"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {formattedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={colors[`vehicle-${index}`]?.total || '#4f46e5'}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
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
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

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

    const selectedData = selectedFields.map(field => ({
      name: field,
      value: availableFields[field],
      filteredStats: {
        VideoSource: selectedVideoSource,
        RuleCounts: {
          Entry: availableFields[field],
          Exit: availableFields[field],
          Total: availableFields[field]
        }
      }
    }));

    // Create the graph with selected data
    const graphId = `graph-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const chartComponent = generateChartComponent(selectedGraphType);
    
    if (chartComponent) {
      const widgetContent = `
        <div class="graph-widget" style="width: 100%; height: 100%;">
          ${previewRef.current?.innerHTML}
        </div>
      `;

      const newWidget = {
        id: graphId,
        type: 'graph' as const,
        title: graphTitle || 'Vehicle Statistics',
        content: widgetContent,
        backgroundColor: selectedColor,
        data: {
          type: selectedGraphType,
          selectedData: selectedData
        }
      };

      addWidget(newWidget);
      onGraphCreated?.();
      onClose();
    }
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
                      onClick={() => {
                        setSelectedCollection(collection);
                        fetchVideoSources(collection);
                        setSelectedFields([]); // Reset selected fields
                      }}
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
                        onClick={() => {
                          setSelectedVideoSource(source);
                          fetchFields(selectedCollection, source);
                          setSelectedFields([]); // Reset selected fields
                        }}
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

          <div className="color-options">
            <h3>Color Settings</h3>
            <div className="color-pickers">
              {selectedData.map((data, vehicleIndex) => (
                <div key={`vehicle-${vehicleIndex}`} className="vehicle-colors">
                  <h4>{data.vehicleType}</h4>
                  <div className="constraint-colors">
                    <div className="color-picker">
                      <label>Total</label>
                      <div 
                        className="color-swatch"
                        style={{ backgroundColor: colors[`vehicle-${vehicleIndex}`].total }}
                        onClick={() => setActiveColorPicker(`${vehicleIndex}-total`)}
                      />
                      {activeColorPicker === `${vehicleIndex}-total` && (
                        <div className="color-popover">
                          <div 
                            className="color-cover"
                            onClick={() => setActiveColorPicker(null)}
                          />
                          <ChromePicker
                            color={colors[`vehicle-${vehicleIndex}`].total}
                            onChange={(color) => handleColorChange(color, vehicleIndex, 'total')}
                          />
                        </div>
                      )}
                    </div>

                    <div className="color-picker">
                      <label>In</label>
                      <div 
                        className="color-swatch"
                        style={{ backgroundColor: colors[`vehicle-${vehicleIndex}`].in }}
                        onClick={() => setActiveColorPicker(`${vehicleIndex}-in`)}
                      />
                      {activeColorPicker === `${vehicleIndex}-in` && (
                        <div className="color-popover">
                          <div 
                            className="color-cover"
                            onClick={() => setActiveColorPicker(null)}
                          />
                          <ChromePicker
                            color={colors[`vehicle-${vehicleIndex}`].in}
                            onChange={(color) => handleColorChange(color, vehicleIndex, 'in')}
                          />
                        </div>
                      )}
                    </div>

                    <div className="color-picker">
                      <label>Out</label>
                      <div 
                        className="color-swatch"
                        style={{ backgroundColor: colors[`vehicle-${vehicleIndex}`].out }}
                        onClick={() => setActiveColorPicker(`${vehicleIndex}-out`)}
                      />
                      {activeColorPicker === `${vehicleIndex}-out` && (
                        <div className="color-popover">
                          <div 
                            className="color-cover"
                            onClick={() => setActiveColorPicker(null)}
                          />
                          <ChromePicker
                            color={colors[`vehicle-${vehicleIndex}`].out}
                            onChange={(color) => handleColorChange(color, vehicleIndex, 'out')}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
            disabled={!selectedGraphType || !graphTitle.trim()}
          >
            Create Graph
          </button>
        </div>
      </div>
    </div>
  );
};

export default GraphModal; 