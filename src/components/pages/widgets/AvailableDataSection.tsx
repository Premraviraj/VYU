import React, { useState, useEffect } from 'react';
import './AvailableDataSection.css';

interface DataCategory {
  title: string;
  description: string;
  metrics: {
    name: string;
    icon: string;
    description: string;
    value?: string | number;
    options?: string[];
  }[];
  isCustom?: boolean;
}

// Load custom widgets from localStorage on component mount
const loadCustomWidgets = (): DataCategory[] => {
  const saved = localStorage.getItem('customWidgets');
  return saved ? JSON.parse(saved) : [];
};

const defaultData: DataCategory[] = [
  {
    title: "Car Status",
    description: "Real-time monitoring of car fleet",
    metrics: [
      { name: "Speed", icon: "🚗", description: "Current speed", value: "65 mph" },
      { name: "Fuel Level", icon: "⛽", description: "Remaining fuel", value: "75%" },
      { name: "Location", icon: "📍", description: "Current location", value: "Route 66" },
      { name: "Engine Status", icon: "🔧", description: "Engine condition", value: "Optimal" },
      { name: "Battery", icon: "🔋", description: "Battery health", value: "Good" }
    ]
  },
  {
    title: "Bus Monitor",
    description: "Public transport tracking system",
    metrics: [
      { name: "Passenger Count", icon: "👥", description: "Current passengers", value: "42" },
      { name: "Route Status", icon: "🛣️", description: "Route completion", value: "On Time" },
      { name: "Next Stop", icon: "🚏", description: "Upcoming station", value: "Central" },
      { name: "Temperature", icon: "🌡️", description: "Interior temperature", value: "72°F" },
      { name: "Capacity", icon: "📊", description: "Capacity utilization", value: "65%" }
    ]
  },
  {
    title: "Bike Status",
    description: "Bike-sharing system metrics",
    metrics: [
      { name: "Available Bikes", icon: "🚲", description: "Bikes ready for use", value: "15" },
      { name: "Active Rides", icon: "🏃", description: "Current rentals", value: "8" },
      { name: "Station Status", icon: "🅿️", description: "Docking status", value: "Active" },
      { name: "Maintenance", icon: "🔧", description: "Service status", value: "Good" },
      { name: "Usage Rate", icon: "📈", description: "Hourly usage", value: "High" }
    ]
  },
  {
    title: "Truck Location",
    description: "Freight fleet tracking system",
    metrics: [
      { name: "Current Route", icon: "🛣️", description: "Active delivery route", value: "Route A-7" },
      { name: "Cargo Status", icon: "📦", description: "Shipment condition", value: "Secure" },
      { name: "ETA", icon: "⏰", description: "Estimated arrival", value: "2:30 PM" },
      { name: "Load Weight", icon: "⚖️", description: "Current cargo weight", value: "12.5t" },
      { name: "Fuel Economy", icon: "📉", description: "Miles per gallon", value: "6.2 MPG" }
    ]
  }
];

const iconOptions = ["📊", "📈", "📉", "🔍", "📡", "🎯", "💡", "⚡", "🔔", "📱"];

