import React, { useState } from 'react';
import './CreateWidgetModal.css';

interface DataCard {
  id: string;
  title: string;
  data: {
    label: string;
    value: string | number;
    icon?: string;
  }[];
}

interface CreateWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWidget: (widgetName: string, chartType: string, options?: any) => void;
  availableDataCards?: DataCard[];
}

const dataSourceIcons = {
  car: {
    speed: '⚡',
    fuel: '⛽',
    engine_temp: '🌡️',
    battery: '🔋',
    location: '📍'
  },
  bus: {
    passengers: '👥',
    route_status: '🚏',
    next_stop: '🗺️',
    temperature: '🌡️',
    capacity: '📊'
  },
  bike: {
    available: '🚲',
    active_rides: '🏃',
    station_status: '🎯',
    maintenance: '🔧',
    usage_rate: '📈'
  },
  truck: {
    current_route: '🛣️',
    cargo_status: '📦',
    eta: '⏱️',
    load_weight: '⚖️',
    fuel_economy: '⚡'
  }
};

const graphTypes = [
  {
    id: 'line',
    title: 'Line Graph',
    description: 'Show trends over time',
    visualIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="graph-icon-svg">
      <path d="M3 12h4l3-9 4 18 3-9h4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M3 21h18" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'bar',
    title: 'Bar Chart',
    description: 'Compare values across categories',
    visualIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="graph-icon-svg">
      <path d="M4 20h16M4 20V4m0 16l4-4v4m4 0V10m0 10l4-8v8m4 0V6l-4 14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    id: 'pie',
    title: 'Pie Chart',
    description: 'Show proportions of a whole',
    visualIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="graph-icon-svg">
      <path d="M12 2v10l8.5 5M12 2a10 10 0 1 0 8.5 15L12 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    id: 'area',
    title: 'Area Chart',
    description: 'Visualize cumulative totals',
    visualIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="graph-icon-svg">
      <path d="M3 12h4l3-9 4 18 3-9h4M3 20h18" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M3 12h4l3-9 4 18 3-9h4V20H3z" fill="currentColor" fill-opacity="0.2"/>
    </svg>`
  },
  {
    id: 'spline',
    title: 'Spline Chart',
    description: 'Smooth curved line chart',
    visualIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="graph-icon-svg">
      <path d="M3 12c4-6 8 6 12 0s4-6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M3 21h18" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'butterfly',
    title: 'Butterfly Chart',
    description: 'Compare positive/negative values',
    visualIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="graph-icon-svg">
      <path d="M12 3v18M3 12h18M7 8h10M7 16h10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M7 8L3 12l4 4M17 8l4 4-4 4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    id: 'nightingale',
    title: 'Nightingale',
    description: 'Polar area diagram',
    visualIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="graph-icon-svg">
      <circle cx="12" cy="12" r="10" stroke-width="2"/>
      <path d="M12 2l4 10-4 10-4-10z M2 12h20M12 2v20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    id: 'waterfall',
    title: 'Waterfall',
    description: 'Show running total',
    visualIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="graph-icon-svg">
      <path d="M3 3v18h18M7 16v-4m4 4V8m4 8v-6m4 6v-3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M7 12h4m4 0h4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 2"/>
    </svg>`
  },
  {
    id: 'radar',
    title: 'Radar Chart',
    description: 'Compare multiple variables',
    visualIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="graph-icon-svg">
      <path d="M12 2l8.5 5v10L12 22l-8.5-5V7L12 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 2v20M3.5 7l17 10M3.5 17l17-10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  }
];

const availableDataSources = [
  {
    id: 'car',
    title: 'Car Status',
    data: [
      { id: 'speed', label: 'Speed', value: '65 mph', icon: '🚗', type: 'numeric' },
      { id: 'fuel', label: 'Fuel Level', value: '75%', icon: '⛽', type: 'percentage' },
      { id: 'engine_temp', label: 'Engine Temperature', value: '90°C', icon: '🌡️', type: 'numeric' },
      { id: 'battery', label: 'Battery Level', value: '85%', icon: '🔋', type: 'percentage' },
      { id: 'location', label: 'Location', value: 'Route 66', icon: '📍', type: 'text' }
    ]
  },
  {
    id: 'bus',
    title: 'Bus Monitor',
    data: [
      { id: 'passengers', label: 'Passenger Count', value: '42', icon: '👥', type: 'numeric' },
      { id: 'route_status', label: 'Route Status', value: 'On Time', icon: '🛣️', type: 'status' },
      { id: 'next_stop', label: 'Next Stop', value: 'Central', icon: '🚏', type: 'text' },
      { id: 'temperature', label: 'Temperature', value: '72°F', icon: '🌡️', type: 'numeric' },
      { id: 'capacity', label: 'Capacity', value: '65%', icon: '📊', type: 'percentage' }
    ]
  },
  {
    id: 'bike',
    title: 'Bike Status',
    data: [
      { id: 'available', label: 'Available Bikes', value: '15', icon: '🚲', type: 'numeric' },
      { id: 'active_rides', label: 'Active Rides', value: '8', icon: '🏃', type: 'numeric' },
      { id: 'station_status', label: 'Station Status', value: 'Active', icon: '🅿️', type: 'status' },
      { id: 'maintenance', label: 'Maintenance', value: 'Good', icon: '🔧', type: 'status' },
      { id: 'usage_rate', label: 'Usage Rate', value: 'High', icon: '📈', type: 'text' }
    ]
  },
  {
    id: 'truck',
    title: 'Truck Location',
    data: [
      { id: 'current_route', label: 'Current Route', value: 'Route A-7', icon: '🛣️', type: 'text' },
      { id: 'cargo_status', label: 'Cargo Status', value: 'Secure', icon: '📦', type: 'status' },
      { id: 'eta', label: 'ETA', value: '2:30 PM', icon: '⏰', type: 'time' },
      { id: 'load_weight', label: 'Load Weight', value: '12.5t', icon: '⚖️', type: 'numeric' },
      { id: 'fuel_economy', label: 'Fuel Economy', value: '6.2 MPG', icon: '📉', type: 'numeric' }
    ]
  }
];

const CreateWidgetModal: React.FC<CreateWidgetModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreateWidget,
  availableDataCards = availableDataSources
}) => {
  const [widgetTitle, setWidgetTitle] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDataCards, setSelectedDataCards] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<{[key: string]: string[]}>({});

  const handleFieldSelect = (sourceId: string, fieldId: string) => {
    setSelectedFields(prev => {
      const current = prev[sourceId] || [];
      const updated = { ...prev };
      
      if (current.includes(fieldId)) {
        updated[sourceId] = current.filter(id => id !== fieldId);
        if (updated[sourceId].length === 0) {
          delete updated[sourceId];
        }
      } else {
        updated[sourceId] = [...current, fieldId];
      }
      
      return updated;
    });
  };

  const getSelectedFieldsData = () => {
    const fieldsData: any[] = [];
    Object.entries(selectedFields).forEach(([sourceId, fields]) => {
      const source = availableDataSources.find(s => s.id === sourceId);
      if (source) {
        fields.forEach(fieldId => {
          const field = source.data.find(d => d.id === fieldId);
          if (field) {
            fieldsData.push({
              sourceId,
              sourceName: source.title,
              ...field
            });
          }
        });
      }
    });
    return fieldsData;
  };

  const generateGraphPreview = (type: string, data: any) => {
    const graphConfigs = {
      line: {
        chart: {
          type: 'line',
          backgroundColor: 'transparent'
        },
        title: {
          text: widgetTitle || 'Line Chart'
        },
        series: [{
          data: data.map((d: any) => parseFloat(d.value) || 0)
        }]
      },
      bar: {
        chart: {
          type: 'column',
          backgroundColor: 'transparent'
        },
        title: {
          text: widgetTitle || 'Bar Chart'
        },
        series: [{
          data: data.map((d: any) => parseFloat(d.value) || 0)
        }]
      },
      pie: {
        chart: {
          type: 'pie',
          backgroundColor: 'transparent'
        },
        title: {
          text: widgetTitle || 'Pie Chart'
        },
        series: [{
          data: data.map((d: any) => ({
            name: d.label,
            y: parseFloat(d.value) || 0
          }))
        }]
      },
      // ... (add other chart types)
    };

    return graphConfigs[type] || graphConfigs.line;
  };

  const handleCreateWidget = () => {
    const selectedFieldsData = getSelectedFieldsData();
    if (widgetTitle && selectedType && selectedFieldsData.length > 0) {
      const graphConfig = generateGraphPreview(selectedType, selectedFieldsData);
      onCreateWidget(widgetTitle, selectedType, {
        config: graphConfig,
        data: selectedFieldsData
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="widget-modal-overlay">
      <div className="widget-modal">
        <div className="widget-modal-header">
          <h2>Create Widget</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="widget-modal-content">
          <input
            type="text"
            placeholder="Enter widget title"
            value={widgetTitle}
            onChange={(e) => setWidgetTitle(e.target.value)}
            className="widget-title-input"
          />

          <div className="data-selection-section">
            <h3>Select Data Fields for Visualization</h3>
            <div className="data-cards-grid">
              {availableDataSources.map((source) => (
                <div key={source.id} className="data-card">
                  <div className="data-card-header">
                    <h4>{source.title}</h4>
                  </div>
                  <div className="data-fields">
                    {source.data.map((field) => (
                      <label 
                        key={field.id} 
                        className={`field-item ${
                          selectedFields[source.id]?.includes(field.id) ? 'selected' : ''
                        }`}
                      >
                        <div className="field-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedFields[source.id]?.includes(field.id) || false}
                            onChange={() => handleFieldSelect(source.id, field.id)}
                          />
                        </div>
                        <div className="field-icon">
                          {dataSourceIcons[source.id]?.[field.id] || field.icon}
                        </div>
                        <div className="field-info">
                          <span className="field-label">{field.label}</span>
                          <span className="field-value">{field.value}</span>
                        </div>
                        <div className="field-type">{field.type}</div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="graph-types-section">
            <h3>Choose Visualization</h3>
            <div className="graph-types-grid">
              {graphTypes.map((type) => (
                <div
                  key={type.id}
                  className={`graph-type-card ${selectedType === type.id ? 'selected' : ''}`}
                  onClick={() => setSelectedType(type.id)}
                >
                  <div className="graph-type-icon" 
                       dangerouslySetInnerHTML={{ __html: type.visualIcon }} 
                  />
                  <div className="graph-type-info">
                    <h3>{type.title}</h3>
                    <p>{type.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="widget-modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <div className="action-buttons">
            <button 
              className="create-kpi-button"
              onClick={() => {
                const fieldsData = getSelectedFieldsData();
                if (widgetTitle && fieldsData.length > 0) {
                  onCreateWidget(widgetTitle, 'kpi', {
                    data: fieldsData
                  });
                  onClose();
                }
              }}
              disabled={!widgetTitle || Object.keys(selectedFields).length === 0}
            >
              Create KPI
            </button>
            <button 
              className="create-graph-button"
              onClick={handleCreateWidget}
              disabled={!widgetTitle || !selectedType || Object.keys(selectedFields).length === 0}
            >
              Create Graph
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWidgetModal; 