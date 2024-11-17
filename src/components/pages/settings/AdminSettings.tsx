import React from 'react';
import './Settings.css';
import { useAuth } from '../../../context/AuthContext';

const AdminSettings: React.FC = () => {
  const { userRole } = useAuth();

  return (
    <div className="settings-container">
      <h1>Admin Settings</h1>
      
      <div className="settings-grid">
        <div className="settings-section">
          <h2>Account Settings</h2>
          <div className="settings-card">
            <div className="settings-item">
              <label>Role</label>
              <span className="value">{userRole}</span>
            </div>
            <div className="settings-item">
              <label>Username</label>
              <span className="value">admin</span>
            </div>
            <div className="settings-item">
              <label>Last Login</label>
              <span className="value">{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>System Settings</h2>
          <div className="settings-card">
            <div className="settings-item">
              <label>Dashboard Auto-refresh</label>
              <div className="toggle-switch">
                <input type="checkbox" id="refresh" />
                <label htmlFor="refresh"></label>
              </div>
            </div>
            <div className="settings-item">
              <label>Data Export Format</label>
              <select defaultValue="json">
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="excel">Excel</option>
              </select>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Notifications</h2>
          <div className="settings-card">
            <div className="settings-item">
              <label>Email Notifications</label>
              <div className="toggle-switch">
                <input type="checkbox" id="email" />
                <label htmlFor="email"></label>
              </div>
            </div>
            <div className="settings-item">
              <label>System Alerts</label>
              <div className="toggle-switch">
                <input type="checkbox" id="alerts" defaultChecked />
                <label htmlFor="alerts"></label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings; 