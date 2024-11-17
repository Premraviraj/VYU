import React, { useState, useEffect } from 'react';
import { VehicleStats } from '../../../data/vehicleData';
import Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
import HighchartsReact from 'highcharts-react-official';
import { useGraphs } from '../../../context/GraphContext';
import './GraphModal.css';
import { ChromePicker } from 'react-color';
import { useWidgets } from '../../../context/WidgetContext';

// Initialize Highcharts modules
HighchartsMore(Highcharts);

interface GraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedData: VehicleStats[];
  onGraphCreated?: () => void;
}

type GraphType = 'line' | 'bar' | 'pie' | 'area' | 'spline' | 'butterfly' | 'nightingale' | 'waterfall' | 'radar';

interface ColorState {
  [key: string]: {
    total: string;
    in: string;
    out: string;
  };
}

const GraphModal: React.FC<GraphModalProps> = ({ isOpen, onClose, selectedData, onGraphCreated }) => {
  const [selectedGraphType, setSelectedGraphType] = useState<GraphType>('line');
  const [chartOptions, setChartOptions] = useState<Highcharts.Options | null>(null);
  const { addGraph } = useGraphs();
  const { addWidget } = useWidgets();
  const [graphTitle, setGraphTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  
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

    if (chartOptions) {
      const updatedOptions = generateChartOptions(selectedGraphType);
      setChartOptions(updatedOptions);
    }
  };

  const graphOptions = [
    { 
      type: 'line',
      label: 'Line Graph',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="graph-icon">
          <path d="M3 12h4l3-9 4 18 3-9h4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Show trends over time'
    },
    { 
      type: 'bar',
      label: 'Bar Chart',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="graph-icon">
          <path d="M4 20h16M4 20V4m0 16l4-4v4m4 0V10m0 10l4-8v8m4 0V6l-4 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Compare values across categories'
    },
    { 
      type: 'pie',
      label: 'Pie Chart',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="graph-icon">
          <path d="M12 2v10l8.5 5M12 2a10 10 0 1 0 8.5 15L12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Show proportions of a whole'
    },
    { 
      type: 'area',
      label: 'Area Chart',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="graph-icon">
          <path d="M3 12h4l3-9 4 18 3-9h4M3 20h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 12h4l3-9 4 18 3-9h4V20H3z" fill="currentColor" fillOpacity="0.2"/>
        </svg>
      ),
      description: 'Visualize cumulative totals'
    },
    { 
      type: 'spline',
      label: 'Spline Chart',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="graph-icon">
          <path d="M3 12c4-6 8 6 12 0s4-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Smooth curved line chart'
    },
    { 
      type: 'butterfly',
      label: 'Butterfly Chart',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="graph-icon">
          <path d="M12 3v18M3 12h18M7 8h10M7 16h10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 8L3 12l4 4M17 8l4 4-4 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Compare positive/negative values'
    },
    { 
      type: 'nightingale',
      label: 'Nightingale',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="graph-icon">
          <circle cx="12" cy="12" r="10" strokeWidth="2"/>
          <path d="M12 2l4 10-4 10-4-10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12h20M12 2v20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Polar area diagram'
    },
    { 
      type: 'waterfall',
      label: 'Waterfall',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="graph-icon">
          <path d="M3 3v18h18M7 16v-4m4 4V8m4 8v-6m4 6v-3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 12h4m4 0h4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 2"/>
        </svg>
      ),
      description: 'Show running total'
    },
    { 
      type: 'radar',
      label: 'Radar Chart',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="graph-icon">
          <path d="M12 2l8.5 5v10L12 22l-8.5-5V7L12 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 2v20M3.5 7l17 10M3.5 17l17-10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      description: 'Compare multiple variables'
    },
  ] as const;

  const generateChartOptions = (type: GraphType): Highcharts.Options => {
    const timePoints = ['morning', 'afternoon', 'evening', 'night'];
    
    // Convert color objects to array of strings
    const getSeriesColors = () => {
      return Object.values(colors).map(colorSet => [
        colorSet.total,
        colorSet.in,
        colorSet.out
      ]).flat();
    };

    const colorSettings = {
      colors: getSeriesColors(),
      plotOptions: {
        series: {
          colorByPoint: false as const,
          animation: false as const
        } as Highcharts.PlotSeriesOptions
      }
    };

    const getColor = (index: number, type: 'total' | 'in' | 'out'): string => {
      const vehicleKey = `vehicle-${Math.floor(index / 3)}`;
      return colors[vehicleKey]?.[type] || getDefaultColor(index);
    };

    switch (type) {
      case 'line':
        return {
          chart: {
            type: 'line',
            backgroundColor: 'transparent'
          },
          title: {
            text: 'Time Distribution'
          },
          xAxis: {
            categories: timePoints
          },
          yAxis: {
            title: {
              text: 'Count'
            }
          },
          plotOptions: colorSettings.plotOptions,
          series: selectedData.map((vehicle, index) => ({
            name: vehicle.vehicleType,
            type: 'line' as const,
            color: getColor(index, 'total'),
            data: [
              vehicle.details.morning.in,
              vehicle.details.afternoon.in,
              vehicle.details.evening.in,
              vehicle.details.night.in
            ]
          })) as any
        };

      case 'pie':
        return {
          chart: {
            type: 'pie',
            backgroundColor: 'transparent'
          },
          title: {
            text: 'Vehicle Distribution'
          },
          plotOptions: {
            pie: {
              colors: getSeriesColors()
            }
          },
          series: [{
            name: 'Total Count',
            type: 'pie',
            data: selectedData.map((d, index) => ({
              name: d.vehicleType,
              y: d.count,
              color: getColor(index, 'total')
            }))
          }] as any
        };

      case 'waterfall':
        return {
          chart: {
            type: 'waterfall',
            backgroundColor: 'transparent'
          },
          title: {
            text: 'Vehicle Flow Analysis'
          },
          xAxis: {
            categories: ['Initial', ...timePoints, 'Total']
          },
          yAxis: {
            title: {
              text: 'Count'
            }
          },
          plotOptions: {
            waterfall: {
              color: getColor(0, 'in'),
              negativeColor: getColor(0, 'out'),
              borderColor: '#374151'
            }
          },
          series: [{
            name: 'Flow',
            type: 'waterfall',
            data: selectedData.map(vehicle => [
              { name: 'Initial', y: 0 },
              { name: 'Morning', y: vehicle.details.morning.in - vehicle.details.morning.out },
              { name: 'Afternoon', y: vehicle.details.afternoon.in - vehicle.details.afternoon.out },
              { name: 'Evening', y: vehicle.details.evening.in - vehicle.details.evening.out },
              { name: 'Night', y: vehicle.details.night.in - vehicle.details.night.out },
              {
                name: 'Total',
                isSum: true,
                color: getColor(0, 'total')
              }
            ])[0]
          }] as any
        };

      case 'bar':
        return {
          chart: {
            type: 'bar',
            backgroundColor: 'transparent'
          },
          title: {
            text: 'Vehicle Statistics'
          },
          xAxis: {
            categories: selectedData.map(d => d.vehicleType)
          },
          yAxis: {
            title: {
              text: 'Count'
            }
          },
          series: [{
            name: 'Total Count',
            type: 'bar',
            data: selectedData.map(d => d.count),
            color: colors[`vehicle-0`].total
          }, {
            name: 'Vehicles In',
            type: 'bar',
            data: selectedData.map(d => d.in),
            color: colors[`vehicle-0`].in
          }, {
            name: 'Vehicles Out',
            type: 'bar',
            data: selectedData.map(d => d.out),
            color: colors[`vehicle-0`].out
          }] as any
        };

      case 'butterfly':
        return {
          chart: {
            type: 'bar',
            backgroundColor: 'transparent'
          },
          title: {
            text: 'Vehicle In/Out Distribution'
          },
          xAxis: {
            categories: selectedData.map(d => d.vehicleType)
          },
          yAxis: {
            title: {
              text: 'Count'
            }
          },
          plotOptions: {
            series: {
              stacking: 'normal'
            }
          },
          series: [{
            name: 'Vehicles In',
            type: 'bar',
            data: selectedData.map(d => d.in),
            color: colors[`vehicle-0`].in
          }, {
            name: 'Vehicles Out',
            type: 'bar',
            data: selectedData.map(d => -d.out),
            color: colors[`vehicle-0`].out
          }] as any
        };

      case 'nightingale':
        return {
          chart: {
            polar: true,
            backgroundColor: 'transparent'
          },
          title: {
            text: 'Time Distribution (Nightingale)'
          },
          pane: {
            startAngle: 0,
            endAngle: 360
          },
          xAxis: {
            categories: timePoints,
            tickmarkPlacement: 'on',
            lineWidth: 0
          },
          yAxis: {
            min: 0
          },
          plotOptions: {
            column: {
              pointPadding: 0,
              groupPadding: 0,
              colorByPoint: false
            }
          },
          series: selectedData.map((vehicle, index) => ({
            name: vehicle.vehicleType,
            type: 'column',
            color: getColor(index, 'total'),
            data: [
              vehicle.details.morning.in,
              vehicle.details.afternoon.in,
              vehicle.details.evening.in,
              vehicle.details.night.in
            ]
          }))
        };

      case 'area':
        return {
          chart: {
            type: 'area',
            backgroundColor: 'transparent'
          },
          title: {
            text: 'Time Distribution'
          },
          xAxis: {
            categories: timePoints
          },
          yAxis: {
            title: {
              text: 'Count'
            }
          },
          plotOptions: {
            ...colorSettings.plotOptions,
            area: {
              animation: false
            }
          },
          series: selectedData.map((vehicle, index) => ({
            name: vehicle.vehicleType,
            type: 'area' as const,
            color: getColor(index, 'total'),
            data: [
              vehicle.details.morning.in,
              vehicle.details.afternoon.in,
              vehicle.details.evening.in,
              vehicle.details.night.in
            ]
          })) as any
        };

      case 'spline':
        return {
          chart: {
            type: 'spline',
            backgroundColor: 'transparent'
          },
          title: {
            text: 'Time Trend'
          },
          xAxis: {
            categories: timePoints
          },
          yAxis: {
            title: {
              text: 'Count'
            }
          },
          plotOptions: {
            ...colorSettings.plotOptions,
            spline: {
              animation: false
            }
          },
          series: selectedData.map((vehicle, index) => ({
            name: vehicle.vehicleType,
            type: 'spline' as const,
            color: getColor(index, 'total'),
            data: [
              vehicle.details.morning.in,
              vehicle.details.afternoon.in,
              vehicle.details.evening.in,
              vehicle.details.night.in
            ]
          })) as any
        };

      case 'radar':
        return {
          chart: {
            polar: true,
            backgroundColor: 'transparent'
          },
          title: {
            text: 'Vehicle Distribution Analysis'
          },
          pane: {
            size: '80%'
          },
          xAxis: {
            categories: timePoints,
            tickmarkPlacement: 'on',
            lineWidth: 0
          },
          yAxis: {
            gridLineInterpolation: 'polygon',
            lineWidth: 0,
            min: 0
          },
          plotOptions: {
            ...colorSettings.plotOptions,
            series: {
              ...colorSettings.plotOptions.series,
              pointStart: 0
            }
          },
          series: selectedData.map((vehicle, index) => ({
            name: vehicle.vehicleType,
            type: 'line' as const,
            color: getColor(index, 'total'),
            data: [
              vehicle.details.morning.in,
              vehicle.details.afternoon.in,
              vehicle.details.evening.in,
              vehicle.details.night.in
            ]
          })) as any
        };

      default:
        return {
          chart: {
            type: 'line',
            backgroundColor: 'transparent'
          },
          title: {
            text: 'Time Distribution'
          },
          xAxis: {
            categories: timePoints
          },
          yAxis: {
            title: {
              text: 'Count'
            }
          },
          series: selectedData.map(vehicle => ({
            name: vehicle.vehicleType,
            type: 'line',
            data: [
              vehicle.details.morning.in,
              vehicle.details.afternoon.in,
              vehicle.details.evening.in,
              vehicle.details.night.in
            ]
          }))
        };
    }
  };

  const handleGraphTypeSelect = (type: GraphType) => {
    setSelectedGraphType(type);
    const options = generateChartOptions(type);
    setChartOptions(options);
  };

  const handleCreateGraph = () => {
    if (chartOptions) {
      // Create a container div with exact dimensions
      const container = document.createElement('div');
      container.style.width = '400px';
      container.style.height = '300px';
      document.body.appendChild(container);

      // Create the chart with exact same options as preview
      const chart = Highcharts.chart(container, {
        ...chartOptions,
        chart: {
          ...chartOptions.chart,
          width: 400,
          height: 300,
          animation: false,
          style: {
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
          }
        },
        credits: {
          enabled: false
        },
        title: {
          ...chartOptions.title,
          style: {
            fontSize: '16px',
            fontWeight: '500'
          }
        },
        xAxis: {
          ...chartOptions.xAxis,
          labels: {
            style: {
              fontSize: '12px'
            }
          }
        },
        yAxis: {
          ...chartOptions.yAxis,
          labels: {
            style: {
              fontSize: '12px'
            }
          }
        },
        plotOptions: {
          ...chartOptions.plotOptions,
          series: {
            ...chartOptions.plotOptions?.series,
            animation: false
          }
        }
      });

      // Get the SVG
      const svg = chart.container.querySelector('svg')?.outerHTML;
      
      // Clean up
      chart.destroy();
      document.body.removeChild(container);

      if (svg) {
        const wrappedSvg = `
          <div style="
            width: 100%; 
            height: 100%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          ">
            ${svg}
          </div>
        `;
        
        const newWidget = {
          type: 'graph' as const,
          title: graphTitle,
          content: wrappedSvg,
          backgroundColor: selectedColor
        };

        console.log('Adding widget:', newWidget); // Debug log
        addWidget(newWidget);
        addGraph(graphTitle, wrappedSvg);
        
        onClose();
        onGraphCreated?.();
      }
    }
  };

  const pastelColors = [
    { name: 'White', value: '#ffffff' },
    { name: 'Pastel Blue', value: '#E3F2FD' },
    { name: 'Pastel Purple', value: '#F3E5F5' },
    { name: 'Pastel Green', value: '#E8F5E9' },
    { name: 'Pastel Yellow', value: '#FFFDE7' },
    { name: 'Pastel Pink', value: '#FCE4EC' },
    { name: 'Pastel Orange', value: '#FFF3E0' }
  ];

  const handleCreateKPI = () => {
    console.log('Creating KPI...'); // Debug log

    const kpiContent = `
      <div style="
        width: 100%;
        height: 100%;
        padding: 1rem;
        background-color: ${selectedColor};
        overflow-y: auto;
      ">
        ${selectedData.map(vehicle => `
          <div style="
            margin-bottom: 1rem;
            padding: 1rem;
            background: ${selectedColor === '#ffffff' ? '#f9fafb' : '#ffffff'};
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          ">
            <h4 style="
              margin: 0 0 0.5rem 0;
              color: #374151;
              font-size: 1.1rem;
              font-weight: 600;
            ">${vehicle.vehicleType}</h4>
            
            <div style="text-align: center; margin-bottom: 1rem;">
              <span style="
                display: block;
                font-size: 2rem;
                font-weight: 600;
                color: #111827;
              ">${vehicle.count}</span>
              <span style="font-size: 0.875rem; color: #6b7280;">Total Vehicles</span>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div style="
                text-align: center;
                padding: 0.75rem;
                border-radius: 0.375rem;
                background: ${selectedColor === '#ffffff' ? '#ffffff' : '#f9fafb'};
              ">
                <span style="
                  display: block;
                  font-size: 1.25rem;
                  font-weight: 600;
                  color: #059669;
                ">${vehicle.in}</span>
                <span style="font-size: 0.75rem; color: #6b7280;">In</span>
              </div>
              
              <div style="
                text-align: center;
                padding: 0.75rem;
                border-radius: 0.375rem;
                background: ${selectedColor === '#ffffff' ? '#ffffff' : '#f9fafb'};
              ">
                <span style="
                  display: block;
                  font-size: 1.25rem;
                  font-weight: 600;
                  color: #dc2626;
                ">${vehicle.out}</span>
                <span style="font-size: 0.75rem; color: #6b7280;">Out</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    const newWidget = {
      type: 'kpi' as const,
      title: graphTitle || 'Vehicle Statistics',
      content: kpiContent,
      backgroundColor: selectedColor
    };

    console.log('Adding widget:', newWidget); // Debug log
    addWidget(newWidget);
    onClose();
    onGraphCreated?.();
  };

  if (!isOpen) return null;

  return (
    <div className="graph-modal-overlay">
      <div className="graph-modal">
        <div className="graph-modal-header">
          <h2>Create Widget</h2>
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
            <div className="color-options">
              {pastelColors.map((color) => (
                <button
                  key={color.value}
                  className={`color-button ${selectedColor === color.value ? 'selected' : ''}`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setSelectedColor(color.value)}
                  title={color.name}
                />
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
            {chartOptions ? (
              <div style={{ width: '400px', height: '300px' }}>
                <HighchartsReact
                  highcharts={Highcharts}
                  options={{
                    ...chartOptions,
                    chart: {
                      ...chartOptions.chart,
                      width: 400,
                      height: 300
                    },
                    credits: {
                      enabled: false
                    }
                  }}
                />
              </div>
            ) : (
              <div className="no-preview">Select a graph type to see preview</div>
            )}
          </div>
        </div>

        <div className="graph-modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <div className="action-buttons">
            <button 
              className="create-button"
              onClick={handleCreateKPI}
              disabled={!graphTitle.trim()}
            >
              Create KPI
            </button>
            <button 
              className="create-button"
              onClick={handleCreateGraph}
              disabled={!chartOptions || !graphTitle.trim()}
            >
              Create Graph
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphModal; 