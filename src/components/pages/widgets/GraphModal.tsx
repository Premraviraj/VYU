import React, { useState, useRef, useEffect } from 'react';
import { VehicleStats } from '../../../data/vehicleData';
import { useGraphs } from '../../../context/GraphContext';
import { useWidgets } from '../../../context/WidgetContext';
import './GraphModal.css';
import { ChromePicker } from 'react-color';
import {
  ScatterChart, Scatter, ComposedChart, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, Bar, Line, Cell,
  LineChart, BarChart, PieChart, Pie, RadialBarChart, RadialBar
} from 'recharts';
import ColorLensIcon from '@mui/icons-material/ColorLens';

interface GraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedData: VehicleStats[];
  onGraphCreated?: () => void;
}

type GraphType = 'scatter' | 'composed' | 'horizontalBar' | 'jointLineScatter' | 'simpleLine' | 'verticalBar' | 'pie' | 'radialBar';

interface ColorState {
  [key: string]: {
    total: string;
    in: string;
    out: string;
  };
}

const GraphModal: React.FC<GraphModalProps> = ({ isOpen, onClose, selectedData, onGraphCreated }) => {
  const [selectedGraphType, setSelectedGraphType] = useState<GraphType>('scatter');
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
      type: 'scatter',
      label: 'Scatter Plot',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="graph-icon">
          <path d="M3 3v18h18M7 14l3-6 4 8 3-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Show trends over time'
    },
    { 
      type: 'composed',
      label: 'Composed Chart',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="graph-icon">
          <path d="M4 20h16M4 20V4m0 16l4-4v4m4 0V10m0 10l4-8v8m4 0V6l-4 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Compare values across categories'
    },
    { 
      type: 'horizontalBar',
      label: 'Horizontal Bar Chart',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="graph-icon">
          <path d="M12 2v10l8.5 5M12 2a10 10 0 1 0 8.5 15L12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Show proportions of a whole'
    },
    { 
      type: 'jointLineScatter',
      label: 'Joint Line Scatter',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="graph-icon">
          <path d="M3 12h4l3-9 4 18 3-9h4M3 20h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 12h4l3-9 4 18 3-9h4V20H3z" fill="currentColor" fillOpacity="0.2"/>
        </svg>
      ),
      description: 'Visualize cumulative totals'
    },
    { 
      type: 'simpleLine',
      label: 'Simple Line',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="graph-icon">
          <path d="M3 3v18h18M7 14l3-6 4 8 3-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Basic line chart'
    },
    { 
      type: 'verticalBar',
      label: 'Vertical Bar',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="graph-icon">
          <path d="M4 20h16M4 20V4m0 16l4-4v4m4 0V10m0 10l4-8v8m4 0V6l-4 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Vertical bar comparison'
    },
    { 
      type: 'pie',
      label: 'Pie Chart',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="graph-icon">
          <path d="M12 2v10l8.5 5M12 2a10 10 0 1 0 8.5 15L12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Show proportions'
    },
    { 
      type: 'radialBar',
      label: 'Radial Bar',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="graph-icon">
          <circle cx="12" cy="12" r="10" strokeWidth="2"/>
          <path d="M12 2a10 10 0 0 1 10 10" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      description: 'Circular progress bars'
    },
  ] as const;

  const generateChartComponent = (type: GraphType) => {
    const timePoints = ['morning', 'afternoon', 'evening', 'night'];
    const formattedData = timePoints.map(time => ({
      name: time,
      ...selectedData.reduce((acc, vehicle) => ({
        ...acc,
        [vehicle.vehicleType]: vehicle.details[time].in,
        [`${vehicle.vehicleType}Out`]: vehicle.details[time].out
      }), {})
    }));

    const containerStyle = {
      width: '100%',
      height: '300px',
      maxWidth: '600px',
      margin: '0 auto'
    };

    switch (type) {
      case 'scatter':
        return (
          <div style={containerStyle}>
            <ScatterChart width={500} height={300}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              {selectedData.map((vehicle, index) => (
                <Scatter
                  key={vehicle.vehicleType}
                  name={vehicle.vehicleType}
                  data={formattedData.map(d => ({
                    x: d.name,
                    y: d[vehicle.vehicleType],
                    z: d[`${vehicle.vehicleType}Out`]
                  }))}
                  fill={colors[`vehicle-${index}`].total}
                />
              ))}
            </ScatterChart>
          </div>
        );

      case 'composed':
        return (
          <div style={containerStyle}>
            <ComposedChart width={500} height={300} data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {selectedData.map((vehicle, index) => (
                <React.Fragment key={vehicle.vehicleType}>
                  <Bar
                    dataKey={vehicle.vehicleType}
                    fill={colors[`vehicle-${index}`].total}
                    opacity={0.8}
                  />
                  <Line
                    type="monotone"
                    dataKey={`${vehicle.vehicleType}Out`}
                    stroke={colors[`vehicle-${index}`].out}
                    strokeWidth={2}
                    dot={{ fill: colors[`vehicle-${index}`].out }}
                  />
                </React.Fragment>
              ))}
            </ComposedChart>
          </div>
        );

      case 'horizontalBar':
        return (
          <div style={containerStyle}>
            <ComposedChart
              layout="vertical"
              width={500}
              height={300}
              data={formattedData}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Legend />
              {selectedData.map((vehicle, index) => (
                <Bar
                  key={vehicle.vehicleType}
                  dataKey={vehicle.vehicleType}
                  fill={colors[`vehicle-${index}`].total}
                  barSize={20}
                >
                  {formattedData.map((entry, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={colors[`vehicle-${index}`].total}
                      fillOpacity={0.8 - (i * 0.15)}
                    />
                  ))}
                </Bar>
              ))}
            </ComposedChart>
          </div>
        );

      case 'jointLineScatter':
        return (
          <div style={containerStyle}>
            <ComposedChart width={500} height={300} data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {selectedData.map((vehicle, index) => (
                <React.Fragment key={vehicle.vehicleType}>
                  <Line
                    type="monotone"
                    dataKey={vehicle.vehicleType}
                    stroke={colors[`vehicle-${index}`].total}
                    strokeWidth={2}
                  />
                  <Scatter
                    dataKey={vehicle.vehicleType}
                    fill={colors[`vehicle-${index}`].total}
                    name={`${vehicle.vehicleType} Points`}
                  />
                </React.Fragment>
              ))}
            </ComposedChart>
          </div>
        );

      case 'simpleLine':
        return (
          <div style={containerStyle}>
            <LineChart width={500} height={300} data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {selectedData.map((vehicle, index) => (
                <Line
                  key={vehicle.vehicleType}
                  type="monotone"
                  dataKey={vehicle.vehicleType}
                  stroke={colors[`vehicle-${index}`].total}
                  strokeWidth={2}
                  dot={{ fill: colors[`vehicle-${index}`].total }}
                />
              ))}
            </LineChart>
          </div>
        );

      case 'verticalBar':
        return (
          <div style={containerStyle}>
            <BarChart width={500} height={300} data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {selectedData.map((vehicle, index) => (
                <Bar
                  key={vehicle.vehicleType}
                  dataKey={vehicle.vehicleType}
                  fill={colors[`vehicle-${index}`].total}
                />
              ))}
            </BarChart>
          </div>
        );

      case 'pie':
        return (
          <div style={containerStyle}>
            <PieChart width={500} height={300}>
              <Pie
                data={selectedData}
                dataKey="count"
                nameKey="vehicleType"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {selectedData.map((entry, index) => (
                  <Cell 
                    key={entry.vehicleType} 
                    fill={colors[`vehicle-${index}`].total}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        );

      case 'radialBar':
        return (
          <div style={containerStyle}>
            <RadialBarChart 
              width={500} 
              height={300} 
              innerRadius="10%" 
              outerRadius="80%" 
              data={selectedData.map((vehicle, index) => ({
                name: vehicle.vehicleType,
                value: vehicle.count,
                fill: colors[`vehicle-${index}`].total
              }))}
              startAngle={0}
              endAngle={360}
            >
              <RadialBar
                angleAxisId={0}
                dataKey="value"
                background
                cornerRadius={10}
                label={{
                  position: 'insideStart',
                  fill: '#666',
                }}
              />
              <Legend 
                iconSize={10}
                width={120}
                height={140}
                layout="vertical"
                verticalAlign="middle"
                align="right"
              />
              <Tooltip />
            </RadialBarChart>
          </div>
        );

      default:
        return null;
    }
  };

  const handleGraphTypeSelect = (type: GraphType) => {
    setSelectedGraphType(type);
  };

  const handleCreateGraph = () => {
    if (previewRef.current) {
      const chartComponent = generateChartComponent(selectedGraphType);
      if (chartComponent) {
        const wrappedSvg = `
          <div style="
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: ${selectedColor};
            padding: 1rem;
          ">
            ${previewRef.current.innerHTML}
          </div>
        `;

        const newWidget = {
          type: 'graph' as const,
          title: graphTitle,
          content: wrappedSvg,
          backgroundColor: selectedColor
        };

        addWidget(newWidget);
        onClose();
        onGraphCreated?.();
      }
    }
  };

  const colorCards = [
    { 
      id: 1, 
      mainColor: '#FFB5B5', // Pastel Red
      shades: ['#FFD1D1', '#FFE3E3', '#FFF0F0', '#FFF5F5']
    },
    { 
      id: 2, 
      mainColor: '#B5E8FF', // Pastel Blue
      shades: ['#D1F0FF', '#E3F6FF', '#F0FAFF', '#F5FCFF']
    },
    { 
      id: 3, 
      mainColor: '#B5FFD9', // Pastel Green
      shades: ['#D1FFE7', '#E3FFF0', '#F0FFF6', '#F5FFF9']
    },
    { 
      id: 4, 
      mainColor: '#FFE5B5', // Pastel Orange
      shades: ['#FFEED1', '#FFF4E3', '#FFF8F0', '#FFFBF5']
    },
    { 
      id: 5, 
      mainColor: '#E0B5FF', // Pastel Purple
      shades: ['#EBD1FF', '#F2E3FF', '#F7F0FF', '#FBF5FF']
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
              {colorCards.map(card => (
                <div 
                  key={card.id}
                  className={`color-card ${selectedColor === card.mainColor ? 'selected' : ''}`}
                  onClick={() => setSelectedColor(card.mainColor)}
                >
                  <div className="color-main" style={{ backgroundColor: card.mainColor }} />
                  <div className="color-shades">
                    {card.shades.map((shade, index) => (
                      <div 
                        key={index}
                        className="color-shade"
                        style={{ backgroundColor: shade }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="graph-options">
            {graphOptions.map(({ type, label, icon, description }) => (
              <div
                key={type}
                className={`graph-option ${selectedGraphType === type ? 'selected' : ''}`}
                onClick={() => handleGraphTypeSelect(type)}
              >
                <span className="graph-icon">{icon}</span>
                <span className="graph-label">{label}</span>
                <span className="graph-description">{description}</span>
              </div>
            ))}
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