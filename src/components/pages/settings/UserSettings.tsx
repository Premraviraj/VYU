import React from 'react';
import './Settings.css';
import { useAuth } from '../../../context/AuthContext';

const UserSettings: React.FC = () => {
  const { userRole } = useAuth();

  return (
    <div className="settings-container">
      <h1>User Settings</h1>
      
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
              <span className="value">user</span>
            </div>
            <div className="settings-item">
              <label>Last Login</label>
              <span className="value">{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Display Settings</h2>
          <div className="settings-card">
            <div className="settings-item">
              <label>Theme</label>
              <select defaultValue="light">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            <div className="settings-item">
              <label>Dashboard Layout</label>
              <select defaultValue="grid">
                <option value="grid">Grid</option>
                <option value="list">List</option>
              </select>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Notifications</h2>
          <div className="settings-card">
            <div className="settings-item">
              <label>Email Updates</label>
              <div className="toggle-switch">
                <input type="checkbox" id="email" />
                <label htmlFor="email"></label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings; 