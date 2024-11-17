import React, { useState, useEffect } from 'react';
import { vehicleData, VehicleStats } from '../../../data/vehicleData';
import './Widget.css';
import GraphModal from './GraphModal';
import { useGraphs } from '../../../context/GraphContext';

const Widget: React.FC = () => {
  const [dataType, setDataType] = useState<'single' | 'multiple'>('multiple');
  const [selectedData, setSelectedData] = useState<VehicleStats[]>([]);
  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);

  const { addKPICard } = useGraphs();

  // Reset selected data when switching modes
  useEffect(() => {
    setSelectedData([]);
  }, [dataType]);

  const handleDataSelection = (vehicle: VehicleStats) => {
    if (dataType === 'single') {
      // In single mode, only allow one selection
      setSelectedData([vehicle]);
    } else {
      // In multiple mode, toggle selection
      setSelectedData(prev => {
        const isSelected = prev.some(item => item.vehicleType === vehicle.vehicleType);
        if (isSelected) {
          return prev.filter(item => item.vehicleType !== vehicle.vehicleType);
        } else {
          return [...prev, vehicle];
        }
      });
    }
  };

  const handleSelectAll = () => {
    if (dataType === 'multiple') {
      if (selectedData.length === vehicleData.length) {
        setSelectedData([]);
      } else {
        setSelectedData([...vehicleData]);
      }
    }
  };

  const handleCreateCard = () => {
    if (selectedData.length > 0) {
      addKPICard(selectedData);
      // Optional: Show success message or notification
      alert('KPI Cards created successfully!');
      // Optional: Clear selection after creating cards
      setSelectedData([]);
    }
  };

  return (
    <div className="widget-container">
      <div className="data-type-selector">
        <label htmlFor="dataType">Select Data Type:</label>
        <select 
          id="dataType"
          value={dataType}
          onChange={(e) => setDataType(e.target.value as 'single' | 'multiple')}
          className="data-type-dropdown"
        >
          <option value="single">Single Data</option>
          <option value="multiple">Multiple Data</option>
        </select>
      </div>

      <div className="widget-content">
        {dataType === 'multiple' && (
          <div className="data-controls">
            <button 
              onClick={handleSelectAll}
              className="select-all-btn"
            >
              {selectedData.length === vehicleData.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="selected-count">
              {selectedData.length} item{selectedData.length !== 1 ? 's' : ''} selected
            </span>
          </div>
        )}
        
        <div className="stats-grid">
          {vehicleData.map((vehicle, index) => (
            <div 
              key={index} 
              className={`stat-card ${
                selectedData.some(item => item.vehicleType === vehicle.vehicleType) ? 'selected' : ''
              } ${dataType === 'single' && selectedData.length > 0 && 
                !selectedData.some(item => item.vehicleType === vehicle.vehicleType) ? 'disabled' : ''
              }`}
              onClick={() => {
                if (dataType === 'single' && selectedData.length > 0 && 
                    !selectedData.some(item => item.vehicleType === vehicle.vehicleType)) {
                  return;
                }
                handleDataSelection(vehicle);
              }}
            >
              <div className="stat-card-header">
                <h3>{vehicle.vehicleType}</h3>
                <input
                  type="checkbox"
                  checked={selectedData.some(item => item.vehicleType === vehicle.vehicleType)}
                  onChange={() => handleDataSelection(vehicle)}
                  onClick={(e) => e.stopPropagation()}
                  className="stat-checkbox"
                  disabled={dataType === 'single' && selectedData.length > 0 && 
                    !selectedData.some(item => item.vehicleType === vehicle.vehicleType)}
                />
              </div>
              <div className="stat-details">
                <div className="stat-item">
                  <span className="stat-label">Total Count:</span>
                  <span className="stat-value">{vehicle.count}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total In:</span>
                  <span className="stat-value in">{vehicle.in}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Out:</span>
                  <span className="stat-value out">{vehicle.out}</span>
                </div>
                
                <div className="time-details">
                  <h4>Time Distribution</h4>
                  <div className="time-grid">
                    <div className="time-slot">
                      <span className="time-label">Morning</span>
                      <div className="time-values">
                        <span className="in">In: {vehicle.details.morning.in}</span>
                        <span className="out">Out: {vehicle.details.morning.out}</span>
                      </div>
                    </div>
                    <div className="time-slot">
                      <span className="time-label">Afternoon</span>
                      <div className="time-values">
                        <span className="in">In: {vehicle.details.afternoon.in}</span>
                        <span className="out">Out: {vehicle.details.afternoon.out}</span>
                      </div>
                    </div>
                    <div className="time-slot">
                      <span className="time-label">Evening</span>
                      <div className="time-values">
                        <span className="in">In: {vehicle.details.evening.in}</span>
                        <span className="out">Out: {vehicle.details.evening.out}</span>
                      </div>
                    </div>
                    <div className="time-slot">
                      <span className="time-label">Night</span>
                      <div className="time-values">
                        <span className="in">In: {vehicle.details.night.in}</span>
                        <span className="out">Out: {vehicle.details.night.out}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="stat-timestamp">
                  Last updated: {vehicle.lastUpdated}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {selectedData.length > 0 && (
          <div className="data-visualization-controls">
            <button 
              className="viz-btn"
              onClick={() => setIsGraphModalOpen(true)}
            >
              Generate Graph
            </button>
            <button 
              className="viz-btn create-card"
              onClick={handleCreateCard}
            >
              Create Card
            </button>
          </div>
        )}
      </div>

      <GraphModal 
        isOpen={isGraphModalOpen}
        onClose={() => setIsGraphModalOpen(false)}
        selectedData={selectedData}
      />
    </div>
  );
};

export default Widget; 