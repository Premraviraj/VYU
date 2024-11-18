import React, { useState, useEffect } from 'react';
import { useGraphs } from '../../../context/GraphContext';
import { VehicleStats } from '../../../data/vehicleData';
import GraphModal from './GraphModal';
import KPIModal from './KPIModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './WidgetsPage.css';
import { API_URL } from '../../../utils/config';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import StarIcon from '@mui/icons-material/Star';

const WidgetsPage: React.FC = () => {
  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);
  const [isKPIModalOpen, setIsKPIModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<VehicleStats[]>([]);
  const [vehicleData, setVehicleData] = useState<VehicleStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isValidReactNode = (value: unknown): value is React.ReactNode => {
    return typeof value === 'string' 
      || typeof value === 'number' 
      || typeof value === 'boolean'
      || value === null
      || value === undefined;
  };

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
        
        const transformedData = Object.entries(data).map(([key, value]: [string, any]) => ({
          vehicleType: key,
          count: typeof value.count === 'number' ? value.count : 0,
          in: typeof value.in === 'number' ? value.in : 0,
          out: typeof value.out === 'number' ? value.out : 0,
          details: {
            morning: {
              in: value?.morning?.in || value?.details?.morning?.in || 0,
              out: value?.morning?.out || value?.details?.morning?.out || 0
            },
            afternoon: {
              in: value?.afternoon?.in || value?.details?.afternoon?.in || 0,
              out: value?.afternoon?.out || value?.details?.afternoon?.out || 0
            },
            evening: {
              in: value?.evening?.in || value?.details?.evening?.in || 0,
              out: value?.evening?.out || value?.details?.evening?.out || 0
            },
            night: {
              in: value?.night?.in || value?.details?.night?.in || 0,
              out: value?.night?.out || value?.details?.night?.out || 0
            }
          },
          lastUpdated: value.lastUpdated || new Date().toISOString(),
          rawData: value
        }));

        console.log('Transformed Data:', transformedData);
        setVehicleData(transformedData);
        setError(null);
      } catch (err) {
        console.error('Fetch Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        toast.error('Failed to load vehicle data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDataSelection = (vehicle: VehicleStats) => {
    setSelectedData(prev => {
      const isSelected = prev.some(v => v.vehicleType === vehicle.vehicleType);
      if (isSelected) {
        return prev.filter(v => v.vehicleType !== vehicle.vehicleType);
      } else {
        return [...prev, vehicle];
      }
    });
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

  const renderValue = (value: unknown): React.ReactNode => {
    if (isValidReactNode(value)) {
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

  return (
    <div className="widgets-page">
      <ToastContainer />
      <h1>Widgets</h1>

      <div className="data-selection-section">
        <h2>Select Data</h2>
        {isLoading ? (
          <div className="loading-spinner">Loading...</div>
        ) : error ? (
          <div className="error-message">
            {error}
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : (
          <div className="data-grid">
            {vehicleData.map((vehicle, index) => (
              <div
                key={`${vehicle.vehicleType}-${index}`}
                className={`data-card ${selectedData.some(v => v.vehicleType === vehicle.vehicleType) ? 'selected' : ''}`}
                onClick={() => handleDataSelection(vehicle)}
              >
                <div className="data-header">
                  <h3>{vehicle.vehicleType}</h3>
                  <span className="last-updated">Updated: {vehicle.lastUpdated}</span>
                </div>
                
                <div className="data-content">
                  {Object.entries(vehicle.rawData).map(([key, value]) => {
                    if (['vehicleType', 'lastUpdated', 'rawData'].includes(key)) return null;
                    
                    if (typeof value === 'object' && value !== null) {
                      return (
                        <div key={key} className="nested-data">
                          <h4>
                            <CalendarTodayIcon className="section-icon" />
                            {key}
                          </h4>
                          <div className="nested-values">
                            {Object.entries(value).map(([subKey, subValue]) => {
                              const timeValue = renderTimeValue(subValue);
                              return (
                                <div key={`${key}-${subKey}`} className="data-item">
                                  {getTimeIcon(subKey)}
                                  <span className="data-label">{subKey}</span>
                                  <div className="data-values">
                                    <div className="value-item">
                                      <ArrowUpwardIcon className="direction-icon in" />
                                      <span>{renderValue(timeValue.in)}</span>
                                    </div>
                                    <div className="value-item">
                                      <ArrowDownwardIcon className="direction-icon out" />
                                      <span>{renderValue(timeValue.out)}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div key={key} className="data-item">
                        <div className="data-item-header">
                          {key === 'count' && <DirectionsCarIcon className="stat-icon" />}
                          {key === 'in' && <ArrowUpwardIcon className="stat-icon in" />}
                          {key === 'out' && <ArrowDownwardIcon className="stat-icon out" />}
                          <span className="data-label">{key}</span>
                        </div>
                        <span className="data-value">{renderValue(value)}</span>
                      </div>
                    );
                  })}
                </div>
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