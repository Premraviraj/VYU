import React, { useState, useEffect } from 'react';
import { VehicleStats } from '../../../data/vehicleData';
import { 
  KPIModalProps,
  CollectionData,
  KPIFieldUpdate,
  VehicleStatsData,
  KPIField
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
  Notifications, Warning, Error as ErrorIcon, CheckCircle,
  ArrowForward, ArrowBack, StorageRounded
} from '@mui/icons-material';
import { kpiApi } from '../../../api/kpiApi';
import { toast } from 'react-hot-toast';

// Add debounce utility at the top of the file
const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

// Add these interfaces at the top of the file
interface CollectionItem {
  collection: string;
  VideoSource: string;
  rule?: string;
}

interface RuleCount {
  Rule: string;
  Count: number;
}

interface SourceData {
  VideoSource: string;
  rules: RuleCount[];
}

interface APIResponse {
  fieldCounts: { [key: string]: number };
  sourceData: SourceData[];
}

interface DataItem {
  VideoSource: string;
  Rule: string;
  Count: number;
}

// Add this helper function at the top of the file
const getUniqueSortedValues = (arr: string[]): string[] => {
  return Array.from(new Set(arr)).sort((a, b) => Number(a) - Number(b));
};

// Add iconOptions definition back
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

// Add iconMap definition
const iconMap: { [key: string]: JSX.Element } = {
  'Entry': <ArrowForward />,
  'Exit': <ArrowBack />,
  'Count': <Assessment />,
  'Vehicle': <DirectionsCar />,
  'Default': <Assessment />
};

// Update the processRawData function to better handle the data structure
const processRawData = (data: any[]): SourceData[] => {
  console.log('Processing raw data:', data);
  
  // Group data by VideoSource
  const sourceMap = new Map<string, Map<string, number>>();

  data.forEach(item => {
    const source = item.VideoSource?.toString();
    const rule = item.Rule;
    const count = item.Count || 1;

    if (!source || !rule) return;

    if (!sourceMap.has(source)) {
      sourceMap.set(source, new Map());
    }

    const ruleMap = sourceMap.get(source)!;
    ruleMap.set(rule, (ruleMap.get(rule) || 0) + count);
  });

  const result = Array.from(sourceMap.entries())
    .map(([source, ruleMap]) => ({
      VideoSource: source,
      rules: Array.from(ruleMap.entries()).map(([rule, count]) => ({
        Rule: rule,
        Count: count
      }))
    }))
    .sort((a, b) => Number(a.VideoSource) - Number(b.VideoSource));

  console.log('Processed source data:', result);
  return result;
};

// First, let's define an interface for the data items
interface DataItem {
  VideoSource: string;
  Rule: string;
  Count: number;
}

