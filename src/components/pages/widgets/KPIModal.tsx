import React, { useState, useEffect, memo, useCallback, useMemo, useRef } from 'react';
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
import ClipLoader from "react-spinners/ClipLoader";
import { Virtuoso } from 'react-virtuoso';

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

// Add this interface at the top with other interfaces
interface RawDataResponse {
  ruleCounts?: { [key: string]: number };
  fieldCounts?: { [key: string]: number };
  data?: any;
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

// Memoize the rule card component
const RuleCard = memo(({ rule, count, isSelected, onSelect, onRemove }: {
  rule: string;
  count: number;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: (e: React.MouseEvent) => void;
}) => (
  <div 
    className={`rule-card ${isSelected ? 'selected' : ''}`}
    onClick={onSelect}
  >
    <div className="rule-card-header">
      <h5>{rule}</h5>
      <span className="rule-count-badge">
        {typeof count === 'number' ? count : 0}
      </span>
    </div>
    {isSelected && (
      <button 
        className="remove-rule"
        onClick={onRemove}
      >
        ×
      </button>
    )}
  </div>
));

// Memoize the collection card component
const CollectionCard = memo(({ 
  collection, 
  isSelected, 
  videoSources, 
  selectedSource,
  onCollectionClick,
  onSourceClick,
  rawData,
  selectedRules,
  onRuleSelect
}: any) => {
  const parentRef = useRef(null);

  return (
    <div 
      className={`collection-card ${isSelected ? 'expanded' : ''}`}
      onClick={() => onCollectionClick(collection)}
    >
      <div className="collection-header">
        <StorageRounded className="collection-icon" />
        <h3>{collection}</h3>
      </div>
      
      {isSelected && (
        <div className="expanded-content">
          <div className="content-wrapper">
            <div className="video-source-section">
              <h4>Video Sources</h4>
              <div className="source-buttons">
                {videoSources.map((source: string) => (
                  <button
                    key={source}
                    className={`source-button ${selectedSource === source ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSourceClick(source);
                    }}
                  >
                    Source {source}
                  </button>
                ))}
              </div>
            </div>

            <div className="rules-section">
              <h4>Rule Counts</h4>
              {rawData && (
                <div className="rules-grid">
                  <Virtuoso
                    style={{ height: '400px' }}
                    totalCount={Object.entries(rawData.ruleCounts || rawData.fieldCounts || {}).length}
                    itemContent={index => {
                      const [rule, count] = Object.entries(rawData.ruleCounts || rawData.fieldCounts || {})[index];
                      return (
                        <RuleCard
                          key={`${rule}-${index}`}
                          rule={rule}
                          count={count as number}
                          isSelected={selectedRules.some((r: any) => r.rule === rule)}
                          onSelect={() => onRuleSelect(rule, count as number)}
                          onRemove={(e) => {
                            e.stopPropagation();
                            onRuleSelect(rule, count as number);
                          }}
                        />
                      );
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// Update the main component
const KPIModal: React.FC<KPIModalProps> = memo(({ isOpen, onClose, selectedData, onKPICreated }) => {
  const [kpiTitle, setKpiTitle] = useState('');
  const [kpiFields, setKpiFields] = useState<KPIField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [realTimeValues, setRealTimeValues] = useState<{[key: string]: number}>({});
  const [graphTitle, setGraphTitle] = useState('');
  const [availableCollections, setAvailableCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [selectedVideoSource, setSelectedVideoSource] = useState<string>('');
  const [availableVideoSources, setAvailableVideoSources] = useState<string[]>([]);
  const [isLoadingVideoSources, setIsLoadingVideoSources] = useState(false);
  const [availableFields, setAvailableFields] = useState<{[key: string]: number}>({});
  const [rawData, setRawData] = useState<RawDataResponse | null>(null);
  const [selectedRules, setSelectedRules] = useState<Array<{
    rule: string;
    count: number;
    source: string;
  }>>([]);

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
            {selectedRules.map((rule, index) => (
              <div key={index} className="field-group">
                <div className="field-value">
                  {rule.count.toLocaleString()}
                </div>
                <div className="field-label">{rule.rule}</div>
                <div className="field-source">Source {rule.source}</div>
              </div>
            ))}
            {selectedRules.length === 0 && (
              <div className="no-rules-message">
                Select rules to preview
              </div>
            )}
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
    try {
      const widgetId = `kpi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create KPI card data with all selected rules
      const kpiCardData = {
        kpi_id: widgetId,
        kpi_name: kpiTitle || 'Vehicle Statistics',
        kpi_type: 'kpi',
        design_type: 'modern',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        rules: selectedRules.map(rule => ({
          field_id: `${rule.source}-${rule.rule}-${Math.random()}`,
          field_name: rule.rule,
          field_value: rule.count.toString(),
          collection_name: selectedCollection,
          video_source: rule.source,
          rule_name: rule.rule,
          style_color: getDefaultColor(rule.rule),
          style_size: 'medium',
          style_icon: 'Dashboard',
        })),
        config: {
          refresh_interval: 5000,
          layout: {
            columns: 2,
            gap: '1rem'
          }
        }
      };

      console.log('Sending KPI card data:', kpiCardData);

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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create KPI card');
      }

      const data = await response.json();
      console.log('KPI Card created successfully:', data);
      toast.success('KPI Card created successfully');
      onClose();
      onKPICreated?.();
    } catch (error) {
      console.error('Error creating KPI card:', error);
      toast.error('Failed to create KPI card');
    }
  };

  // Update the generateKPIContent function
  const generateKPIContent = (widgetId: string, fields: KPIField[]) => {
    return `
      <div class="kpi-widget modern" id="${widgetId}">
        <div class="kpi-header">
          <h3 class="kpi-title">${kpiTitle || 'Vehicle Statistics'}</h3>
        </div>
        <div class="kpi-fields">
          ${selectedRules.map(rule => `
            <div class="kpi-field medium">
              <div class="field-value">
                ${rule.count.toLocaleString()}
              </div>
              <div class="field-label">${rule.rule}</div>
              <div class="field-source">Source ${rule.source}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  };

  // Update fetchCollections function to match WidgetsPage
  const fetchCollections = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/v1/allCollections`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch collections');
      }

      const data = await response.json();
      console.log('Collections from API:', data);
      
      if (data && Array.isArray(data.collections)) {
        setAvailableCollections(data.collections);
      } else {
        setAvailableCollections([]);
      }
    } catch (error) {
      console.error('Failed to fetch collections:', error);
      toast.error('Failed to load collections data');
      setAvailableCollections([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize handlers
  const handleCollectionClick = useCallback(async (collectionName: string) => {
    try {
      setSelectedCollection(collectionName);
      
      // Fetch video sources and collection data simultaneously
      const [sourcesResponse, collectionResponse] = await Promise.all([
        fetch(
          `${API_URL}/api/v1/Collection/videoSources?collection=${encodeURIComponent(collectionName)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include',
          }
        ),
        fetch(
          `${API_URL}/api/v1/Collection/filtered/count?collection=${encodeURIComponent(collectionName)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include',
          }
        )
      ]);

      if (!sourcesResponse.ok || !collectionResponse.ok) {
        throw new Error(`Failed to fetch data for ${collectionName}`);
      }

      const [sourcesData, collectionData] = await Promise.all([
        sourcesResponse.json(),
        collectionResponse.json()
      ]);

      console.log('Video sources data:', sourcesData);
      console.log('Collection data:', collectionData);
      
      // Extract sources from the response
      const sources = sourcesData.videoSources ? sourcesData.videoSources.map((vs: any) => vs.source) : [];
      
      // Get all unique video sources
      const uniqueSources = Array.from(new Set([
        ...sources,
        ...(collectionData.data ? collectionData.data.map((item: any) => item.VideoSource) : [])
      ]));

      setAvailableVideoSources(uniqueSources);
      
      // Use the first video source
      const initialSource = uniqueSources[0] || '1';
      setSelectedVideoSource(initialSource);
      
      // Fetch rule counts for the selected source
      const response = await fetch(
        `${API_URL}/api/v1/Collection/filtered/count?collection=${encodeURIComponent(collectionName)}&VideoSource=${encodeURIComponent(initialSource)}`,
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
        throw new Error(`Failed to fetch data for ${collectionName}`);
      }

      const data = await response.json();
      console.log('Collection data:', data);
      
      if (data && typeof data === 'object') {
        setAvailableFields(data.fieldCounts || {});
        setRawData(data);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(`Failed to load data for ${collectionName}`);
    }
  }, []);

  const handleSourceClick = useCallback(async (source: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/Collection/filtered/count?collection=${encodeURIComponent(selectedCollection)}&VideoSource=${encodeURIComponent(source)}`,
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

      const data = await response.json();
      console.log('Raw API response:', data);
      
      if (data && typeof data === 'object') {
        setSelectedVideoSource(source);
        // Use ruleCounts from raw response if available, otherwise use fieldCounts
        const counts = data.ruleCounts || data.fieldCounts || {};
        setAvailableFields(counts);
        setRawData(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(`Failed to load data for video source ${source}`);
    }
  }, [selectedCollection]);

  const handleRuleSelect = useCallback((rule: string, count: number) => {
    const isAlreadySelected = selectedRules.some(r => r.rule === rule);
    
    setSelectedRules(prev => {
      if (isAlreadySelected) {
        return prev.filter(r => r.rule !== rule);
      }
      return [...prev, { 
        rule, 
        count, 
        source: selectedVideoSource 
      }];
    });

    console.log('Selected rule:', { rule, count, source: selectedVideoSource });
  }, [selectedVideoSource, selectedRules]);

  // Memoize computed values
  const sortedCollections = useMemo(() => 
    [...availableCollections].sort(),
    [availableCollections]
  );

  const sortedVideoSources = useMemo(() => 
    [...availableVideoSources].sort((a, b) => Number(a) - Number(b)),
    [availableVideoSources]
  );

  // Memoize the preview content
  const previewContent = useMemo(() => getPreviewContent(), [selectedRules]);

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

    /* Rule Card Selection Styles */
    .rule-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .rule-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 0;
      background: #4f46e5;
      transition: height 0.2s ease;
      border-radius: 12px 0 0 12px;
    }

    .rule-card:hover {
      background: #f1f5f9;
      border-color: #4f46e5;
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }

    .rule-card.selected {
      background: #f8fafc;
      border-color: #4f46e5;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
    }

    .rule-card.selected::before {
      height: 100%;
    }

    /* Preview Section for Selected Rules */
    .selected-rules-preview {
      margin-top: 2rem;
      padding: 1.5rem;
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .selected-rules-preview h4 {
      color: #1e293b;
      font-size: 1rem;
      margin: 0 0 1rem 0;
      font-weight: 600;
    }

    .selected-rules-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }

    .preview-rule-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .preview-rule-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .preview-rule-name {
      color: #1e293b;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .preview-rule-source {
      color: #64748b;
      font-size: 0.75rem;
    }

    .preview-rule-count {
      background: #4f46e5;
      color: white;
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 6px;
    }

    /* Remove Rule Button */
    .remove-rule {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 50%;
      opacity: 0;
      transition: all 0.2s ease;
    }

    .rule-card:hover .remove-rule {
      opacity: 1;
    }

    .remove-rule:hover {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
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

  // Add this useEffect near the top of the component, with other useEffects
  useEffect(() => {
    if (isOpen) {
      fetchCollections();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="kpi-modal-overlay">
      <div className="kpi-modal">
        <div className="kpi-modal-header">
          <h2>Configure KPI Card</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="kpi-modal-content">
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

          <div className="config-section data-selection">
            <h3>Data Selection</h3>
            
            <div className="data-selection-section">
              {isLoading ? (
                <div className="loading-container">
                  <ClipLoader size={50} color="#4f46e5" />
                  <span className="loading-text">Loading Collections...</span>
                </div>
              ) : (
                <>
                  <Virtuoso
                    style={{ height: '500px' }}
                    totalCount={sortedCollections.length}
                    itemContent={index => (
                      <CollectionCard
                        key={sortedCollections[index]}
                        collection={sortedCollections[index]}
                        isSelected={selectedCollection === sortedCollections[index]}
                        videoSources={sortedVideoSources}
                        selectedSource={selectedVideoSource}
                        onCollectionClick={handleCollectionClick}
                        onSourceClick={handleSourceClick}
                        rawData={rawData}
                        selectedRules={selectedRules}
                        onRuleSelect={handleRuleSelect}
                      />
                    )}
                  />

                  {selectedRules.length > 0 && (
                    <div className="selected-rules-preview">
                      <h4>Selected Rules</h4>
                      <Virtuoso
                        style={{ height: '200px' }}
                        totalCount={selectedRules.length}
                        itemContent={index => {
                          const rule = selectedRules[index];
                          return (
                            <div key={index} className="preview-rule-card">
                              <div className="preview-rule-info">
                                <span className="preview-rule-name">{rule.rule}</span>
                                <span className="preview-rule-source">Source {rule.source}</span>
                              </div>
                              <span className="preview-rule-count">{rule.count}</span>
                            </div>
                          );
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="config-section">
            <h3>Preview</h3>
            <div className="kpi-preview">
              <div className="kpi-preview-container">
                {previewContent}
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
});

export default KPIModal; 