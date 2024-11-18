import React, { useState } from 'react';
import { useGraphs } from '../../../context/GraphContext';
import { VehicleStats, vehicleData } from '../../../data/vehicleData';
import GraphModal from './GraphModal';
import KPIModal from './KPIModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './WidgetsPage.css';

const WidgetsPage: React.FC = () => {
  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);
  const [isKPIModalOpen, setIsKPIModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<VehicleStats[]>([]);
  const { addKPICard } = useGraphs();

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

  return (
    <div className="widgets-page">
      <ToastContainer />
      <h1>Widgets</h1>

      <div className="data-selection-section">
        <h2>Select Data</h2>
        <div className="data-grid">
          {vehicleData.map((vehicle) => (
            <div
              key={vehicle.vehicleType}
              className={`data-card ${selectedData.some(v => v.vehicleType === vehicle.vehicleType) ? 'selected' : ''}`}
              onClick={() => handleDataSelection(vehicle)}
            >
              <div className="data-header">
                <h3>{vehicle.vehicleType}</h3>
                <span className="last-updated">Updated: {vehicle.lastUpdated}</span>
              </div>
              <div className="data-stats">
                <div className="stat-item total">
                  <span className="stat-value">{vehicle.count}</span>
                  <span className="stat-label">Total</span>
                </div>
                <div className="stat-item in">
                  <span className="stat-value">{vehicle.in}</span>
                  <span className="stat-label">In</span>
                </div>
                <div className="stat-item out">
                  <span className="stat-value">{vehicle.out}</span>
                  <span className="stat-label">Out</span>
                </div>
              </div>
              <div className="time-details">
                <div className="time-period">
                  <h4>Morning</h4>
                  <div className="time-stats">
                    <span className="in">In: {vehicle.details.morning.in}</span>
                    <span className="out">Out: {vehicle.details.morning.out}</span>
                  </div>
                </div>
                <div className="time-period">
                  <h4>Afternoon</h4>
                  <div className="time-stats">
                    <span className="in">In: {vehicle.details.afternoon.in}</span>
                    <span className="out">Out: {vehicle.details.afternoon.out}</span>
                  </div>
                </div>
                <div className="time-period">
                  <h4>Evening</h4>
                  <div className="time-stats">
                    <span className="in">In: {vehicle.details.evening.in}</span>
                    <span className="out">Out: {vehicle.details.evening.out}</span>
                  </div>
                </div>
                <div className="time-period">
                  <h4>Night</h4>
                  <div className="time-stats">
                    <span className="in">In: {vehicle.details.night.in}</span>
                    <span className="out">Out: {vehicle.details.night.out}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
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