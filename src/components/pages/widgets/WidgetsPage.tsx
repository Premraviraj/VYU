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
          fieldCounts: data.fieldCounts || {}
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
      console.log('Updated collection data:', data);
      console.log('Updated field counts:', data.fieldCounts);
      
      // Update the filtered data with the new source's data
      if (data && typeof data === 'object') {
        // Transform the data to include both rule counts and rule details
        const processedData: FilteredData = {
          collection: expandedCard.collectionName,
          filter: {
            VideoSource: source
          },
          data: Array.isArray(data.data) ? data.data.map((item: any) => ({
            Rule: item.Rule || '',
            Count: item.Count || 0,
            VideoSource: source,
            LastUpdated: item.LastUpdated || new Date().toISOString()
          })) : [],
          fieldCounts: data.fieldCounts || {}
        };

        setFilteredData(processedData);
        setExpandedCard(prev => prev ? { ...prev, videoSource: source } : null);
        setSelectedVideoSource(source);

        // Show the updated data in a toast notification
        if (data.fieldCounts) {
          const totalCount = Object.values(data.fieldCounts).reduce<number>(
            (sum, count) => sum + (typeof count === 'number' ? count : 0), 
            0
          );
          toast.info(`Source ${source} Total Count: ${totalCount}`, {
            position: "top-right",
            autoClose: 3000
          });
        }
      } else {
        throw new Error('Invalid data format received from server');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
                      <div className="rules-grid">
                      {filteredData?.data.map((ruleData, index) => (
                        <div key={index} className="rule-item" onClick={(e) => e.stopPropagation()}>
                        <div className="rule-header">
                          <span className="rule-name">{ruleData.Rule}</span>
                          <span className="rule-count">{ruleData.Count}</span>
                        </div>
                        <div className="rule-details">
                          <span className="video-source">Source: {expandedCard.videoSource}</span>
                          <span className="last-updated">
                          Last Updated: {new Date(ruleData.LastUpdated || '').toLocaleTimeString()}
                          </span>
                        </div>
                        </div>
                      ))}
                      </div>
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