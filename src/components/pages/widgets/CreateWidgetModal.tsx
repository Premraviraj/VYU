import React from 'react';
import { VehicleStats } from '../../../data/vehicleData';
import './CreateWidgetModal.css';

interface CreateWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVehicle: VehicleStats;
}

const CreateWidgetModal: React.FC<CreateWidgetModalProps> = ({
  isOpen,
  onClose,
  selectedVehicle
}) => {
  if (!isOpen) return null;

  return (
    <div className="create-widget-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{selectedVehicle.vehicleType} Statistics</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {/* Main Stats */}
          <div className="stats-section">
            <div className="stat-box total">
              <h4>Total Count</h4>
              <div className="stat-value">{selectedVehicle.count}</div>
            </div>
            <div className="stat-box entry">
              <h4>Entry</h4>
              <div className="stat-value">
                ↑ {selectedVehicle.filteredStats?.RuleCounts.Entry || 0}
              </div>
            </div>
            <div className="stat-box exit">
              <h4>Exit</h4>
              <div className="stat-value">
                ↓ {selectedVehicle.filteredStats?.RuleCounts.Exit || 0}
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="additional-stats">
            <div className="stat-row">
              <span className="stat-label">Last Updated:</span>
              <span className="stat-value">{new Date(selectedVehicle.lastUpdated).toLocaleString()}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Video Source:</span>
              <span className="stat-value">{selectedVehicle.filteredStats?.VideoSource || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>Cancel</button>
          <button className="create-button">Create Widget</button>
        </div>
      </div>
    </div>
  );
};

export default CreateWidgetModal; 