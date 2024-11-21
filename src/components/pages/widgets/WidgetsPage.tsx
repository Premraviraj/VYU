import React, { useState, useEffect, useCallback, useRef } from 'react';

import GraphModal from './GraphModal';
import KPIModal from './KPIModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './WidgetsPage.css';
import { API_URL } from '../../../utils/config';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import StarIcon from '@mui/icons-material/Star';
import SettingsIcon from '@mui/icons-material/Settings';
import StorageIcon from '@mui/icons-material/Storage';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import StackLoader from '../../common/StackLoader';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { VehicleStats as ImportedVehicleStats, RuleCounts as ImportedRuleCounts } from '../../../data/vehicleData';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';

interface TimeValue {
  in: number;
  out: number;
}

interface FilteredStats {
  VideoSource: string;
  RuleCounts: ImportedRuleCounts;
  startTime?: string;
  endTime?: string;
}

interface FilteredData {
  collection: string;
  filter: {
    VideoSource: string;
  };
  fieldCounts: {
    [key: string]: number;
  };
}

interface SelectedDataItem {
  name: string;
  field?: string;
  count?: number;
  videoSource?: string;
  filteredStats?: {
    VideoSource: string;
    RuleCounts: {
      Entry: number;
      Exit: number;
      Total: number;
      [key: string]: number;
    };
  };
}

interface VehicleStats {
  vehicleType: string;
  count: number;
  in: number;
  out: number;
  lastUpdated: string;
  filteredStats: FilteredStats;
  rawData: Record<string, any>;
}

// Add interface for video source response
interface VideoSourceResponse {
  collection: string;
  videoSources: {
    source: string;
    count: number;
  }[];
  total: number;
}

// Add WebSocket connection
const ws = new WebSocket('ws://localhost:8080');

interface ExpandedCardState {
  collectionName: string;
  videoSource: string;
}