const KPIModal: React.FC<KPIModalProps> = ({ isOpen, onClose, selectedData, onKPICreated }) => {
  const [kpiTitle, setKpiTitle] = useState('');
  const [selectedKPIType, setSelectedKPIType] = useState<string>('modern');
  const [kpiFields, setKpiFields] = useState<KPIField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [realTimeValues, setRealTimeValues] = useState<{[key: string]: number}>({});
  const [graphTitle, setGraphTitle] = useState('');
  const [cardLayout, setCardLayout] = useState<'single' | 'multi'>('single');
  const [availableCollections, setAvailableCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [selectedVideoSource, setSelectedVideoSource] = useState<string>('');
  const [availableVideoSources, setAvailableVideoSources] = useState<string[]>([]);
  const [isLoadingVideoSources, setIsLoadingVideoSources] = useState(false);
  const [availableFields, setAvailableFields] = useState<{[key: string]: number}>({});
  const [rawData, setRawData] = useState<any[]>([]);

  // Initialize available fields from selectedData
  React.useEffect(() => {
    if (selectedData.length > 0) {
      const availableFields = selectedData.flatMap(data => {
        const fields: KPIField[] = [];
        
        // Handle rule counts from the new data structure
        if (data.sourceData) {
          data.sourceData.forEach(source => {
            source.rules.forEach(rule => {
              fields.push({
                id: `${source.VideoSource}-${rule.Rule}-${Math.random()}`,
                label: rule.Rule,
                value: rule.Count,
                color: getDefaultColor(rule.Rule),
                collection: data.collection || '',
                videoSource: source.VideoSource,
                ruleCounts: source.rules
              });
            });
          });
        }
        
        // Fallback to old structure if needed
        else if (data.filteredStats?.RuleCounts) {
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
      
      // Initialize collections and video sources
      const collections = new Set<string>();
      const videoSources = new Set<string>();
      
      selectedData.forEach(data => {
        if (data.collection) collections.add(data.collection);
        if (data.sourceData) {
          data.sourceData.forEach(source => {
            videoSources.add(source.VideoSource);
          });
        }
      });
      
      setAvailableCollections(Array.from(collections));
      setAvailableVideoSources(Array.from(videoSources));
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
    { type: 'modern', label: 'Modern Design', description: 'Clean and modern look with real-time updates' }
  ];

  // Update the fetchFieldData function
  const fetchFieldData = async (field: KPIField) => {
    if (!field.collection || !field.videoSource) return;

    try {
      const response = await fetch(
        `${API_URL}/api/v1/Collection/data?collection=${encodeURIComponent(field.collection)}&VideoSource=${encodeURIComponent(field.videoSource)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          signal: AbortSignal.timeout(5000)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch field data');
      }

      const data: APIResponse = await response.json();
      
      if (data.sourceData?.length > 0) {
        const sourceInfo = data.sourceData.find(s => s.VideoSource === field.videoSource);
        if (sourceInfo) {
          // Find the matching rule in the source
          const ruleInfo = sourceInfo.rules.find(r => r.Rule === field.label);
          if (ruleInfo) {
            setRealTimeValues(prev => ({
              ...prev,
              [field.id]: ruleInfo.Count
            }));
          }
          
          // Update rule counts
          setKpiFields(prev => prev.map(f => 
            f.id === field.id ? {
              ...f,
              ruleCounts: sourceInfo.rules
            } : f
          ));
        }
      }
    } catch (error) {
      console.error('Error fetching field data:', error);
      // Keep existing value on error
      setRealTimeValues(prev => ({
        ...prev,
        [field.id]: field.value
      }));
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
    const iconComponent = field.icon ? 
      iconOptions
        .flatMap(category => category.icons)
        .find(i => i.name === field.icon)?.icon 
      : iconMap[field.label] || iconMap['Default'];

    const displayValue = realTimeValues[field.id] !== undefined 
      ? realTimeValues[field.id].toLocaleString()
      : field.value.toLocaleString();

    return (
      <div 
        key={field.id} 
        className={`kpi-field ${field.size || 'medium'}`}
        style={{ color: field.color }}
      >
        {iconComponent && <div className="field-icon">{iconComponent}</div>}
        <div className="field-value">{displayValue}</div>
        <div className="field-label">{field.label}</div>
        {field.showAdvanced && field.ruleCounts && (
          <div className="rule-counts-container">
            <h4>Rule Counts for {field.videoSource}:</h4>
            <div className="rule-counts-list">
              {field.ruleCounts.map((ruleCount, index) => (
                <div key={index} className="rule-count-item">
                  <span className="rule-name">{ruleCount.Rule}</span>
                  <span className="rule-count">{ruleCount.Count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
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
  const getPreviewContent = () => {
    if (cardLayout === 'single') {
      return (
        <div className="kpi-preview-container">
          <div className="kpi-preview-modern">
            <div className="kpi-header">
              <div className="kpi-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="kpi-title">{kpiTitle || 'Card Title'}</h3>
            </div>
            <div className="kpi-fields-container">
              {kpiFields.map((field) => (
                <div key={field.id} className="field-group">
                  <div className="field-value">
                    {Number(field.value).toLocaleString()}
                  </div>
                  <div className="field-label">{field.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Multi-card layout - update the container classes and styling
    return (
      <div className="kpi-preview-container">
        <div className="kpi-preview-modern">
          <div className="kpi-header">
            <div className="kpi-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
              </svg>
            </div>
            <h3 className="kpi-title">{kpiTitle || 'Card Title'}</h3>
          </div>
          <div className="kpi-fields-container multi">
            {kpiFields.map((field) => (
              <div key={field.id} className="field-group compact">
                <div className="field-value">
                  {Number(field.value).toLocaleString()}
                </div>
                <div className="field-label">{field.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

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

  // Add this function to handle layout switching
  const handleLayoutChange = (newLayout: 'single' | 'multi') => {
    if (newLayout === 'single' && kpiFields.length > 1) {
      toast('Cannot switch to single card when multiple fields are selected. Please remove extra fields first.', {
        icon: '⚠️',
        style: {
          background: '#fff7ed',
          color: '#9a3412',
          border: '1px solid #fed7aa'
        }
      });
      return;
    }
    setCardLayout(newLayout);
  };

  // Update fetchCollections function to handle different response formats
  const fetchCollections = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8080/api/v1/allCollections', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Raw collections response:', data); // Debug log
      
      // Handle different response formats
      let collections: string[] = [];
      
      if (data) {
        if (Array.isArray(data)) {
          // If data is already an array
          collections = data
            .filter(item => item && typeof item === 'string')
            .filter(collection => !['Widgets', 'KpiCards'].includes(collection));
        } else if (typeof data === 'object') {
          // If data is an object
          if (data.collections && Array.isArray(data.collections)) {
            // If data has a collections array property
            collections = data.collections
              .filter(item => item && typeof item === 'string')
              .filter(collection => !['Widgets', 'KpiCards'].includes(collection));
          } else {
            // If data is an object with collection names as keys or values
            collections = Object.keys(data)
              .filter(key => !['Widgets', 'KpiCards'].includes(key));
          }
        }
      }

      // Sort collections alphabetically
      collections.sort();
      console.log('Processed collections:', collections); // Debug log

      setAvailableCollections(collections);
      
      // Select first collection by default if none selected
      if (collections.length > 0 && !selectedCollection) {
        setSelectedCollection(collections[0]);
        fetchVideoSources(collections[0]);
      }
    } catch (error) {
      console.error('Failed to fetch collections:', error);
      toast.error('Failed to fetch collections');
    } finally {
      setIsLoading(false);
    }
  };

  // Update fetchVideoSources function
  const fetchVideoSources = async (collection: string) => {
    try {
      setIsLoadingVideoSources(true);
      const response = await fetch(
        `http://localhost:8080/api/v1/Collection/videoSources?collection=${encodeURIComponent(collection)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch video sources for ${collection}`);
      }

      const data = await response.json();
      console.log(`Video sources for ${collection}:`, data);
      
      // Extract just the source values and set them in state
      const sources = data.videoSources.map((vs: { source: string }) => vs.source);
      setAvailableVideoSources(sources);
      
      // If we have sources, set the first one as selected
      if (sources.length > 0) {
        setSelectedVideoSource(sources[0]);
        
        // Fetch data for the first source
        const dataResponse = await fetch(
          `http://localhost:8080/api/v1/Collection/data?collectionName=${encodeURIComponent(collection)}&VideoSource=${encodeURIComponent(sources[0])}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include',
          }
        );

        if (!dataResponse.ok) {
          throw new Error(`Failed to fetch data for ${collection}`);
        }

        const sourceData = await dataResponse.json();
        console.log('Source data:', sourceData);
        
        // Ensure sourceData is an array
        const dataArray = Array.isArray(sourceData) ? sourceData : 
                         sourceData.data ? sourceData.data :
                         sourceData.documents ? sourceData.documents : [];
        
        setRawData(dataArray);

        // Process the fields
        const fieldCounts = dataArray.reduce((acc: { [key: string]: number }, item: any) => {
          if (item.Rule) {
            acc[item.Rule] = (acc[item.Rule] || 0) + (item.Count || 1);
          }
          return acc;
        }, {});
        
        setAvailableFields(fieldCounts);
      }

    } catch (error) {
      console.error('Error fetching video sources:', error);
      toast.error(`Failed to load video sources for ${collection}`);
    } finally {
      setIsLoadingVideoSources(false);
    }
  };

  // Update fetchFields function to use localhost:8080
  const fetchFields = async (collection: string, videoSource: string) => {
    if (!collection || !videoSource) return;
    
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/Collection/filtered/count?collection=${encodeURIComponent(collection)}&VideoSource=${encodeURIComponent(videoSource)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAvailableFields(data.fieldCounts || {});
    } catch (error) {
      console.error('Failed to fetch fields:', error);
      toast.error('Failed to fetch fields');
    }
  };

  // Add useEffect to fetch collections on mount
  useEffect(() => {
    if (isOpen) {
      fetchCollections();
    }
  }, [isOpen]);

  // Add these handlers
  const handleCollectionClick = (collection: string) => {
    setSelectedCollection(collection);
    setSelectedVideoSource('');
    setAvailableFields({});
    fetchVideoSources(collection);
  };

  // Update the handleSourceClick function
  const handleSourceClick = async (source: string) => {
    try {
      setSelectedVideoSource(source);
      
      const response = await fetch(
        `http://localhost:8080/api/v1/Collection/data?collectionName=${encodeURIComponent(selectedCollection)}&VideoSource=${encodeURIComponent(source)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data for source ${source}`);
      }

      const responseData = await response.json();
      console.log('Source data received:', responseData);
      
      // Process the data to get rules and counts
      const processedData = Array.isArray(responseData) ? responseData : 
                           responseData.data ? responseData.data :
                           responseData.documents ? responseData.documents : [];
      
      // Group by rules and sum their counts
      const ruleData = processedData.reduce((acc: { [key: string]: number }, item: any) => {
        const rule = item.Rule;
        if (rule) {
          acc[rule] = (acc[rule] || 0) + (item.Count || 1);
        }
        return acc;
      }, {});

      console.log('Processed rule data:', ruleData);
      setRawData(processedData);
      setAvailableFields(ruleData);

    } catch (error) {
      console.error('Error fetching source data:', error);
      toast.error(`Failed to load data for source ${source}`);
    }
  };

  // Update the renderSourceData function
  const renderSourceData = () => {
    if (!selectedVideoSource || !rawData) return null;

    // Filter data for selected source
    const sourceData = rawData.filter((item: DataItem) => 
      item.VideoSource?.toString() === selectedVideoSource
    );

    // Group by rules and sum their counts
    const ruleCounts = sourceData.reduce((acc: { [key: string]: number }, item: any) => {
      if (item.Rule) {
        acc[item.Rule] = (acc[item.Rule] || 0) + (item.Count || 1);
      }
      return acc;
    }, {});

    return (
      <div className="source-data-section">
        <h4>Rules for Source {selectedVideoSource}</h4>
        <div className="data-grid">
          {Object.entries(ruleCounts).map(([rule, count]) => (
            <div key={rule} className="data-card">
              <div className="data-card-header">
                <div className="rule-icon">
                  {iconMap[rule] || <Assessment />}
                </div>
                <h5>{rule}</h5>
              </div>
              <div className="data-value">
                <div className="count-value">{count}</div>
                <div className="data-label">Count</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Update the renderDataSelection function
  const renderDataSelection = () => (
    <div className="config-section data-selection">
      <h3>Data Selection</h3>
      
      {/* Collections Section */}
      <div className="selection-group collections">
        <h4>Select Collection</h4>
        {isLoading ? (
          <div className="loading-spinner">Loading collections...</div>
        ) : (
          <div className="collection-grid">
            {availableCollections.map(collection => (
              <div
                key={collection}
                className={`collection-card ${selectedCollection === collection ? 'expanded' : ''}`}
                onClick={() => handleCollectionClick(collection)}
              >
                <div className="collection-header">
                  <StorageRounded className="collection-icon" />
                  <h3>{collection}</h3>
                </div>
                
                {/* Expanded content */}
                {selectedCollection === collection && (
                  <div className="expanded-content">
                    <div className="video-source-selection">
                      <h4>Video Sources</h4>
                      <div className="source-buttons">
                        {availableVideoSources.map(source => (
                          <button
                            key={source}
                            className={`source-button ${selectedVideoSource === source ? 'selected' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSourceClick(source);
                            }}
                          >
                            Source {source}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Display rules and counts when source is selected */}
                    {selectedVideoSource && renderSourceData()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Update the styles constant
  const styles = `
    .data-selection {
      margin: 1rem 0;
    }

    .selection-group {
      margin-bottom: 2rem;
    }

    .selection-group h4 {
      color: #1e293b;
      margin-bottom: 1rem;
      font-size: 1.1rem;
    }

    .collection-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .collection-card {
      background: white;
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .collection-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .collection-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .collection-icon {
      color: #3b82f6;
      font-size: 1.5rem;
    }

    .collection-card h3 {
      margin: 0;
      font-size: 1.25rem;
      color: #1e293b;
    }

    .expanded-content {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e2e8f0;
    }

    .video-source-selection {
      margin-bottom: 1.5rem;
    }

    .source-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .source-button {
      padding: 0.5rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      background: white;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .source-button:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }

    .source-button.selected {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    .fields-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .field-item {
      background: #f8fafc;
      padding: 1rem;
      border-radius: 0.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .field-name {
      color: #1e293b;
      font-weight: 500;
    }

    .field-count {
      background: #e2e8f0;
      color: #64748b;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      color: #64748b;
    }

    .no-data-message {
      text-align: center;
      padding: 2rem;
      color: #64748b;
    }

    .collection-card.expanded {
      border-color: #3b82f6;
      background: #f8fafc;
    }

    .rule-counts-container {
      margin-top: 1rem;
      padding: 0.5rem;
      background-color: #f3f4f6;
      border-radius: 0.375rem;
    }

    .rule-counts-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .rule-count-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.25rem 0.5rem;
      background-color: white;
      border-radius: 0.25rem;
      font-size: 0.875rem;
    }

    .rule-name {
      font-weight: 500;
      color: #374151;
    }

    .rule-count {
      font-weight: 600;
      color: #4f46e5;
    }
  `;

  // Add this useEffect for the mouse movement effect
  useEffect(() => {
    const cards = document.querySelectorAll('.collection-card');
    
    const handleMouseMove = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      const card = mouseEvent.currentTarget as HTMLElement;
      const rect = card.getBoundingClientRect();
      const x = ((mouseEvent.clientX - rect.left) / rect.width) * 100;
      const y = ((mouseEvent.clientY - rect.top) / rect.height) * 100;
      
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    };

    cards.forEach(card => {
      card.addEventListener('mousemove', handleMouseMove as EventListener);
    });

    return () => {
      cards.forEach(card => {
        card.removeEventListener('mousemove', handleMouseMove as EventListener);
      });
    };
  }, [selectedCollection]); // Re-run when selectedCollection changes

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

          <div className="config-section">
            <div className="layout-selector">
              <h3>Card Layout</h3>
              <div className="layout-options">
                <div 
                  className={`layout-option ${cardLayout === 'single' ? 'active' : ''} ${kpiFields.length > 1 ? 'disabled' : ''}`}
                  onClick={() => handleLayoutChange('single')}
                >
                  <div className="layout-icon single">
                    <div className="icon-box"></div>
                  </div>
                  <span>Single Card</span>
                </div>
                <div 
                  className={`layout-option ${cardLayout === 'multi' ? 'active' : ''}`}
                  onClick={() => handleLayoutChange('multi')}
                >
                  <div className="layout-icon multi">
                    <div className="icon-box"></div>
                    <div className="icon-box"></div>
                  </div>
                  <span>Multiple Cards</span>
                </div>
              </div>
            </div>
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

          {renderDataSelection()}

          {/* Preview Section */}
          <div className="config-section">
            <h3>Preview</h3>
            <div className="kpi-preview">
              <div className="kpi-preview-container">
                {getPreviewContent()}
              </div>
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