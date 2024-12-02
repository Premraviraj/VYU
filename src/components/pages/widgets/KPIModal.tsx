import React, { useState, useEffect } from 'react';
import { VehicleStats } from '../../../data/vehicleData';
import { 
  KPIModalProps, 
  CollectionData,
  VehicleStatsData,
  KPIFieldUpdate
} from '../../../types/kpi';
import './KPIModal.css';
import { API_URL } from '../../../utils/config';
import {
  Dashboard, TrendingUp, Assessment,
  PieChart, BarChart,
  ShowChart, BubbleChart, DonutLarge, Insights, Analytics, 
  Speed, Timer, AccessTime, CalendarToday, Event,
  Person, Group, Groups, Business, Store,
  LocalShipping, DirectionsCar, FlightTakeoff, Train,
  Security, Shield, Gavel, VerifiedUser,
  Notifications, Warning, Error as ErrorIcon, CheckCircle
} from '@mui/icons-material';
import { kpiApi } from '../../../api/kpiApi';
import { toast } from 'react-hot-toast';

const CollectionIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    className="collection-svg-icon" 
    fill="none" 
    stroke="currentColor"
  >
    <path 
      d="M7 7h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M5 5h10a2 2 0 012 2v10" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      strokeDasharray="2 2"
    />
    <path 
      d="M3 3h10a2 2 0 012 2v10" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      strokeDasharray="2 2"
      opacity="0.5"
    />
  </svg>
);

const VideoSourceIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    className="video-source-svg-icon" 
    fill="none" 
    stroke="currentColor"
  >
    <path 
      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <rect 
      x="3" 
      y="6" 
      width="12" 
      height="12" 
      rx="2" 
      ry="2" 
      strokeWidth="2"
    />
    <circle 
      cx="9" 
      cy="12" 
      r="1" 
      fill="currentColor"
    />
  </svg>
);

// Update the KPIField interface
interface KPIField {
  id: string;
  label: string;
  value: number;
  color: string;  // Make color required
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  collection?: string;
  videoSource?: string;
  showAdvanced?: boolean;  // Add showAdvanced property
}

