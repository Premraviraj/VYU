import React from 'react';
import { VehicleStats } from '../../../data/vehicleData';
import './CreateWidgetModal.css';

interface CreateWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'graph' | 'kpi';
  selectedVehicle: VehicleStats | null;
}

const CreateWidgetModal: React.FC<CreateWidgetModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  selectedVehicle
}) => {
  if (!isOpen || !selectedVehicle) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create {type === 'graph' ? 'Graph' : 'KPI'} Widget</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="vehicle-info">
            <div className="info-header">
              <div className="vehicle-type">{selectedVehicle.vehicleType}</div>
              <div className="last-updated">Last updated: {selectedVehicle.lastUpdated}</div>
            </div>

            <div className="data-constraints">
              <h3>Data Constraints</h3>
              <div className="constraints-grid">
                <div className="constraint-item">
                  <span className="constraint-label">Total Vehicles</span>
                  <span className="constraint-value">{selectedVehicle.count}</span>
                </div>
                <div className="constraint-item">
                  <span className="constraint-label">Current In</span>
                  <span className="constraint-value in">{selectedVehicle.in}</span>
                </div>
                <div className="constraint-item">
                  <span className="constraint-label">Current Out</span>
                  <span className="constraint-value out">{selectedVehicle.out}</span>
                </div>
              </div>
            </div>

            <div className="time-distribution">
              <h3>Time Distribution</h3>
              <div className="time-grid">
                <div className="time-block">
                  <h4>Morning</h4>
                  <div className="time-stats">
                    <span className="in">↑ {selectedVehicle.details.morning.in}</span>
                    <span className="out">↓ {selectedVehicle.details.morning.out}</span>
                  </div>
                </div>
                <div className="time-block">
                  <h4>Afternoon</h4>
                  <div className="time-stats">
                    <span className="in">↑ {selectedVehicle.details.afternoon.in}</span>
                    <span className="out">↓ {selectedVehicle.details.afternoon.out}</span>
                  </div>
                </div>
                <div className="time-block">
                  <h4>Evening</h4>
                  <div className="time-stats">
                    <span className="in">↑ {selectedVehicle.details.evening.in}</span>
                    <span className="out">↓ {selectedVehicle.details.evening.out}</span>
                  </div>
                </div>
                <div className="time-block">
                  <h4>Night</h4>
                  <div className="time-stats">
                    <span className="in">↑ {selectedVehicle.details.night.in}</span>
                    <span className="out">↓ {selectedVehicle.details.night.out}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>Cancel</button>
          <button className="confirm-button" onClick={onConfirm}>
            Create Widget
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateWidgetModal; 