import React, { useState, useEffect } from 'react';
import { useWidgets } from '../../../context/WidgetContext';
import './GraphModal.css';
import { API_URL } from '../../../utils/config';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Chart, Bar, Line, Pie } from 'react-chartjs-2';
import { toast } from 'react-hot-toast';


interface GraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGraphCreated?: () => void;
}

type GraphType = 'bar' | 'multiPie' | 'line' | 'comboBarLine' | 'radialGradient' | 'doughnut';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Add this interface for the API request
interface WidgetPayload {
  id: string;
  type: 'graph';
  title: string;
  content: string;
  backgroundColor: string;
  chartProps: {
    type: GraphType;
    data: Array<{
      label: string;
      value: number;
      source: string;
    }>;
    colors: Record<string, any>;
  };
}

const GraphModal: React.FC<GraphModalProps> = ({ isOpen, onClose, onGraphCreated }) => {
  const { addWidget } = useWidgets();
  const [graphTitle, setGraphTitle] = useState('');
  const [selectedGraphType, setSelectedGraphType] = useState<GraphType>('bar');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  
  // Add states for data selection
  const [availableCollections, setAvailableCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [availableVideoSources, setAvailableVideoSources] = useState<string[]>([]);
  const [selectedVideoSource, setSelectedVideoSource] = useState<string>('1');
  const [availableFields, setAvailableFields] = useState<{[key: string]: number}>({});
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  // Color options
  const colorOptions = [
    { 
      mainColor: '#FFB5B5',
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

  // Fetch collections on mount
  useEffect(() => {
    fetchCollections();
  }, []);

  // Fetch collections
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

  // Fetch video sources
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

  // Fetch fields
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

  // Update the handleCreateGraph function
  const handleCreateGraph = async () => {
    try {
      if (!selectedFields.length || !selectedCollection || !selectedGraphType) {
        toast.error('Please select all required fields');
        return;
      }

      // Format data according to required backend structure
      const graphData = {
        uuid: Math.random().toString(16).slice(2), // Generate a random uuid
        widget_name: graphTitle || 'New Graph',
        fields: {
          background_color: selectedColor,
          collection_name: selectedCollection,
          video_source: [selectedVideoSource],
          Rule: selectedFields.map(fieldId => {
            const [_, field] = fieldId.split(':');
            return field;
          }),
          chart: getChartTypeName(selectedGraphType)
        },
        createdAt: new Date().toISOString()
      };

      console.log('Sending data to server:', graphData);

      // Store in Widgets database
      const response = await fetch(`${API_URL}/api/v1/Widgets/saveWidget`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(graphData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server response:', errorData);
        throw new Error(errorData.message || 'Failed to save to database');
      }

      const savedData = await response.json();
      console.log('Successfully saved to database:', savedData);

      toast.success('Graph data saved successfully!');

      if (onGraphCreated) {
        onGraphCreated();
      }
      onClose();

    } catch (error) {
      console.error('Error saving graph:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save graph. Please try again.');
    }
  };

  // Helper function to convert graph type to readable name
  const getChartTypeName = (type: GraphType): string => {
    const chartTypes = {
      bar: 'Bar Chart',
      multiPie: 'Pie Chart',
      line: 'Line Chart',
      comboBarLine: 'Combo Chart',
      radialGradient: 'Radial Chart',
      doughnut: 'Doughnut Chart'
    };
    return chartTypes[type] || type;
  };

  const generateChartComponent = (type: GraphType) => {
    const chartData = {
      labels: selectedFields.map(fieldId => {
        const [source, field] = fieldId.split(':');
        return `${field} (Source ${source})`;
      }),
      datasets: [
        {
          label: 'Value',
          data: selectedFields.map(fieldId => {
            const [source, field] = fieldId.split(':');
            return availableFields[field] || 0;
          }),
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          borderColor: '#6366F1',
          borderWidth: 2,
          borderRadius: 6,
          tension: 0.4
        }
      ]
    };

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            usePointStyle: true,
            padding: 20,
            font: { size: 12 }
          }
        }
      }
    };

    switch (type) {
      case 'bar':
        return (
          <Bar
            data={{
              ...chartData,
              datasets: [{
                ...chartData.datasets[0],
                backgroundColor: selectedFields.map((_, index) => {
                  const ctx = document.createElement('canvas').getContext('2d');
                  if (ctx) {
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.9)');
                    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.2)');
                    return gradient;
                  }
                  return 'rgba(99, 102, 241, 0.5)';
                }),
                borderColor: '#4f46e5',
                borderWidth: 2,
                borderRadius: 8,
                hoverBackgroundColor: 'rgba(99, 102, 241, 0.7)',
                hoverBorderColor: '#4338ca',
                hoverBorderWidth: 3,
              }]
            }}
            options={{
              ...commonOptions,
              animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
              },
              elements: {
                bar: {
                  borderRadius: 8,
                  borderSkipped: false
                }
              },
              scales: {
                y: {
                  grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.03)',
                    lineWidth: 1,
                    drawTicks: false
                  },
                  ticks: {
                    padding: 10,
                    color: '#64748b'
                  }
                },
                x: {
                  grid: {
                    display: false
                  },
                  ticks: {
                    padding: 10,
                    color: '#64748b'
                  }
                }
              },
              plugins: {
                ...commonOptions.plugins,
                legend: {
                  display: false
                }
              }
            }}
          />
        );

      case 'multiPie':
        return (
          <Pie
            data={{
              labels: chartData.labels,
              datasets: [{
                data: chartData.datasets[0].data,
                backgroundColor: [
                  'rgba(255, 99, 132, 0.8)',
                  'rgba(54, 162, 235, 0.8)',
                  'rgba(255, 206, 86, 0.8)',
                  'rgba(75, 192, 192, 0.8)',
                  'rgba(153, 102, 255, 0.8)',
                  'rgba(255, 159, 64, 0.8)'
                ],
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 4,
                hoverBorderColor: '#ffffff',
                hoverBorderWidth: 3,
                offset: 10,
                weight: 1
              }, {
                data: chartData.datasets[0].data.map(value => value * 0.7), // Inner ring
                backgroundColor: [
                  'rgba(255, 99, 132, 0.6)',
                  'rgba(54, 162, 235, 0.6)',
                  'rgba(255, 206, 86, 0.6)',
                  'rgba(75, 192, 192, 0.6)',
                  'rgba(153, 102, 255, 0.6)',
                  'rgba(255, 159, 64, 0.6)'
                ],
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 4,
                hoverBorderColor: '#ffffff',
                hoverBorderWidth: 3,
                offset: 5,
                weight: 0.8
              }]
            }}
            options={{
              ...commonOptions,
              cutout: '30%',
              plugins: {
                legend: {
                  position: 'right',
                  labels: {
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: {
                      size: 12,
                      weight: 500
                    },
                    generateLabels: (chart) => {
                      const datasets = chart.data.datasets;
                      return chart.data.labels?.map((label, i) => ({
                        text: label as string,
                        fillStyle: datasets[0].backgroundColor?.[i] as string,
                        strokeStyle: datasets[0].borderColor as string,
                        lineWidth: 2,
                        hidden: false,
                        index: i,
                        pointStyle: 'circle'
                      })) || [];
                    }
                  }
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const label = context.label || '';
                      const value = context.raw as number;
                      return `${label}: ${value}`;
                    }
                  }
                }
              }
            }}
          />
        );

      case 'line':
        return (
          <Line
            data={chartData}
            options={{
              ...commonOptions,
              elements: {
                line: { tension: 0.4 },
                point: { radius: 4, hoverRadius: 6 }
              }
            }}
          />
        );

      case 'comboBarLine':
        return (
          <Chart
            type='bar'
            data={{
              labels: chartData.labels,
              datasets: [
                {
                  type: 'bar',
                  label: 'Bar Data',
                  data: selectedFields.map(fieldId => {
                    const [source, field] = fieldId.split(':');
                    return availableFields[field] || 0;
                  }),
                  backgroundColor: 'rgba(99, 102, 241, 0.5)',
                  borderColor: '#6366F1',
                  borderWidth: 2,
                  borderRadius: 6,
                  order: 2
                },
                {
                  type: 'line',
                  label: 'Line Data',
                  data: selectedFields.map(fieldId => {
                    const [source, field] = fieldId.split(':');
                    return availableFields[field] || 0;
                  }),
                  borderColor: '#10B981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderWidth: 2,
                  pointBackgroundColor: '#10B981',
                  pointBorderColor: '#ffffff',
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  fill: true,
                  tension: 0.4,
                  order: 1
                }
              ]
            }}
            options={{
              ...commonOptions,
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { size: 12 }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                  }
                },
                x: {
                  grid: {
                    display: false
                  }
                }
              }
            }}
          />
        );

      case 'radialGradient':
        const radialData = {
          labels: chartData.labels,
          datasets: [{
            data: chartData.datasets[0].data,
            backgroundColor: selectedFields.map((_, index) => {
              const ctx = document.createElement('canvas').getContext('2d');
              if (ctx) {
                const gradient = ctx.createRadialGradient(150, 150, 0, 150, 150, 150);
                const colors = [
                  { stop: 0, color: 'rgba(99, 102, 241, 0.9)' },
                  { stop: 0.3, color: 'rgba(99, 102, 241, 0.7)' },
                  { stop: 0.6, color: 'rgba(99, 102, 241, 0.5)' },
                  { stop: 1, color: 'rgba(99, 102, 241, 0.2)' }
                ];
                colors.forEach(({ stop, color }) => gradient.addColorStop(stop, color));
                return gradient;
              }
              return 'rgba(99, 102, 241, 0.5)';
            }),
            borderWidth: 2,
            borderColor: '#4f46e5',
            hoverBackgroundColor: selectedFields.map(() => 'rgba(99, 102, 241, 0.8)'),
            hoverBorderColor: '#4338ca',
            hoverBorderWidth: 3,
            hoverOffset: 8
          }]
        };

        return (
          <Pie
            data={radialData}
            options={{
              ...commonOptions,
              animation: {
                animateRotate: true,
                animateScale: true,
                duration: 2000,
                easing: 'easeInOutQuart'
              },
              plugins: {
                ...commonOptions.plugins,
                legend: {
                  position: 'bottom',
                  labels: {
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: {
                      size: 12,
                      weight: 500
                    }
                  }
                }
              },
              elements: {
                arc: {
                  borderWidth: 2,
                  borderColor: '#ffffff'
                }
              }
            }}
          />
        );

      case 'doughnut':
        return (
          <Pie
            data={chartData}
            options={{
              ...commonOptions,
              cutout: '60%'
            }}
          />
        );

      default:
        return null;
    }
  };

  // Update the collection selection handler
  const handleCollectionChange = async (collection: string) => {
    // Clear previous selections
    setSelectedFields([]);
    setAvailableFields({});
    setSelectedVideoSource('');
    
    // Set new collection and fetch its video sources
    setSelectedCollection(collection);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/Collection/videoSources?collection=${collection}`,
        { credentials: 'include' }
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableVideoSources(data.videoSources.map((vs: any) => vs.source));
        // If there are video sources, select the first one and fetch its fields
        if (data.videoSources.length > 0) {
          const firstSource = data.videoSources[0].source;
          setSelectedVideoSource(firstSource);
          fetchFields(collection, firstSource);
        }
      }
    } catch (error) {
      console.error('Error fetching video sources:', error);
      toast.error('Failed to fetch video sources');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="graph-modal-overlay">
      <div className="graph-modal">
        <div className="graph-modal-header">
          <h2>Create Graph</h2>
          <button 
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              width="24"
              height="24"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="graph-modal-content">
          {/* Title Input */}
          <div className="config-section">
            <h3>Graph Title</h3>
            <input
              type="text"
              placeholder="Enter graph title"
              value={graphTitle}
              onChange={(e) => setGraphTitle(e.target.value)}
              className="graph-title-input"
            />
          </div>

          {/* Data Selection Section */}
          <div className="config-section data-selection">
            <h3 className="section-title">
              <span className="title-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" 
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="animate-pulse-subtle"/>
                  <circle cx="12" cy="12" r="1" fill="currentColor" className="animate-ping-slow"/>
                </svg>
              </span>
              Select Data
              <span className="title-badge">Step 1/3</span>
            </h3>
            <div className="data-selection-flow">
              {/* Collection Selection */}
              <div className="selection-group collection-group">
                <h4>
                  <span className="group-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" 
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 2v4M16 2v4M3 10h18" 
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  Select Collection
                </h4>
                <div className="collection-buttons">
                  {availableCollections.map(collection => (
                    <button
                      key={collection}
                      className={`selection-button collection-btn ${selectedCollection === collection ? 'selected' : ''}`}
                      onClick={() => handleCollectionChange(collection)}
                    >
                      <div className="collection-btn-content">
                        <div className="collection-info">
                          <span className="collection-name">{collection}</span>
                          <span className="collection-type">Data Collection</span>
                        </div>
                      </div>
                      {selectedCollection === collection && (
                        <div className="selection-status">
                          <span className="status-dot"></span>
                          <span className="status-text">Selected</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video Source Selection */}
              {selectedCollection && (
                <div className="selection-group source-group">
                  <h4>
                    <span className="group-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="video-icon">
                        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" 
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 8v8M8 12h8" 
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="3" 
                          strokeWidth="2"/>
                      </svg>
                    </span>
                    Select Video Source
                  </h4>
                  <div className="source-buttons">
                    {availableVideoSources.map(source => (
                      <button
                        key={source}
                        className={`selection-button source-btn ${selectedVideoSource === source ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedVideoSource(source);
                          fetchFields(selectedCollection, source);
                        }}
                      >
                        <span className="source-number">#{source}</span>
                        <span className="source-label">Source {source}</span>
                        {selectedVideoSource === source && (
                          <span className="pulse-indicator"></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Field Selection */}
              {Object.keys(availableFields).length > 0 && (
                <div className="selection-group fields-group">
                  <h4>
                    <span className="group-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="fields-icon">
                        <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" 
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 8h10M7 12h10M7 16h10" 
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          className="animate-draw-lines"/>
                        <circle cx="4" cy="8" r="1" fill="currentColor" className="animate-blink"/>
                        <circle cx="4" cy="12" r="1" fill="currentColor" className="animate-blink"/>
                        <circle cx="4" cy="16" r="1" fill="currentColor" className="animate-blink"/>
                      </svg>
                    </span>
                    Select Fields
                    <span className="field-count">{selectedFields.length} selected</span>
                  </h4>
                  <div className="fields-grid">
                    {Object.entries(availableFields).map(([field, value]) => {
                      const fieldId = `${selectedVideoSource}:${field}`;
                      const isSelected = selectedFields.includes(fieldId);
                      return (
                        <div
                          key={field}
                          className={`field-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedFields(prev => 
                              prev.includes(fieldId)
                                ? prev.filter(f => f !== fieldId)
                                : [...prev, fieldId]
                            );
                          }}
                        >
                          <div className="field-content">
                            <div className="field-name">
                              <span className="field-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" 
                                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <circle cx="12" cy="13" r="4" 
                                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </span>
                              {field}
                            </div>
                            <div className="field-count">
                              <span className="count-value">{value}</span>
                              <span className="count-label">entries</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Show Graph Options only when fields are selected */}
          {selectedFields.length > 0 && (
            <>
              {/* Graph Type Selection */}
              <div className="config-section graph-types-section">
                <h3>Select Graph Type</h3>
                <div className="graph-type-selector">
                  <div 
                    className={`graph-type-card ${selectedGraphType === 'bar' ? 'selected' : ''}`}
                    onClick={() => setSelectedGraphType('bar')}
                  >
                    <div className="graph-type-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M3 3v18h18" strokeWidth="2" strokeLinecap="round"/>
                        <rect x="6" y="8" width="3" height="10" rx="1" strokeWidth="2"/>
                        <rect x="11" y="5" width="3" height="13" rx="1" strokeWidth="2"/>
                        <rect x="16" y="11" width="3" height="7" rx="1" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div className="graph-type-content">
                      <h4>Bar Chart</h4>
                      <p>Compare values with rounded corners</p>
                      <div className="graph-features">
                        <span className="feature-tag">Modern</span>
                        <span className="feature-tag">Clean</span>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`graph-type-card ${selectedGraphType === 'multiPie' ? 'selected' : ''}`}
                    onClick={() => setSelectedGraphType('multiPie')}
                  >
                    <div className="graph-type-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="8" strokeWidth="2"/>
                        <path d="M12 4v8l5.5 5.5" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M12 12l-4 4" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="graph-type-content">
                      <h4>Multi-Pie Chart</h4>
                      <p>Left to right comparison</p>
                      <div className="graph-features">
                        <span className="feature-tag">Spacious</span>
                        <span className="feature-tag">Clear</span>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`graph-type-card ${selectedGraphType === 'line' ? 'selected' : ''}`}
                    onClick={() => setSelectedGraphType('line')}
                  >
                    <div className="graph-type-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M3 3v18h18" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M3 15l4-4 4 4 4-8 6 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="graph-type-content">
                      <h4>Line Chart</h4>
                      <p>Track trends over time</p>
                      <div className="graph-features">
                        <span className="feature-tag">Trends</span>
                        <span className="feature-tag">Smooth</span>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`graph-type-card ${selectedGraphType === 'comboBarLine' ? 'selected' : ''}`}
                    onClick={() => setSelectedGraphType('comboBarLine')}
                  >
                    <div className="graph-type-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M3 3v18h18" strokeWidth="2" strokeLinecap="round"/>
                        <rect x="6" y="10" width="3" height="8" rx="1" strokeWidth="2"/>
                        <rect x="15" y="7" width="3" height="11" rx="1" strokeWidth="2"/>
                        <path d="M4 12l4-2 4 2 4-6 4 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="graph-type-content">
                      <h4>Combo Chart</h4>
                      <p>Mix bars and lines</p>
                      <div className="graph-features">
                        <span className="feature-tag">Hybrid</span>
                        <span className="feature-tag">Complex</span>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`graph-type-card ${selectedGraphType === 'radialGradient' ? 'selected' : ''}`}
                    onClick={() => setSelectedGraphType('radialGradient')}
                  >
                    <div className="graph-type-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="6" strokeWidth="2" strokeDasharray="4 2"/>
                        <circle cx="12" cy="12" r="2" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div className="graph-type-content">
                      <h4>Radial Gradient</h4>
                      <p>Beautiful circular display</p>
                      <div className="graph-features">
                        <span className="feature-tag">Artistic</span>
                        <span className="feature-tag">Modern</span>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`graph-type-card ${selectedGraphType === 'doughnut' ? 'selected' : ''}`}
                    onClick={() => setSelectedGraphType('doughnut')}
                  >
                    <div className="graph-type-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="5" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div className="graph-type-content">
                      <h4>Doughnut Chart</h4>
                      <p>Ring-style visualization</p>
                      <div className="graph-features">
                        <span className="feature-tag">Compact</span>
                        <span className="feature-tag">Clean</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Selection */}
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
            </>
          )}

          {selectedFields.length > 0 && (
            <div className="config-section preview-section">
              <div className="preview-header">
                <h3>Preview</h3>
                <div className="preview-info">
                  <span className="preview-badge">Live Preview</span>
                </div>
              </div>
              <div className="preview-container">
                <div className="preview-card" style={{ backgroundColor: selectedColor }}>
                  <div className="preview-title">{graphTitle || 'Graph Preview'}</div>
                  <div className="chart-container">
                    {generateChartComponent(selectedGraphType)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="graph-modal-footer">
          <button className="cancel-button" onClick={onClose}>Cancel</button>
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