const AvailableDataSection: React.FC = () => {
  const [availableData, setAvailableData] = useState<DataCategory[]>([...defaultData]);
  const [isAddingWidget, setIsAddingWidget] = useState(false);
  const [newWidget, setNewWidget] = useState<DataCategory>({
    title: '',
    description: '',
    metrics: [],
    isCustom: true
  });
  const [currentMetric, setCurrentMetric] = useState({
    name: '',
    icon: iconOptions[0],
    description: '',
    value: '',
    options: ['']
  });
  const [showMetricForm, setShowMetricForm] = useState(false);

  useEffect(() => {
    const customWidgets = loadCustomWidgets();
    setAvailableData([...defaultData, ...customWidgets]);
  }, []);

  const saveCustomWidgets = (widgets: DataCategory[]) => {
    const customWidgets = widgets.filter(w => w.isCustom);
    localStorage.setItem('customWidgets', JSON.stringify(customWidgets));
  };

  const handleAddMetric = () => {
    if (currentMetric.name.trim()) {
      const metricToAdd = {
        ...currentMetric,
        ...(currentMetric.options?.some(opt => opt.trim() !== '') 
          ? { options: currentMetric.options.filter(opt => opt.trim() !== '') }
          : { value: currentMetric.value || 'N/A' })
      };

      setNewWidget(prev => ({
        ...prev,
        metrics: [...prev.metrics, metricToAdd]
      }));
      
      setCurrentMetric({
        name: '',
        icon: iconOptions[0],
        description: '',
        value: '',
        options: ['']
      });
      setShowMetricForm(false);
    }
  };

  const handleSaveWidget = () => {
    if (newWidget.title.trim() && newWidget.metrics.length > 0) {
      const updatedData = [...availableData, newWidget];
      setAvailableData(updatedData);
      saveCustomWidgets(updatedData);
      setIsAddingWidget(false);
      setNewWidget({
        title: '',
        description: '',
        metrics: [],
        isCustom: true
      });
    }
  };

  const handleDeleteWidget = (index: number) => {
    const updatedData = availableData.filter((_, i) => i !== index);
    setAvailableData(updatedData);
    saveCustomWidgets(updatedData);
  };

  return (
    <div className="available-data-grid">
      {availableData.map((category, index) => (
        <div key={index} className="data-category-card">
          <div className="category-header">
            <h3>{category.title}</h3>
            <p>{category.description}</p>
            {category.isCustom && (
              <button
                className="delete-widget-btn"
                onClick={() => handleDeleteWidget(index)}
              >
                ×
              </button>
            )}
          </div>
          <div className="metrics-grid">
            {category.metrics.map((metric, mIndex) => (
              <div key={mIndex} className="metric-item">
                <span className="metric-icon">{metric.icon}</span>
                <div className="metric-details">
                  <div className="metric-main">
                    <span className="metric-name">{metric.name}</span>
                    {metric.options ? (
                      <select className="metric-value-select">
                        {metric.options.map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="metric-value">{metric.value}</span>
                    )}
                  </div>
                  <span className="metric-description">{metric.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {!isAddingWidget ? (
        <button className="add-widget-btn" onClick={() => setIsAddingWidget(true)}>
          + Add Custom Widget
        </button>
      ) : (
        <div className="custom-widget-form">
          <h3>Create Custom Widget</h3>
          <input
            type="text"
            placeholder="Widget Title"
            value={newWidget.title}
            onChange={e => setNewWidget(prev => ({ ...prev, title: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Widget Description"
            value={newWidget.description}
            onChange={e => setNewWidget(prev => ({ ...prev, description: e.target.value }))}
          />

          {newWidget.metrics.map((metric, index) => (
            <div key={index} className="added-metric">
              <span>{metric.icon} {metric.name}</span>
              <span className="added-metric-value">
                {metric.options ? `(${metric.options.length} options)` : metric.value}
              </span>
            </div>
          ))}

          {showMetricForm ? (
            <div className="metric-form">
              <input
                type="text"
                placeholder="Metric Name"
                value={currentMetric.name}
                onChange={e => setCurrentMetric(prev => ({ ...prev, name: e.target.value }))}
              />
              <select
                value={currentMetric.icon}
                onChange={e => setCurrentMetric(prev => ({ ...prev, icon: e.target.value }))}
              >
                {iconOptions.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Metric Description"
                value={currentMetric.description}
                onChange={e => setCurrentMetric(prev => ({ ...prev, description: e.target.value }))}
              />
              
              <div className="metric-value-section">
                <div className="value-type-selector">
                  <label>
                    <input
                      type="radio"
                      name="valueType"
                      checked={!currentMetric.options?.length}
                      onChange={() => setCurrentMetric(prev => ({ ...prev, options: [] }))}
                    /> Single Value
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="valueType"
                      checked={!!currentMetric.options?.length}
                      onChange={() => setCurrentMetric(prev => ({ ...prev, options: [''] }))}
                    /> Multiple Options
                  </label>
                </div>

                {!currentMetric.options?.length ? (
                  <input
                    type="text"
                    placeholder="Metric Value (e.g., 75%)"
                    value={currentMetric.value}
                    onChange={e => setCurrentMetric(prev => ({ ...prev, value: e.target.value }))}
                    className="metric-value-input"
                  />
                ) : (
                  <div className="options-container">
                    {currentMetric.options?.map((option, index) => (
                      <div key={index} className="option-input-group">
                        <input
                          type="text"
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={e => {
                            const newOptions = [...currentMetric.options!];
                            newOptions[index] = e.target.value;
                            setCurrentMetric(prev => ({ ...prev, options: newOptions }));
                          }}
                        />
                        {index > 0 && (
                          <button
                            className="remove-option-btn"
                            onClick={() => {
                              const newOptions = currentMetric.options!.filter((_, i) => i !== index);
                              setCurrentMetric(prev => ({ ...prev, options: newOptions }));
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setCurrentMetric(prev => ({
                        ...prev,
                        options: [...prev.options!, '']
                      }))}
                      className="add-option-btn"
                    >
                      + Add Option
                    </button>
                  </div>
                )}
              </div>

              <div className="metric-form-buttons">
                <button onClick={handleAddMetric}>Add Metric</button>
                <button onClick={() => setShowMetricForm(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowMetricForm(true)}>+ Add Metric</button>
          )}

          <div className="widget-form-buttons">
            <button onClick={handleSaveWidget}>Save Widget</button>
            <button onClick={() => setIsAddingWidget(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableDataSection; 