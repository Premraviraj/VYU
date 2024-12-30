import React, { useState, useEffect, useCallback, useRef } from 'react';

import GraphModal from './GraphModal';
import KPIModal from './KPIModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './WidgetsPage.css';
import { API_URL } from '../../../utils/config';
import StackLoader from '../../common/StackLoader';
import { VehicleStats as ImportedVehicleStats, RuleCounts as ImportedRuleCounts } from '../../../data/vehicleData';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import { socket } from '../../../socket';

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
  data: Array<{
    Rule: string;
    Count: number;
    VideoSource: string;
    LastUpdated?: string;
  }>;
  fieldCounts: {
    [key: string]: number;
  };
  rawResponse?: any;
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

interface ExpandedCardState {
  collectionName: string;
  videoSource: string;
}

interface VideoSourceResponse {
  collection: string;
  videoSources: {
    source: string;
    count: number;
  }[];
  total: number;
}

// Add this interface for KPI updates
interface KPIUpdate {
  kpi_name: string;
  updates: Array<{
    videoSource: string;
    rule: string;
    count: number;
  }>;
}

const WidgetsPage: React.FC = (): React.ReactElement => {
  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);
  const [isKPIModalOpen, setIsKPIModalOpen] = useState(false);
  const [collectionsData, setCollectionsData] = useState<string[]>([]);
  const [expandedCard, setExpandedCard] = useState<ExpandedCardState | null>(null);
  const [filteredData, setFilteredData] = useState<FilteredData | null>(null);
  const [selectedVideoSource, setSelectedVideoSource] = useState<string>('1');
  const [availableVideoSources, setAvailableVideoSources] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedData, setSelectedData] = useState<SelectedDataItem[]>([]);

  // Create a ref for the widgets container
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Add new state for real-time values
  const [realTimeValues, setRealTimeValues] = useState<Record<string, number>>({});

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
        
        // Ensure we're setting an array
        if (data && Array.isArray(data.collections)) {
          setCollectionsData(data.collections);
        } else {
          setCollectionsData([]); // Set empty array if no data
        }
        setError(null);
      } catch (err) {
        console.error('Fetch Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        toast.error('Failed to load collections data');
        setCollectionsData([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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

      // First fetch video sources and collection data simultaneously
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
      
        // Get all unique video sources from both collection and sources data
        const uniqueSources = Array.from(new Set([
        ...sources,
        ...(collectionData.data ? collectionData.data.map((item: any) => item.VideoSource) : [])
        ]));

      setAvailableVideoSources(uniqueSources);
      
      // Use the first video source from the combined sources
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
        console.log('Field counts:', data.fieldCounts); // Debug log for field counts
        
        // Ensure we have valid field counts data
        if (data && typeof data === 'object') {
          // Transform the data if needed
          const processedData: FilteredData = {
          collection: collectionName,
          filter: {
            VideoSource: initialSource
          },
          data: data.data || [],
          fieldCounts: data.fieldCounts || {},
          rawResponse: data
          };
          setFilteredData(processedData);
          setExpandedCard({ collectionName, videoSource: initialSource });
        } else {
          throw new Error('Invalid data format received from server');
        }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(`Failed to load data for ${collectionName}`);
    }
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

  const handleVideoSourceChange = async (source: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!expandedCard?.collectionName) return;
    
    try {
      const response = await fetch(
        `${API_URL}/api/v1/Collection/filtered/count?collection=${encodeURIComponent(expandedCard.collectionName)}&VideoSource=${encodeURIComponent(source)}`,
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
        throw new Error(`Failed to fetch data for ${expandedCard.collectionName}`);
      }

      const data = await response.json();
      console.log('Raw API response:', data);
      
      if (data && typeof data === 'object') {
        // Use the raw response data directly
        const processedData: FilteredData = {
          collection: expandedCard.collectionName,
          filter: {
            VideoSource: source
          },
          data: data.ruleCounts ? Object.entries(data.ruleCounts).map(([rule, count]) => ({
            Rule: rule,
            Count: count as number,
            VideoSource: source,
            LastUpdated: new Date().toISOString()
          })) : [],
          fieldCounts: data.fieldCounts || {},
          rawResponse: data
        };

        console.log('Processed data:', processedData);
        setFilteredData(processedData);
        setExpandedCard(prev => prev ? { ...prev, videoSource: source } : null);
        setSelectedVideoSource(source);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(`Failed to load data for video source ${source}`);
    }
  };

  // Add this function before the useEffect
  const updateKPIValues = useCallback(async () => {
    if (!expandedCard || !filteredData) return;

    try {
      const response = await fetch(
        `${API_URL}/api/v1/Collection/filtered/count?collection=${encodeURIComponent(expandedCard.collectionName)}&VideoSource=${encodeURIComponent(expandedCard.videoSource)}`,
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
        throw new Error('Failed to fetch updated values');
      }

      const data = await response.json();
      
      if (data.fieldCounts) {
        setFilteredData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            rawResponse: {
              ...prev.rawResponse,
              ruleCounts: data.fieldCounts
            }
          };
        });
      }
    } catch (error) {
      console.error('Error updating KPI values:', error);
    }
  }, [expandedCard, filteredData]);

  // Update the socket effect to handle both types of updates
  useEffect(() => {
    // Start polling when component mounts
    socket.emit('startPolling');

    // Function to handle updates
    const handleUpdate = (data: any) => {
      console.log('Received update:', data);
      
      if (expandedCard?.collectionName && filteredData) {
        // Check if the update is for the current collection and source
        if (data.collection === expandedCard.collectionName && 
            (!data.videoSource || data.videoSource === expandedCard.videoSource)) {
          setFilteredData(prev => {
            if (!prev) return prev;

            const newRuleCounts = {
              ...prev.rawResponse?.ruleCounts,
              ...(data.fieldCounts || {})
            };

            return {
              ...prev,
              rawResponse: {
                ...prev.rawResponse,
                ruleCounts: newRuleCounts
              }
            };
          });
        }
      }
    };

    // Listen for both types of updates
    socket.on('kpiUpdate', handleUpdate);
    socket.on('dataUpdated', handleUpdate);

    // Set up polling interval
    const interval = setInterval(updateKPIValues, 5000);

    // Cleanup
    return () => {
      socket.off('kpiUpdate', handleUpdate);
      socket.off('dataUpdated', handleUpdate);
      clearInterval(interval);
    };
  }, [expandedCard, filteredData, updateKPIValues]);

  // Keep only one copy of the styles effect
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Add this to ensure widgets are properly mounted
  useEffect(() => {
    console.log('Widgets container content:', document.querySelector('.widgets-container')?.innerHTML);
  }, []);

  // Add this CSS class for the update animation
  const styles = `
    .rule-count-badge {
      transition: all 0.3s ease;
    }

    .rule-count-badge.updating {
      animation: pulse 0.5s ease-in-out;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); color: #4f46e5; }
      100% { transform: scale(1); }
    }

    .value-updated {
      animation: valueUpdate 0.5s ease-out;
    }

    @keyframes valueUpdate {
      0% { transform: scale(1); color: inherit; }
      50% { transform: scale(1.1); color: #4f46e5; }
      100% { transform: scale(1); color: inherit; }
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

  // Update the renderRuleCard function
  const renderRuleCard = (rule: string, count: number) => (
    <div key={`${rule}`} className="rule-card" onClick={(e) => e.stopPropagation()}>
      <div className="rule-card-header">
        <h5>{rule}</h5>
        <span className="rule-count-badge">
          {count}
        </span>
      </div>
      <div className="rule-card-body">
        <div className="rule-info">
          <span className="source-label">Source:</span>
          <span className="source-value">{expandedCard?.videoSource}</span>
        </div>
        <div className="rule-info">
          <span className="update-label">Last Updated:</span>
          <span className="update-value">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="widgets-page">
      <ToastContainer />
      <h1>Widgets</h1>

        <div className="data-selection-section">

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
            {Array.isArray(collectionsData) && collectionsData.map((collectionName: string) => (
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
                    <div className="content-wrapper">
                      <div className="video-source-section">
                        <h4>Video Sources</h4>
                        <div className="source-buttons">
                          {availableVideoSources.map(source => (
                            <button
                              key={source}
                              className={`source-button ${expandedCard.videoSource === source ? 'selected' : ''}`}
                              onClick={(e) => handleVideoSourceChange(source, e)}
                            >
                              Source {source}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="rules-section">
                        <h4>Rule Counts</h4>
                        {filteredData.rawResponse?.ruleCounts && (
                          <div className="rules-grid">
                            {Object.entries(filteredData.rawResponse.ruleCounts).map(([rule, count]) => 
                              renderRuleCard(rule, typeof count === 'number' ? count : 0)
                            )}
                          </div>
                        )}
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