const WidgetsPage: React.FC = () => {
  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);
  const [isKPIModalOpen, setIsKPIModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<SelectedDataItem[]>([]);
  const [collectionsData, setCollectionsData] = useState<{[key: string]: any}>({});
  const [expandedCollection, setExpandedCollection] = useState<string | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collectionDetails, setCollectionDetails] = useState<{ [key: string]: any }>({});
  const [loadingDetails, setLoadingDetails] = useState<{ [key: string]: boolean }>({});
  const [collectionData, setCollectionData] = useState<{ [key: string]: any }>({});
  const [loadingCollectionData, setLoadingCollectionData] = useState<{ [key: string]: boolean }>({});
  const [expandedCard, setExpandedCard] = useState<ExpandedCardState | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<FilteredData | null>(null);
  const [selectedVideoSource, setSelectedVideoSource] = useState<string>('1');
  const [availableVideoSources, setAvailableVideoSources] = useState<string[]>([]);
  const [graphs, setGraphs] = useState<{ [key: string]: any }>({});

  // Create a ref for the widgets container
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Add this useEffect to create the widgets container
  useEffect(() => {
    console.log('Initializing widgets container...'); // Debug log
    
    // Check if container already exists
    if (!document.querySelector('.widgets-container')) {
      const container = document.createElement('div');
      container.className = 'widgets-container';
      document.querySelector('.widgets-page')?.appendChild(container);
      containerRef.current = container;
      console.log('Widgets container created:', container);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
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
        setCollectionsData(data.collections);
        setError(null);
      } catch (err) {
        console.error('Fetch Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        toast.error('Failed to load collections data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDataSelection = (data: {
    name: string;
    field: string;
    count: number;
    videoSource: string;
  }) => {
    setSelectedData(prev => {
      // Find if this collection already exists
      const existingCollection = prev.find(item => item.name === data.name);

      if (existingCollection) {
        // Update existing collection
        return prev.map(item => 
          item.name === data.name 
            ? {
                ...item,
                filteredStats: {
                  VideoSource: data.videoSource,
                  RuleCounts: {
                    ...item.filteredStats?.RuleCounts,
                    [data.field]: data.count,
                    Entry: data.field === 'Entry' ? data.count : (item.filteredStats?.RuleCounts.Entry || 0),
                    Exit: data.field === 'Exit' ? data.count : (item.filteredStats?.RuleCounts.Exit || 0),
                    Total: data.count
                  }
                }
              }
            : item
        );
      }

      // Add new collection
      return [...prev, {
        name: data.name,
        filteredStats: {
          VideoSource: data.videoSource,
          RuleCounts: {
            [data.field]: data.count,
            Entry: data.field === 'Entry' ? data.count : 0,
            Exit: data.field === 'Exit' ? data.count : 0,
            Total: data.count
          }
        }
      }];
    });
  };

  // Add function to fetch video sources
  const fetchVideoSources = async (collectionName: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/Collection/videoSources?collection=${collectionName}`,
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
        throw new Error(`Failed to fetch video sources for ${collectionName}`);
      }

      const data: VideoSourceResponse = await response.json();
      console.log(`Video sources for ${collectionName}:`, data);
      
      // Extract just the source values and set them in state
      const sources = data.videoSources.map(vs => vs.source);
      setAvailableVideoSources(sources);
      
      // If we have sources, set the first one as selected
      if (sources.length > 0) {
        setSelectedVideoSource(sources[0]);
      }

    } catch (error) {
      console.error('Error fetching video sources:', error);
      toast.error(`Failed to load video sources for ${collectionName}`);
    }
  };

  // Modify handleCollectionClick
  const handleCollectionClick = async (collectionName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // If clicking the same collection, collapse it
      if (expandedCard?.collectionName === collectionName) {
        setExpandedCard(null);
        return;
      }

      // Fetch video sources first
      await fetchVideoSources(collectionName);
      
      // Use the first video source or default to '1'
      const initialSource = availableVideoSources[0] || '1';
      
      // Fetch filtered data
      const response = await fetch(
        `${API_URL}/api/v1/Collection/filtered/count?collection=${collectionName}&VideoSource=${initialSource}`,
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
        throw new Error(`Failed to fetch filtered data for ${collectionName}`);
      }

      const data = await response.json();
      setFilteredData(data);
      setExpandedCard({ collectionName, videoSource: initialSource });

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(`Failed to load data for ${collectionName}`);
    }
  };

  const handleCardClick = (collectionName: string) => {
    console.log('Expanding collection:', collectionName);
    setExpandedCollection(expandedCollection === collectionName ? 'all' : collectionName);
  };

  const handleCreateGraph = () => {
    setIsGraphModalOpen(true);
  };

  const handleCreateKPI = () => {
    setIsKPIModalOpen(true);
  };

  const handleGraphCreated = () => {
    toast.success('Graph created successfully!', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    setSelectedData([]);
  };

  const handleKPICreated = () => {
    toast.success('KPI Card created successfully!', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    setSelectedData([]);
  };

  const handleDetailCardClick = async (collectionName: string) => {
    try {
      setLoadingDetails(prev => ({ ...prev, [collectionName]: true }));
      
      // Extract the actual collection name from the key
      const actualCollectionName = collectionName.toLowerCase().replace(/\s+/g, '');
      
      // Create query parameters with the actual collection name
      const queryParams = new URLSearchParams({
        collectionName: actualCollectionName  // This will be 'cam1', 'cam2', 'peoples', etc.
      }).toString();
      
      console.log(`Fetching data for collection: ${actualCollectionName}`);
      
      const response = await fetch(`${API_URL}/api/v1/Collection/data?${queryParams}`, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data for ${collectionName}`);
      }

      const data = await response.json();
      console.log(`Response for ${collectionName}:`, data);

      setCollectionDetails(prev => ({
        ...prev,
        [collectionName]: data,
      }));
    } catch (err) {
      console.error('Fetch Error:', err);
      toast.error(`Failed to load data for ${collectionName}`);
    } finally {
      setLoadingDetails(prev => ({ ...prev, [collectionName]: false }));
    }
  };
  

  const renderValue = (value: unknown): React.ReactNode => {
    if (typeof value === 'string' 
      || typeof value === 'number' 
      || typeof value === 'boolean'
      || value === null
      || value === undefined) {
      return value;
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return String(value);
  };

  const renderTimeValue = (subValue: unknown): TimeValue => {
    if (typeof subValue === 'object' && subValue !== null && 'in' in subValue && 'out' in subValue) {
      return subValue as TimeValue;
    }
    return { in: 0, out: 0 };
  };

  const getTimeIcon = (timeKey: string) => {
    switch(timeKey) {
      case 'morning': return <WbSunnyIcon className="time-icon morning" />;
      case 'afternoon': return <WbTwilightIcon className="time-icon afternoon" />;
      case 'evening': return <NightsStayIcon className="time-icon evening" />;
      case 'night': return <StarIcon className="time-icon night" />;
      default: return null;
    }
  };

  const getIconForKey = (key: string) => {
    switch(key.toLowerCase()) {
      case 'status':
        return <SettingsIcon className="detail-icon status" />;
      case 'lastupdate':
      case 'lastupdated':
      case 'timestamp':
        return <AccessTimeIcon className="detail-icon time" />;
      case 'storage':
      case 'data':
        return <StorageIcon className="detail-icon storage" />;
      default:
        return <LayersOutlinedIcon className="detail-icon default" />;
    }
  };

  const formatValue = (value: any): string => {
    if (value instanceof Date) {
      return new Date(value).toLocaleString();
    }
    if (typeof value === 'boolean') {
      return value ? 'Active' : 'Inactive';
    }
    return String(value);
  };

  const getCollectionNumber = (collectionName: string): string => {
    const number = collectionName.replace(/[^0-9]/g, '');
    return number;
  };

  const sortCollections = (collections: string[]): string[] => {
    return collections.sort((a, b) => {
      const numA = parseInt(getCollectionNumber(a));
      const numB = parseInt(getCollectionNumber(b));
      return numA - numB;
    });
  };

  const transformToVehicleStats = (selectedItems: SelectedDataItem[]): ImportedVehicleStats[] => {
    return selectedItems.map(item => {
      // Create a properly typed RuleCounts object with required fields
      const ruleCounts: ImportedRuleCounts = {
        Entry: item.filteredStats?.RuleCounts?.Entry || 0,
        Exit: item.filteredStats?.RuleCounts?.Exit || 0,
        Total: item.filteredStats?.RuleCounts?.Total || 0
      };

      // Create the vehicle stats object with the proper type
      const vehicleStats: ImportedVehicleStats = {
        vehicleType: item.name,
        count: ruleCounts.Total || 0,
        in: ruleCounts.Entry,
        out: ruleCounts.Exit,
        lastUpdated: new Date().toISOString(),
        filteredStats: {
          VideoSource: item.filteredStats?.VideoSource || "1",
          RuleCounts: {
            Entry: ruleCounts.Entry,
            Exit: ruleCounts.Exit,
            Total: ruleCounts.Total
          }
        },
        rawData: {}
      };

      return vehicleStats;
    });
  };

  const addGraph = (id: string, graph: any) => {
    setGraphs(prev => ({ ...prev, [id]: graph }));
  };

  const removeGraph = (id: string) => {
    setGraphs(prev => {
      const newGraphs = { ...prev };
      delete newGraphs[id];
      return newGraphs;
    });
  };

  const handleVideoSourceChange = async (source: string) => {
    if (!expandedCard?.collectionName) return;
    
    try {
      // Fetch new data with the selected video source
      const response = await fetch(
        `${API_URL}/api/v1/Collection/filtered/count?collection=${expandedCard.collectionName}&VideoSource=${source}`,
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
        throw new Error(`Failed to fetch filtered data for ${expandedCard.collectionName}`);
      }

      const data = await response.json();
      setFilteredData(data);
      setExpandedCard(prev => prev ? { ...prev, videoSource: source } : null);
      setSelectedVideoSource(source);

    } catch (error) {
      console.error('Error fetching filtered data:', error);
      toast.error(`Failed to load data for video source ${source}`);
    }
  };

  // Update the updateKPIValues function
  const updateKPIValues = useCallback(async () => {
    console.log('🔄 Starting KPI values update...'); // Debug log
    
    // Use containerRef to find KPI widgets
    const kpiWidgets = containerRef.current?.querySelectorAll('.kpi-widget');
    console.log(`📊 Found ${kpiWidgets?.length || 0} KPI widgets`); 

    if (!kpiWidgets?.length) return;

    for (const widget of Array.from(kpiWidgets)) {
      const fields = widget.querySelectorAll('.kpi-field');
      console.log(`Found ${fields.length} fields in widget ${widget.id}`); // Debug log

      for (const field of Array.from(fields)) {
        const collection = field.getAttribute('data-collection');
        const videoSource = field.getAttribute('data-video-source');
        const fieldType = field.getAttribute('data-type');
        
        console.log('Field attributes:', { collection, videoSource, fieldType }); // Debug log

        if (!collection || !videoSource || !fieldType) {
          console.warn('⚠️ Missing required attributes:', { collection, videoSource, fieldType });
          continue;
        }

        try {
          const apiEndpoint = `${API_URL}/api/v1/Collection/filtered/count?collection=${collection}&VideoSource=${videoSource}&Rule=${fieldType}`;
          console.log('🌐 Fetching from:', apiEndpoint); // Debug log

          const response = await fetch(apiEndpoint, {
            credentials: 'include'
          });

          if (response.ok) {
            const data = await response.json();
            console.log('📥 Received data:', data); // Debug log

            if (data.fieldCounts && data.fieldCounts[fieldType] !== undefined) {
              const valueElement = field.querySelector('.field-value') as HTMLElement;
              if (valueElement) {
                const oldValue = parseInt(valueElement.textContent || '0');
                const newValue = data.fieldCounts[fieldType];
                
                console.log('Value update:', {
                  field: fieldType,
                  oldValue,
                  newValue
                }); // Debug log

                if (oldValue !== newValue) {
                  valueElement.classList.add('value-updated');
                  valueElement.textContent = newValue.toString();
                }
              }
            }
          }
        } catch (error) {
          console.error('❌ Error updating field:', error);
        }
      }
    }
  }, []);

  // Set up the interval with proper cleanup
  useEffect(() => {
    console.log('🚀 Setting up periodic updates...'); // Debug log
    
    // Initial update
    updateKPIValues();

    // Set up interval for periodic updates
    const interval = setInterval(() => {
      console.log('⏰ Running periodic update...'); // Debug log
      updateKPIValues();
    }, 5000); // Update every 5 seconds

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up interval...'); // Debug log
      clearInterval(interval);
    };
  }, [updateKPIValues]);

  // Add this to ensure widgets are properly mounted
  useEffect(() => {
    console.log('Widgets container content:', document.querySelector('.widgets-container')?.innerHTML);
  }, []);

  // Add this CSS class for the update animation
  const styles = `
    @keyframes valueUpdate {
      0% {
        transform: scale(1);
        color: inherit;
      }
      50% {
        transform: scale(1.1);
        color: #4f46e5;
      }
      100% {
        transform: scale(1);
        color: inherit;
      }
    }

    .value-updated {
      animation: valueUpdate 0.5s ease-out;
    }
  `;

  // Add the styles to the document
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Add this to ensure widgets container exists
  useEffect(() => {
    // Check if widgets container exists, create if it doesn't
    if (!document.querySelector('.widgets-container')) {
      const container = document.createElement('div');
      container.className = 'widgets-container';
      document.querySelector('.widgets-page')?.appendChild(container);
    }
  }, []);

  const handleFieldClick = (field: string, count: number) => {
    return; // This prevents any field selection
  };

  return (
    <div className="widgets-page">
      <ToastContainer />
      <h1>Widgets</h1>

      <div className="data-selection-section">
        <h2>Collections</h2>
        {isLoading ? (
          <div className="loading-container">
            <StackLoader size="large" />
            <span className="loading-text">Loading Collections...</span>
          </div>
        ) : error ? (
          <div className="error-message">
            {error}
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : (
          <div className="collections-grid">
            {collectionsData.map((collectionName: string) => (
              <div
                key={collectionName}
                className={`collection-card ${expandedCard?.collectionName === collectionName ? 'expanded' : ''}`}
                onClick={(e) => handleCollectionClick(collectionName, e)}
              >
                <div className="collection-header">
                  <StorageRoundedIcon className="collection-icon" />
                  <h3>{collectionName}</h3>
                </div>
                
                {/* Expanded content */}
                {expandedCard?.collectionName === collectionName && filteredData && (
                  <div className="expanded-content">
                    {/* Video Source Selection */}
                    <div className="video-source-selection">
                      <h4>Video Sources</h4>
                      <div className="source-buttons">
                        {availableVideoSources.map(source => (
                          <button
                            key={source}
                            className={`source-button ${expandedCard.videoSource === source ? 'selected' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVideoSourceChange(source);
                              setExpandedCard(prev => prev ? { ...prev, videoSource: source } : null);
                            }}
                          >
                            Source {source}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Field Counts - Remove click handlers and selection styling */}
                    <div className="field-counts">
                      <h4>Available Fields</h4>
                      <div className="fields-grid">
                        {Object.entries(filteredData.fieldCounts).map(([field, count]) => (
                          <div
                            key={field}
                            className="field-item"
                          >
                            <div className="field-name">{field}</div>
                            <div className="field-count">{count}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="widgets-section">
        <h2>Create Widgets</h2>
        <div className="widgets-grid">
          <div 
            className="widget-card"
            onClick={handleCreateGraph}
          >
            <div className="widget-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="icon">
                <path d="M4 20h16M4 20V4m0 16l4-4v4m4 0V10m0 10l4-8v8m4 0V6l-4 14" 
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Create Graph</h3>
            <p>Generate custom graphs from selected data</p>
          </div>

          <div 
            className="widget-card"
            onClick={handleCreateKPI}
          >
            <div className="widget-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="icon">
                <path d="M16 8v8m-8-8v8M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" 
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Create KPI Card</h3>
            <p>Create KPI cards from selected data</p>
          </div>
        </div>
      </div>

      <GraphModal
        isOpen={isGraphModalOpen}
        onClose={() => setIsGraphModalOpen(false)}
        selectedData={[]}
        onGraphCreated={handleGraphCreated}
      />

      <KPIModal
        isOpen={isKPIModalOpen}
        onClose={() => setIsKPIModalOpen(false)}
        selectedData={[]}
        onKPICreated={handleKPICreated}
      />
    </div>
  );
};

export default WidgetsPage; 