const KPIModal: React.FC<KPIModalProps> = ({ isOpen, onClose, selectedData, onKPICreated }) => {
  const [kpiTitle, setKpiTitle] = useState('');
  const [selectedKPIType, setSelectedKPIType] = useState<string>('modern');
  const [kpiFields, setKpiFields] = useState<KPIField[]>([]);
  const [availableCollections, setAvailableCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [availableVideoSources, setAvailableVideoSources] = useState<string[]>([]);
  const [selectedVideoSource, setSelectedVideoSource] = useState<string>('1');
  const [availableFields, setAvailableFields] = useState<{[key: string]: number}>({});
  const [realTimeValues, setRealTimeValues] = useState<{[key: string]: number}>({});
  const [graphTitle, setGraphTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
              value: value as number,
              color: getDefaultColor(key)
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

  const handleFieldUpdate = (fieldId: string, updates: KPIFieldUpdate) => {
    setKpiFields(prev => prev.map(field => 
      field.id === fieldId ? {
        ...field,
        ...updates
      } : field
    ));
  };

  const handleRemoveField = (fieldId: string) => {
    setKpiFields(prev => prev.filter(field => field.id !== fieldId));
  };

  const kpiTypes = [
    { type: 'modern', label: 'Modern Design', description: 'Clean and modern look' },
    { type: 'gradient', label: 'Gradient Design', description: 'Smooth gradient with glass effect' },
    { type: 'minimal', label: 'Minimal Design', description: 'Clean and simple layout' },
    { type: 'neon', label: 'Neon Design', description: 'Vibrant neon effect' },
    { type: 'dashboard', label: 'Dashboard Design', description: 'Professional dashboard style' }
  ];

  // Update the fetchFieldData function
  const fetchFieldData = async (field: KPIField) => {
    // Create a compatible field object for the API
    const apiField = {
      id: field.id,
      label: field.label,
      value: field.value,
      color: field.color || '#4f46e5',
      collection: field.collection,
      videoSource: field.videoSource
    };

    // Update the URL parameters to match backend expectations
    const response = await fetch(
      `${API_URL}/api/v1/Collection/filtered?collection=${encodeURIComponent(field.collection || '')}&VideoSource=${encodeURIComponent(field.videoSource || '')}&Rule=${encodeURIComponent(field.label)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data && data.fieldCounts && data.fieldCounts[field.label] !== undefined) {
        setRealTimeValues(prev => ({
          ...prev,
          [field.id]: data.fieldCounts[field.label]
        }));
      }
    }
  };

  useEffect(() => {
    if (!isOpen || kpiFields.length === 0) return;

    // Initial fetch for all fields
    kpiFields.forEach(field => {
      fetchFieldData(field);
    });

    // Set up interval for updates
    const interval = setInterval(() => {
      kpiFields.forEach(field => {
        if (field.collection && field.videoSource) {
          fetchFieldData(field);
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [kpiFields, isOpen]);

  // Update the preview field rendering
  const renderPreviewField = (field: KPIField) => {
    // Find the icon component if one is specified
    const iconComponent = field.icon ? 
      iconOptions
        .flatMap(category => category.icons)
        .find(i => i.name === field.icon)?.icon 
      : null;

    // Convert the field value to a string or number
    const displayValue = realTimeValues[field.id] !== undefined 
      ? realTimeValues[field.id].toString()
      : field.value.toString();

    return (
      <div 
        key={field.id} 
        className={`kpi-field ${field.size || 'medium'}`}
        style={{ color: field.color }}
      >
        {iconComponent && <div className="field-icon">{iconComponent}</div>}
        <div className="field-value">{displayValue}</div>
        <div className="field-label">{field.label}</div>
      </div>
    );
  };

  // Update the field selection rendering
  const renderSelectionField = (fieldName: string, value: number) => (
    <div className="field-content">
      <div className="field-name">{String(fieldName)}</div>
      <div className="field-count">
        <span className="count-value">{String(value)}</span>
        <span className="count-label">entries</span>
      </div>
    </div>
  );

  // Update the preview content section
  const getPreviewContent = () => (
    <div className={`kpi-preview-${selectedKPIType}`}>
      <div className="kpi-main-content">
        <div className="kpi-header">
          <h3 className="kpi-title">{kpiTitle || 'KPI Card'}</h3>
        </div>
        <div className="kpi-fields-container">
          {kpiFields.map(field => renderPreviewField(field))}
        </div>
      </div>
    </div>
  );

  const getSizeStyle = (size: string): string => {
    switch (size) {
      case 'small': return '0.875rem';
      case 'large': return '1.5rem';
      default: return '1.125rem'; // medium
    }
  };

  // Update the handleCreateKPI function
  const handleCreateKPI = async () => {
    const widgetId = `kpi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Format data for KPI collection
    const kpiCardData = {
      kpi_id: widgetId,
      kpi_name: kpiTitle || 'Vehicle Statistics',
      kpi_type: 'kpi',
      design_type: selectedKPIType,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      fields: kpiFields.map(field => ({
        field_id: field.id,
        field_name: field.label,
        field_value: field.value,
        collection_name: field.collection || selectedData[0]?.vehicleType,
        video_source: field.videoSource || selectedData[0]?.filteredStats?.VideoSource,
        rule_name: field.label,
        styling: {
          color: field.color,
          size: field.size || 'medium',
          icon: field.icon
        }
      })),
      config: {
        refresh_interval: 5000,
        layout: {
          columns: 2,
          gap: '1rem'
        }
      }
    };

    try {
      // Send to VYU API
      const response = await fetch(`${API_URL}/api/v1/kpiCards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(kpiCardData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Server error details:', errorData);
        throw new Error('Failed to save KPI card');
      }

      const savedCard = await response.json();
      console.log('KPI Card saved successfully:', savedCard);

      // Close modal and notify parent
      onClose();
      onKPICreated?.();
    } catch (error) {
      console.error('Error saving KPI card:', error);
      // Just close the modal on error
      onClose();
      onKPICreated?.();
    }
  };

  // Helper function to generate KPI content
  const generateKPIContent = (widgetId: string, fields: KPIField[]) => {
    return `
      <div class="kpi-widget kpi-${selectedKPIType}" id="${widgetId}">
        <div class="kpi-header">
          <h3 class="kpi-title">${kpiTitle || 'Vehicle Statistics'}</h3>
        </div>
        <div class="kpi-fields">
          ${fields.map(field => {
            const collection = field.collection || selectedData[0]?.vehicleType;
            const videoSource = field.videoSource || selectedData[0]?.filteredStats?.VideoSource;
            
            return `
              <div 
                class="kpi-field ${field.size || 'medium'}"
                data-field-id="${field.id}"
                data-type="${field.label}"
                data-collection="${collection}"
                data-video-source="${videoSource}"
                style="color: ${field.color};"
              >
                ${field.icon ? `<div class="field-icon">${field.icon}</div>` : ''}
                <div class="field-value">
                  ${field.value}
                </div>
                <div class="field-label">${field.label}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  };

  const fetchCollections = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching collections...');
      const collections = await kpiApi.fetchCollections();
      console.log('Received collections:', collections);
      setAvailableCollections(collections);
    } catch (error) {
      console.error('Failed to fetch collections:', error);
      toast.error('Failed to fetch collections');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVideoSources = async (collection: string) => {
    try {
      setIsLoading(true);
      console.log('Fetching video sources for collection:', collection);
      const sources = await kpiApi.fetchVideoSources(collection);
      console.log('Received video sources:', sources);
      setAvailableVideoSources(sources);
    } catch (error) {
      console.error('Failed to fetch video sources:', error);
      toast.error('Failed to fetch video sources. Please check server connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFields = async (collection: string, videoSource: string) => {
    try {
      setIsLoading(true);
      console.log('Fetching fields for:', { collection, videoSource });
      const fields = await kpiApi.fetchFields(collection, videoSource);
      console.log('Received fields:', fields);
      setAvailableFields(fields);
    } catch (error) {
      console.error('Failed to fetch fields:', error);
      toast.error('Failed to fetch fields. Please check server connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const iconOptions = [
    { category: 'Analytics', icons: [
      { icon: <Dashboard />, name: 'Dashboard' },
      { icon: <TrendingUp />, name: 'Trending' },
      { icon: <Assessment />, name: 'Assessment' },
      { icon: <Analytics />, name: 'Analytics' },
      { icon: <Insights />, name: 'Insights' }
    ]},
    { category: 'Charts', icons: [
      { icon: <PieChart />, name: 'Pie Chart' },
      { icon: <BarChart />, name: 'Bar Chart' },
      { icon: <ShowChart />, name: 'Line Chart' },
      { icon: <BubbleChart />, name: 'Bubble Chart' },
      { icon: <DonutLarge />, name: 'Donut Chart' }
    ]},
    { category: 'Time', icons: [
      { icon: <Speed />, name: 'Speed' },
      { icon: <Timer />, name: 'Timer' },
      { icon: <AccessTime />, name: 'Clock' },
      { icon: <CalendarToday />, name: 'Calendar' },
      { icon: <Event />, name: 'Event' }
    ]},
    { category: 'People', icons: [
      { icon: <Person />, name: 'Person' },
      { icon: <Group />, name: 'Group' },
      { icon: <Groups />, name: 'Groups' },
      { icon: <Business />, name: 'Business' },
      { icon: <Store />, name: 'Store' }
    ]},
    { category: 'Transport', icons: [
      { icon: <LocalShipping />, name: 'Shipping' },
      { icon: <DirectionsCar />, name: 'Car' },
      { icon: <FlightTakeoff />, name: 'Flight' },
      { icon: <Train />, name: 'Train' }
    ]},
    { category: 'Status', icons: [
      { icon: <Security />, name: 'Security' },
      { icon: <Shield />, name: 'Shield' },
      { icon: <Gavel />, name: 'Rules' },
      { icon: <VerifiedUser />, name: 'Verified' }
    ]},
    { category: 'Alerts', icons: [
      { icon: <Notifications />, name: 'Notification' },
      { icon: <Warning />, name: 'Warning' },
      { icon: <ErrorIcon />, name: 'Error' },
      { icon: <CheckCircle />, name: 'Success' }
    ]}
  ];

  // Update the handleFieldSelection function
  const handleFieldSelection = (fieldName: string, value: number) => {
    if (kpiFields.some(f => f.label === fieldName)) {
      setKpiFields(prev => prev.filter(f => f.label !== fieldName));
      return;
    }

    const newField: KPIField = {
      id: `${selectedCollection}-${fieldName}-${Math.random()}`,
      label: fieldName,
      value: Number(value) || 0,
      color: getDefaultColor(fieldName),
      collection: selectedCollection,
      videoSource: selectedVideoSource,
      size: 'medium',
      showAdvanced: false  // Initialize showAdvanced
    };

    console.log('Adding new field:', newField);
    setKpiFields(prev => [...prev, newField]);
  };

  // Update the field selection UI
  const FieldSelection = () => (
    <div className="selection-group">
      <h4>Select Fields</h4>
      <div className="fields-grid">
        {Object.entries(availableFields).map(([fieldName, value]) => (
          <div
            key={fieldName}
            className={`field-item ${kpiFields.some(f => f.label === fieldName) ? 'selected' : ''}`}
            onClick={() => handleFieldSelection(fieldName, value)}
          >
            {renderSelectionField(fieldName, value)}
          </div>
        ))}
      </div>
    </div>
  );

  // Add useEffect to monitor state changes
  useEffect(() => {
    console.log('Selected collection changed:', selectedCollection);
  }, [selectedCollection]);

  useEffect(() => {
    console.log('Available video sources changed:', availableVideoSources);
  }, [availableVideoSources]);

  useEffect(() => {
    console.log('Selected video source changed:', selectedVideoSource);
  }, [selectedVideoSource]);

  useEffect(() => {
    console.log('Available fields changed:', availableFields);
  }, [availableFields]);

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

          {/* Field Configuration with Data Selection */}
          <div className="config-section">
            <h3>Data Selection</h3>
            <div className="data-selection-flow">
              {/* Collection Selection */}
              <div className="selection-group">
                <h4>Select Collection</h4>
                {isLoading ? (
                  <div className="loading">Loading collections...</div>
                ) : (
                  <div className="collection-buttons">
                    {availableCollections.map(collection => (
                      <button
                        key={collection}
                        className={`collection-btn ${selectedCollection === collection ? 'selected' : ''}`}
                        onClick={() => {
                          console.log('Selecting collection:', collection);
                          setSelectedCollection(collection);
                          setSelectedVideoSource(''); // Reset video source when collection changes
                          setAvailableFields({}); // Reset fields
                          fetchVideoSources(collection);
                        }}
                      >
                        <div className="collection-content">
                          <div className="collection-icon">
                            <CollectionIcon />
                          </div>
                          <div className="collection-info">
                            <span className="collection-name">{collection}</span>
                            {selectedCollection === collection && (
                              <span className="collection-status">Selected</span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Video Source Selection */}
              {selectedCollection && (
                <div className="selection-group">
                  <h4>Select Video Source</h4>
                  {isLoading ? (
                    <div className="loading">Loading video sources...</div>
                  ) : (
                    <div className="source-buttons">
                      {availableVideoSources.map((source) => (
                        <div
                          key={source}
                          className={`source-btn ${selectedVideoSource === source ? 'selected' : ''}`}
                          onClick={() => {
                            console.log('Selected video source:', source);
                            setSelectedVideoSource(source);
                            fetchFields(selectedCollection, source);
                          }}
                        >
                          <div className="source-content">
                            <div className="source-icon">
                              <VideoSourceIcon />
                            </div>
                            <div className="source-info">
                              <span className="source-number">Source {source}</span>
                              <span className="source-status">Active</span>
                            </div>
                          </div>
                          {selectedVideoSource === source && (
                            <div className="source-indicator">
                              <div className="pulse-dot"></div>
                              <span>Selected</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Separate section for field selection and configuration */}
          {selectedCollection && selectedVideoSource && (
            <div className="config-section">
              <h3>Available Fields</h3>
              {isLoading ? (
                <div className="loading">Loading fields...</div>
              ) : Object.keys(availableFields).length > 0 ? (
                <div className="fields-selection-grid">
                  {Object.entries(availableFields).map(([fieldName, value]) => (
                    <div
                      key={fieldName}
                      className={`field-selection-card ${kpiFields.some(f => f.label === fieldName) ? 'selected' : ''}`}
                      onClick={() => {
                        console.log('Selected field:', fieldName, 'value:', value);
                        handleFieldSelection(fieldName, value);
                      }}
                    >
                      <div className="field-card-content">
                        <div className="field-card-header">
                          <span className="field-card-name">{fieldName}</span>
                          {kpiFields.some(f => f.label === fieldName) && (
                            <span className="field-selected-badge">Selected</span>
                          )}
                        </div>
                        <div className="field-card-value">
                          <span className="value-number">{value}</span>
                          <span className="value-label">Current Count</span>
                        </div>
                        <div className="field-card-footer">
                          <button 
                            className="select-field-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFieldSelection(fieldName, value);
                            }}
                          >
                            {kpiFields.some(f => f.label === fieldName) ? 'Remove' : 'Select Field'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-fields">No fields available for this source</div>
              )}
            </div>
          )}

          {/* Selected Fields Configuration */}
          {kpiFields.length > 0 && (
            <div className="config-section">
              <h3>Selected Fields Configuration</h3>
              <div className="selected-fields-config">
                {kpiFields.map((field) => (
                  <div key={field.id} className="field-config-item">
                    <div className="field-header">
                      <div className="field-info">
                        <span className="field-name">{field.label}</span>
                        <span className="field-value">
                          {realTimeValues[field.id] !== undefined ? realTimeValues[field.id] : field.value}
                        </span>
                      </div>
                      <div className="field-actions">
                        <button 
                          className="field-action-btn"
                          onClick={() => setKpiFields(prev => prev.map(f => 
                            f.id === field.id ? { ...f, showAdvanced: !f.showAdvanced } : f
                          ))}
                        >
                          ⚙️
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
                        {/* Field styling options */}
                        <div className="style-section">
                          <h5>Appearance</h5>
                          <div className="style-options">
                            {/* Size selection */}
                            <div className="style-group">
                              <label>Size</label>
                              <select
                                value={field.size || 'medium'}
                                onChange={(e) => handleFieldUpdate(field.id, { 
                                  size: e.target.value as 'small' | 'medium' | 'large' 
                                })}
                              >
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                              </select>
                            </div>

                            {/* Color selection */}
                            <div className="style-group">
                              <label>Color</label>
                              <input
                                type="color"
                                value={field.color}
                                onChange={(e) => handleFieldUpdate(field.id, { color: e.target.value })}
                              />
                            </div>

                            {/* Icon selection */}
                            <div className="style-group">
                              <label>Icon</label>
                              <div className="icon-selector">
                                {iconOptions.map(category => (
                                  <div key={category.category} className="icon-category">
                                    {category.icons.map(icon => (
                                      <button
                                        key={icon.name}
                                        className={`icon-option ${field.icon === icon.name ? 'selected' : ''}`}
                                        onClick={() => handleFieldUpdate(field.id, {
                                          icon: icon.name,
                                          customIcon: icon.icon
                                        })}
                                        title={icon.name}
                                      >
                                        {icon.icon}
                                      </button>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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