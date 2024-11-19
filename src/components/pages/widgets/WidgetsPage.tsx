import React, { useState, useEffect } from 'react';

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

const WidgetsPage: React.FC = () => {
  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);
  const [isKPIModalOpen, setIsKPIModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any[]>([]);
  const [collectionsData, setCollectionsData] = useState<{[key: string]: any}>({});
  const [expandedCollection, setExpandedCollection] = useState<string | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collectionDetails, setCollectionDetails] = useState<{ [key: string]: any }>({});
  const [loadingDetails, setLoadingDetails] = useState<{ [key: string]: boolean }>({});

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
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        console.log('Raw API Response:', data);
        setCollectionsData(data);
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

  const handleDataSelection = (collectionName: string) => {
    setSelectedData(prev => {
      const isSelected = prev.some(item => item.name === collectionName);
      if (isSelected) {
        return prev.filter(item => item.name !== collectionName);
      } else {
        return [...prev, { name: collectionName }];
      }
    });
  };

  const handleCardClick = (collectionName: string) => {
    console.log('Expanding collection:', collectionName);
    setExpandedCollection(expandedCollection === collectionName ? 'all' : collectionName);
  };

  const handleCreateGraph = () => {
    if (selectedData.length > 0) {
      setIsGraphModalOpen(true);
    }
  };

  const handleCreateKPI = () => {
    if (selectedData.length > 0) {
      setIsKPIModalOpen(true);
    }
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

  interface TimeValue {
    in: number;
    out: number;
  }

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

  return (
    <div className="widgets-page">
      <ToastContainer />
      <h1>Widgets</h1>

      <div className="data-selection-section">
        <h2>Select Data</h2>
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
            {sortCollections(Object.keys(collectionsData)).map((collectionName) => (
              <div
                key={collectionName}
                className={`collection-card ${
                  selectedData.some(item => item.name === collectionName) ? 'selected' : ''
                } ${expandedCollection === 'all' || expandedCollection === collectionName ? 'expanded' : ''}`}
              >
                <div 
                  className="collection-header"
                  onClick={() => handleCardClick(collectionName)}
                >
                  <div className="header-content">
                    <LayersOutlinedIcon className="collection-icon" />
                    <div className="collection-info">
                      <h3>Collection {getCollectionNumber(collectionName)}</h3>
                    </div>
                  </div>
                </div>
                
                <div className="collection-status" onClick={() => handleDataSelection(collectionName)}>
                  <div className="status-indicator active"></div>
                  <span>Active Collections</span>
                </div>

                {(expandedCollection === 'all' || expandedCollection === collectionName) && (
                  <div className="collection-details">
                    <div className="details-grid">
                      {Object.entries(collectionsData[collectionName] || {}).map(([key, value]) => (
                        <div 
                          key={key} 
                          className="detail-card"
                          onClick={() => handleDetailCardClick(key)}
                        >
                          <div className="detail-header">
                            {getIconForKey(key)}
                            <h4>{key}</h4>
                          </div>
                          <div className="detail-content">
                            {loadingDetails[collectionName] ? (
                              <div className="loading-container">
                                <StackLoader size="small" />
                                <span className="loading-text">Loading Details...</span>
                              </div>
                            ) : collectionDetails[key] ? (
                              <div className="detail-value-container">
                                <span className="detail-value">
                                  {typeof collectionDetails[key] === 'object' 
                                    ? JSON.stringify(collectionDetails[key], null, 2)
                                    : collectionDetails[key]}
                                </span>
                                <span className="detail-label">{key}</span>
                              </div>
                            ) : (
                              <div className="detail-value-container">
                                <span className="detail-value">{formatValue(value)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
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
            className={`widget-card ${selectedData.length === 0 ? 'disabled' : ''}`}
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
            className={`widget-card ${selectedData.length === 0 ? 'disabled' : ''}`}
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
        selectedData={selectedData}
        onGraphCreated={handleGraphCreated}
      />

      <KPIModal
        isOpen={isKPIModalOpen}
        onClose={() => setIsKPIModalOpen(false)}
        selectedData={selectedData}
        onKPICreated={handleKPICreated}
      />
    </div>
  );
};

export default WidgetsPage; 