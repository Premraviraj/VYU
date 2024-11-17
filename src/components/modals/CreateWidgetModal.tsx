import React from 'react';
import './CreateWidgetModal.css';

interface CreateWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateWidgetModal: React.FC<CreateWidgetModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="create-widget-modal-overlay" onClick={onClose}>
      <div className="create-widget-modal-content" onClick={e => e.stopPropagation()}>
        <div className="create-widget-modal-header">
          <h2>Create New Analytics Widget</h2>
          <button className="modal-close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="create-widget-modal-body">
          <div className="widget-type-selection">
            <div className="chart-type-grid">
              <div className="chart-type-option">
                <i className="fas fa-chart-line"></i>
                <span>Line Chart</span>
              </div>
              <div className="chart-type-option">
                <i className="fas fa-chart-bar"></i>
                <span>Bar Chart</span>
              </div>
              <div className="chart-type-option">
                <i className="fas fa-chart-pie"></i>
                <span>Pie Chart</span>
              </div>
              <div className="chart-type-option">
                <i className="fas fa-chart-area"></i>
                <span>Area Chart</span>
              </div>
            </div>
          </div>

          <div className="widget-configuration">
            <div className="config-section">
              <h3>Widget Configuration</h3>
              <div className="config-form">
                <div className="form-group">
                  <label>Widget Name</label>
                  <input type="text" placeholder="Enter widget name" />
                </div>
                <div className="form-group">
                  <label>Data Source</label>
                  <select>
                    <option value="">Select data source</option>
                    <option value="vehicles">Vehicle Data</option>
                    <option value="traffic">Traffic Data</option>
                    <option value="performance">Performance Data</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Refresh Rate</label>
                  <select>
                    <option value="5">Every 5 seconds</option>
                    <option value="30">Every 30 seconds</option>
                    <option value="60">Every minute</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button className="cancel-button" onClick={onClose}>Cancel</button>
            <button className="create-button">
              <i className="fas fa-plus"></i> Create Widget
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWidgetModal; 