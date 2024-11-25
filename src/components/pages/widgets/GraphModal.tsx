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
import { Bar, Line, Pie } from 'react-chartjs-2';

interface GraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGraphCreated?: () => void;
}

type GraphType = 'bar' | 'horizontalBar' | 'line' | 'comboBarLine' | 'radialGradient' | 'doughnut';

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

  const handleCreateGraph = () => {
    const graphId = `graph-${Date.now()}`;
    
    const newWidget = {
      id: graphId,
      type: 'graph' as const,
      title: graphTitle || 'New Graph',
      content: '',
      backgroundColor: selectedColor,
      chartProps: {
        type: selectedGraphType,
        data: selectedFields.map(fieldId => {
          const [source, field] = fieldId.split(':');
          return {
            label: `${field} (Source ${source})`,
            value: availableFields[field] || 0
          };
        }),
        colors: {}
      }
    };

    addWidget(newWidget);
    onGraphCreated?.();
    onClose();
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

      case 'horizontalBar':
        return (
          <Bar
            data={chartData}
            options={{
              ...commonOptions,
              indexAxis: 'y' as const,
              elements: {
                bar: {
                  borderRadius: 6,
                  borderSkipped: false
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
        const comboData = {
          labels: chartData.labels,
          datasets: [
            {
              type: 'bar' as const,
              label: 'Bar',
              data: selectedFields.map(fieldId => {
                const [source, field] = fieldId.split(':');
                return availableFields[field] || 0;
              }),
              backgroundColor: 'rgba(99, 102, 241, 0.5)',
              borderColor: '#6366F1',
              borderWidth: 2,
              borderRadius: 6,
              order: 1
            },
            {
              type: 'bar' as const,
              label: 'Line',
              data: selectedFields.map(fieldId => {
                const [source, field] = fieldId.split(':');
                return availableFields[field] || 0;
              }),
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.5)',
              borderWidth: 2,
              borderRadius: 6,
              order: 2
            }
          ]
        };

        return (
          <Bar
            data={comboData}
            options={{
              ...commonOptions,
              elements: {
                bar: { 
                  borderRadius: 6,
                  borderSkipped: false
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
          <div className="config-section">
            <h3>Select Data</h3>
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
                        className={`selection-button ${selectedVideoSource === source ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedVideoSource(source);
                          fetchFields(selectedCollection, source);
                        }}
                      >
                        Source {source}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Field Selection */}
              {Object.keys(availableFields).length > 0 && (
                <div className="selection-group">
                  <h4>Select Fields</h4>
                  <div className="fields-grid">
                    {Object.entries(availableFields).map(([field, value]) => (
                      <div
                        key={field}
                        className={`field-item ${selectedFields.includes(`${selectedVideoSource}:${field}`) ? 'selected' : ''}`}
                        onClick={() => {
                          const fieldId = `${selectedVideoSource}:${field}`;
                          setSelectedFields(prev => 
                            prev.includes(fieldId)
                              ? prev.filter(f => f !== fieldId)
                              : [...prev, fieldId]
                          );
                        }}
                      >
                        <div className="field-name">{field}</div>
                        <div className="field-count">{value}</div>
                      </div>
                    ))}
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
                        <path d="M4 20h16M4 20V4m0 16l4-4v4m4 0V10m0 10l4-8v8m4 0V6l-4 14" 
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                    className={`graph-type-card ${selectedGraphType === 'horizontalBar' ? 'selected' : ''}`}
                    onClick={() => setSelectedGraphType('horizontalBar')}
                  >
                    <div className="graph-type-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M4 4h16M4 4v16M4 8h12M4 12h8M4 16h14M4 20h10" 
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="graph-type-content">
                      <h4>Horizontal Bar</h4>
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
                        <path d="M3 12h4l3-9 4 18 3-9h4M3 20h18" 
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                        <path d="M4 20h16M4 20V4m0 16l4-4v4m4 0V10m0 10l4-8v8" strokeWidth="2"/>
                        <path d="M3 12h4l3-9 4 18 3-9h4" strokeWidth="2" strokeDasharray="2 2"/>
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
            disabled={!selectedFields.length || !graphTitle.trim()}
          >
            Create Graph
          </button>
        </div>
      </div>
    </div>
  );
};

export default GraphModal; 