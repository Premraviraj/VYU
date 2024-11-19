import React, { useState, useEffect, useCallback } from 'react';
import { VehicleStats } from '../../../data/vehicleData';
import { useWidgets } from '../../../context/WidgetContext';
import './KPIModal.css';
import { API_URL } from '../../../utils/config';

interface KPIModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedData: VehicleStats[];
  onKPICreated?: () => void;
}

interface KPIField {
  id: string;
  label: string;
  value: number;
  color: string;
  collection?: string;
  videoSource?: string;
  apiEndpoint?: string;
  icon?: string;
  format?: string;
  size?: string;
  showAdvanced?: boolean;
}

interface CollectionData {
  collection: string;
  fieldCounts: {
    [key: string]: number;
  };
}

interface FieldStyle {
  fontSize: string;
  fontWeight: string;
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
  icon?: string;
  animation?: string;
}

interface FieldTheme {
  name: string;
  background: string;
  textColor: string;
  accentColor: string;
  style: FieldStyle;
}

const KPIModal: React.FC<KPIModalProps> = ({ isOpen, onClose, selectedData, onKPICreated }) => {
  const [kpiTitle, setKpiTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [selectedKPIType, setSelectedKPIType] = useState<string>('modern');
  const { addWidget } = useWidgets();
  const [kpiFields, setKpiFields] = useState<KPIField[]>([]);
  const [availableCollections, setAvailableCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [availableVideoSources, setAvailableVideoSources] = useState<string[]>([]);
  const [selectedVideoSource, setSelectedVideoSource] = useState<string>('1');
  const [availableFields, setAvailableFields] = useState<{[key: string]: number}>({});
  const [showTemplates, setShowTemplates] = useState<boolean>(false);
  const [realTimeValues, setRealTimeValues] = useState<{[key: string]: number}>({});

  // Initialize available fields from selectedData
  React.useEffect(() => {
    if (selectedData.length > 0) {
      const availableFields = selectedData.flatMap(data => {
        const fields: KPIField[] = [];
        if (data.filteredStats?.RuleCounts) {
          Object.entries(data.filteredStats.RuleCounts).forEach(([key, value]) => {
            fields.push({
              id: `${data.vehicleType}-${key}-${Math.random()}`,
              label: key,
              value: value,
              color: getDefaultColor(key),
              format: 'number',
              size: 'medium'
            });
          });
        }
        return fields;
      });
      setKpiFields(availableFields);
    }
  }, [selectedData]);

  const getDefaultColor = (fieldName: string) => {
    switch (fieldName.toLowerCase()) {
      case 'entry': return '#059669';
      case 'exit': return '#dc2626';
      default: return '#4f46e5';
    }
  };

  const handleFieldUpdate = (fieldId: string, updates: Partial<KPIField>) => {
    setKpiFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  const handleAddField = () => {
    const newField: KPIField = {
      id: `custom-${Date.now()}`,
      label: 'New Field',
      value: 0,
      color: '#4f46e5',
      format: 'number',
      size: 'medium'
    };
    setKpiFields(prev => [...prev, newField]);
  };

  const handleRemoveField = (fieldId: string) => {
    setKpiFields(prev => prev.filter(field => field.id !== fieldId));
  };

  const formatOptions = [
    { value: 'number', label: 'Number' },
    { value: 'percentage', label: 'Percentage' },
    { value: 'currency', label: 'Currency' }
  ];

  const sizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ];

  const kpiTypes = [
    { type: 'modern', label: 'Modern Design', description: 'Clean and modern look' },
    { type: 'compact', label: 'Compact View', description: 'Space-efficient design' },
    { type: 'detailed', label: 'Detailed Stats', description: 'Comprehensive view' },
    { type: 'minimal', label: 'Minimal Design', description: 'Simple and elegant' }
  ];

  const colorOptions = [
    { label: 'White', value: '#ffffff' },
    { label: 'Light Blue', value: '#f0f9ff' },
    { label: 'Light Purple', value: '#f3e8ff' },
    { label: 'Light Green', value: '#f0fdf4' },
    { label: 'Light Yellow', value: '#fefce8' }
  ];

  const fieldThemes: FieldTheme[] = [
    {
      name: 'Modern',
      background: 'linear-gradient(145deg, #ffffff, #f3f4f6)',
      textColor: '#1e293b',
      accentColor: '#4f46e5',
      style: {
        fontSize: '1.5rem',
        fontWeight: '600',
        animation: 'fadeInUp'
      }
    },
    {
      name: 'Neon',
      background: '#1a1a1a',
      textColor: '#ffffff',
      accentColor: '#00ff88',
      style: {
        fontSize: '1.8rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        animation: 'glowPulse'
      }
    },
    {
      name: 'Minimal',
      background: '#ffffff',
      textColor: '#374151',
      accentColor: '#6b7280',
      style: {
        fontSize: '1.2rem',
        fontWeight: '500',
        animation: 'slideIn'
      }
    },
    // Add more themes...
  ];

  const fetchFieldData = async (field: KPIField) => {
    if (!field.collection || !field.videoSource || !field.label) return;

    try {
      const apiEndpoint = `${API_URL}/api/v1/Collection/filtered/count?collection=${field.collection}&VideoSource=${field.videoSource}&Rule=${field.label}`;
      
      const response = await fetch(apiEndpoint, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.fieldCounts && data.fieldCounts[field.label] !== undefined) {
          setRealTimeValues(prev => ({
            ...prev,
            [field.id]: data.fieldCounts[field.label]
          }));
        }
      }
    } catch (error) {
      console.error(`Error fetching data for field ${field.label}:`, error);
    }
  };

  useEffect(() => {
    if (!isOpen || kpiFields.length === 0) return;

    // Initial fetch for all fields
    kpiFields.forEach(field => {
      fetchFieldData(field);
    });

    // Set up interval for periodic updates
    const interval = setInterval(() => {
      kpiFields.forEach(field => {
        fetchFieldData(field);
      });
    }, 5000); // Update every 5 seconds

    // Cleanup interval on unmount or when modal closes
    return () => clearInterval(interval);
  }, [isOpen, kpiFields]); // Dependencies

  const getPreviewContent = () => {
    switch (selectedKPIType) {
      case 'modern':
        return (
          <div className="kpi-preview-modern" style={{ background: selectedColor }}>
            <h3>{kpiTitle || 'KPI Title'}</h3>
            <div className="kpi-fields-grid">
              {kpiFields.map((field) => (
                <div key={field.id} className="kpi-field" style={{ color: field.color }}>
                  <span className="field-label">{field.label}</span>
                  <span className="field-value">
                    {realTimeValues[field.id] !== undefined ? realTimeValues[field.id] : field.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'compact':
        return (
          <div className="kpi-preview-compact" style={{ background: selectedColor }}>
            <div className="compact-header">
              <h4>{kpiTitle || 'KPI Title'}</h4>
            </div>
            <div className="compact-fields">
              {kpiFields.map((field, index) => (
                <div key={index} className="compact-field" style={{ color: field.color }}>
                  <span className="field-value">{field.value}</span>
                  <span className="field-label">{field.label}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'detailed':
        return (
          <div className="kpi-preview-detailed" style={{ background: selectedColor }}>
            <div className="detailed-header">
              <h3>{kpiTitle || 'KPI Title'}</h3>
              <span className="last-updated">Last Updated: {new Date().toLocaleString()}</span>
            </div>
            <div className="detailed-fields">
              {kpiFields.map((field, index) => (
                <div key={index} className="detailed-field">
                  <div className="field-header" style={{ color: field.color }}>
                    {field.icon && <span className="field-icon">{field.icon}</span>}
                    <span className="field-label">{field.label}</span>
                  </div>
                  <div className="field-value" style={{ color: field.color }}>
                    {field.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'minimal':
        return (
          <div className="kpi-preview-minimal" style={{ background: selectedColor }}>
            <div className="minimal-content">
              {kpiFields.map((field, index) => (
                <div key={index} className="minimal-field">
                  <span className="field-label" style={{ color: field.color }}>
                    {field.label}
                  </span>
                  <span className="field-value">
                    {field.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Update the handleCreateKPI function
  const handleCreateKPI = () => {
    const widgetId = `kpi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log('Creating KPI widget with fields:', kpiFields); // Debug log

    const kpiContent = `
      <div class="kpi-widget kpi-${selectedKPIType}" style="background-color: ${selectedColor};" id="${widgetId}">
        <h3 class="kpi-title">${kpiTitle || 'Vehicle Statistics'}</h3>
        <div class="kpi-fields ${selectedKPIType}-fields">
          ${kpiFields.map(field => {
            const collection = field.collection || selectedData[0]?.vehicleType;
            const videoSource = field.videoSource || selectedData[0]?.filteredStats?.VideoSource;
            
            console.log('Field data:', { collection, videoSource, field }); // Debug log

            return `
              <div 
                class="kpi-field ${selectedKPIType}-field" 
                data-field-id="${field.id}"
                data-type="${field.label}"
                data-collection="${collection}"
                data-video-source="${videoSource}"
              >
                <div class="field-label">${field.label}</div>
                <div class="field-value" style="color: ${field.color};">
                  ${field.value}
                </div>
                ${field.icon ? `<div class="field-icon">${field.icon}</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    console.log('Generated KPI content:', kpiContent); // Debug log

    const newWidget = {
      type: 'kpi' as const,
      id: widgetId,
      title: kpiTitle || 'Vehicle Statistics',
      content: kpiContent,
      backgroundColor: selectedColor,
      fields: kpiFields.map(field => ({
        ...field,
        collection: field.collection || selectedData[0]?.vehicleType,
        videoSource: field.videoSource || selectedData[0]?.filteredStats?.VideoSource
      }))
    };

    console.log('Adding new widget:', newWidget); // Debug log
    addWidget(newWidget);
    onClose();
    onKPICreated?.();
  };

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
        const data: CollectionData = await response.json();
        setAvailableFields(data.fieldCounts);
      }
    } catch (error) {
      console.error('Error fetching fields:', error);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const toggleFieldAdvanced = (fieldId: string) => {
    setKpiFields(prev => prev.map(field => 
      field.id === fieldId 
        ? { ...field, showAdvanced: !field.showAdvanced || false }
        : field
    ));
  };

  const applyThemeToFields = (theme: FieldTheme) => {
    setKpiFields(prev => prev.map(field => ({
      ...field,
      color: theme.accentColor,
      fontSize: theme.style.fontSize,
      fontWeight: theme.style.fontWeight,
      textTransform: theme.style.textTransform
    })));
  };

  if (!isOpen) return null;

  return (
    <div className="kpi-modal-overlay">
      <div className="kpi-modal">
        <div className="kpi-modal-header">
          <h2>Configure KPI Card</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="kpi-modal-content">
          {/* Title Input */}
          <div className="config-section">
            <h3>Card Title</h3>
            <input
              type="text"
              value={kpiTitle}
              onChange={(e) => setKpiTitle(e.target.value)}
              placeholder="Enter KPI title"
              className="kpi-title-input"
            />
          </div>

          {/* KPI Type Selection */}
          <div className="config-section">
            <h3>Select Design</h3>
            <div className="kpi-types-grid">
              {kpiTypes.map(type => (
                <div
                  key={type.type}
                  className={`kpi-type-option ${selectedKPIType === type.type ? 'selected' : ''}`}
                  onClick={() => setSelectedKPIType(type.type)}
                >
                  <h4>{type.label}</h4>
                  <p>{type.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Field Configuration */}
          <div className="config-section field-config">
            <div className="section-header">
              <h3>Configure Fields</h3>
              <div className="field-actions">
                <button className="add-field-button" onClick={handleAddField}>
                  <span className="icon">+</span>
                  Add Field
                </button>
              </div>
            </div>

            {/* Data Selection Flow */}
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
                        className={`field-item ${kpiFields.some(f => f.label === field) ? 'selected' : ''}`}
                        onClick={() => {
                          const fieldId = `${selectedCollection}-${field}-${Date.now()}`;
                          const newField: KPIField = {
                            id: fieldId,
                            label: field,
                            value: value,
                            color: getDefaultColor(field),
                            collection: selectedCollection,
                            videoSource: selectedVideoSource,
                            apiEndpoint: `${API_URL}/api/v1/Collection/filtered/count?collection=${selectedCollection}&Rule=${field}&VideoSource=${selectedVideoSource}`,
                            format: 'number',
                            size: 'medium'
                          };
                          setKpiFields(prev => [...prev, newField]);
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

            {/* Field Styling Configuration */}
            <div className="fields-config">
              {kpiFields.map((field) => (
                <div key={field.id} className="field-config-item">
                  <div className="field-main">
                    <div className="field-header">
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => handleFieldUpdate(field.id, { label: e.target.value })}
                        placeholder="Field Label"
                        className="field-label-input"
                      />
                      <div className="field-actions">
                        <button 
                          className="field-action-btn"
                          onClick={() => toggleFieldAdvanced(field.id)}
                        >
                          <span className="icon">⚙️</span>
                        </button>
                        <button
                          className="field-action-btn remove"
                          onClick={() => handleRemoveField(field.id)}
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    {field.showAdvanced && (
                      <div className="field-advanced">
                        <div className="style-section">
                          <h5>Appearance</h5>
                          <div className="style-options">
                            <div className="style-group">
                              <label>Size</label>
                              <select
                                value={field.size}
                                onChange={(e) => handleFieldUpdate(field.id, { size: e.target.value })}
                              >
                                {sizeOptions.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="style-group">
                              <label>Format</label>
                              <select
                                value={field.format}
                                onChange={(e) => handleFieldUpdate(field.id, { format: e.target.value })}
                              >
                                {formatOptions.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="style-group">
                              <label>Color</label>
                              <div className="color-picker">
                                <input
                                  type="color"
                                  value={field.color}
                                  onChange={(e) => handleFieldUpdate(field.id, { color: e.target.value })}
                                />
                                <span className="color-preview" style={{ background: field.color }} />
                              </div>
                            </div>

                            <div className="style-group">
                              <label>Icon</label>
                              <div className="icon-selector">
                                {/* Add icon selection */}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="animation-section">
                          <h5>Animation</h5>
                          <div className="animation-options">
                            {/* Add animation options */}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="config-section">
            <h3>Background Color</h3>
            <div className="color-options">
              {colorOptions.map(color => (
                <button
                  key={color.value}
                  className={`color-option ${selectedColor === color.value ? 'selected' : ''}`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setSelectedColor(color.value)}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Preview Section */}
          <div className="config-section">
            <h3>Preview</h3>
            <div className="kpi-preview">
              {getPreviewContent()}
            </div>
          </div>
        </div>

        <div className="kpi-modal-footer">
          <button className="create-button" onClick={handleCreateKPI}>
            Create KPI Card
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default KPIModal; 