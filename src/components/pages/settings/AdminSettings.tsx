import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import './Settings.css';
import ChangePasswordModal from '../../modals/ChangePasswordModal';

const themes = [
  { id: 'default', name: 'Default Blue', primary: '#1a237e', secondary: '#0d47a1' },
  { id: 'emerald', name: 'Emerald Green', primary: '#004d40', secondary: '#00695c' },
  { id: 'royal', name: 'Royal Purple', primary: '#4a148c', secondary: '#6a1b9a' },
  { id: 'crimson', name: 'Crimson Red', primary: '#b71c1c', secondary: '#c62828' },
  { id: 'midnight', name: 'Midnight Blue', primary: '#1a237e', secondary: '#283593' },
  { id: 'sunset', name: 'Sunset Orange', primary: '#e65100', secondary: '#ef6c00' }
];

const AdminSettings: React.FC = () => {
  const { logout, userRole } = useAuth();
  const lastLogin = localStorage.getItem('lastLoginTime') || new Date().toLocaleString();
  const [currentTheme, setCurrentTheme] = useState(() => 
    localStorage.getItem('appTheme') || 'default'
  );
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const applyTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      document.documentElement.setAttribute('data-theme', themeId);
      document.documentElement.style.setProperty('--primary-color', theme.primary);
      document.documentElement.style.setProperty('--secondary-color', theme.secondary);
      localStorage.setItem('appTheme', themeId);
      setCurrentTheme(themeId);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('appTheme') || 'default';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  return (
    <div className="settings-container admin-settings">
      <div className="settings-content">
        <div className="settings-header">
          <h1>Admin Settings</h1>
          <p>Manage your administrative preferences</p>
        </div>

        <div className="settings-card">
          <div className="settings-section">
            <h2>Profile Information</h2>
            <div className="profile-info">
              <div className="info-group">
                <label>Profile</label>
                <p className="info-value">admin</p>
              </div>
              <div className="info-group">
                <label>Role</label>
                <p className="info-value">{userRole}</p>
              </div>
              <div className="info-group">
                <label>Last Login</label>
                <p className="info-value">{lastLogin}</p>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h2>Theme Customization</h2>
            <div className="theme-options">
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
                  onClick={() => applyTheme(theme.id)}
                >
                  <div 
                    className="theme-preview"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  />
                  <span className="theme-name">{theme.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="settings-section">
            <h2>Account Security</h2>
            <div className="security-options">
              <button 
                className="settings-button secondary"
                onClick={() => setIsPasswordModalOpen(true)}
              >
                Change Password
              </button>
              <button className="settings-button secondary">
                Two-Factor Authentication
              </button>
            </div>
          </div>

          <div className="settings-section">
            <h2>Session Management</h2>
            <div className="session-actions">
              <button onClick={logout} className="settings-button danger">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

export default AdminSettings; 