import React from 'react';
import { VehicleStats } from '../../data/vehicleData';
import './VehicleDataModal.css';

interface VehicleDataModalProps {
  data: VehicleStats | undefined;
  isOpen: boolean;
  onClose: () => void;
}

const VehicleDataModal: React.FC<VehicleDataModalProps> = ({ data, isOpen, onClose }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{data.vehicleType} Details</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="stats-overview">
            <div className="stat-box total">
              <span className="stat-label">Total</span>
              <span className="stat-value">{data.count}</span>
            </div>
            <div className="stat-box in">
              <span className="stat-label">In</span>
              <span className="stat-value">{data.in}</span>
            </div>
            <div className="stat-box out">
              <span className="stat-label">Out</span>
              <span className="stat-value">{data.out}</span>
            </div>
          </div>

          <div className="time-details-section">
            <h3>Time Details</h3>
            <div className="time-grid">
              <div className="time-slot">
                <h4>Morning</h4>
                <div className="time-stats">
                  <span>In: {data.details.morning.in}</span>
                  <span>Out: {data.details.morning.out}</span>
                </div>
              </div>
              <div className="time-slot">
                <h4>Afternoon</h4>
                <div className="time-stats">
                  <span>In: {data.details.afternoon.in}</span>
                  <span>Out: {data.details.afternoon.out}</span>
                </div>
              </div>
              <div className="time-slot">
                <h4>Evening</h4>
                <div className="time-stats">
                  <span>In: {data.details.evening.in}</span>
                  <span>Out: {data.details.evening.out}</span>
                </div>
              </div>
              <div className="time-slot">
                <h4>Night</h4>
                <div className="time-stats">
                  <span>In: {data.details.night.in}</span>
                  <span>Out: {data.details.night.out}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="additional-details">
            {data.status && (
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <span className="detail-value">{data.status}</span>
              </div>
            )}
            {data.occupancy && (
              <div className="detail-item">
                <span className="detail-label">Occupancy</span>
                <span className="detail-value">{data.occupancy}</span>
              </div>
            )}
            {data.fuelLevel && (
              <div className="detail-item">
                <span className="detail-label">Fuel Level</span>
                <span className="detail-value">{data.fuelLevel}%</span>
              </div>
            )}
            {data.speed && (
              <div className="detail-item">
                <span className="detail-label">Speed</span>
                <span className="detail-value">{data.speed} km/h</span>
              </div>
            )}
            {data.location && (
              <div className="detail-item">
                <span className="detail-label">Location</span>
                <span className="detail-value">{data.location}</span>
              </div>
            )}
            {data.route && (
              <div className="detail-item">
                <span className="detail-label">Route</span>
                <span className="detail-value">{data.route}</span>
              </div>
            )}
            {data.nextService && (
              <div className="detail-item">
                <span className="detail-label">Next Service</span>
                <span className="detail-value">{data.nextService}</span>
              </div>
            )}
          </div>

          <div className="last-updated">
            Last Updated: {data.lastUpdated}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDataModal; 