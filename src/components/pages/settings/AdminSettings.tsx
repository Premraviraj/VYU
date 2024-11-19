import React, { useState } from 'react';
import './Settings.css';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import SystemUpdateIcon from '@mui/icons-material/SystemUpdate';
import PersonIcon from '@mui/icons-material/Person';
import KeyIcon from '@mui/icons-material/Key';
import EmailIcon from '@mui/icons-material/Email';

const AdminSettings: React.FC = () => {
  const { userRole } = useAuth();
  const { currentTheme, changeTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('account');

  const themes = [
    { id: 'default', name: 'Default', color: '#4f46e5', gradient: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
    { id: 'emerald', name: 'Emerald', color: '#059669', gradient: 'linear-gradient(135deg, #059669, #10b981)' },
    { id: 'royal', name: 'Royal', color: '#7c3aed', gradient: 'linear-gradient(135deg, #7c3aed, #8b5cf6)' },
    { id: 'crimson', name: 'Crimson', color: '#dc2626', gradient: 'linear-gradient(135deg, #dc2626, #ef4444)' },
    { id: 'midnight', name: 'Midnight', color: '#1e293b', gradient: 'linear-gradient(135deg, #1e293b, #334155)' },
    { id: 'sunset', name: 'Sunset', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
  ];

  const menuItems = [
    { id: 'account', icon: <AccountCircleIcon />, label: 'Profile' },
    { id: 'system', icon: <SystemUpdateIcon />, label: 'System' },
    { id: 'appearance', icon: <ColorLensIcon />, label: 'Appearance' },
  ];

  const accountDetails = [
    { icon: <PersonIcon />, label: 'Role', value: userRole },
    { icon: <KeyIcon />, label: 'Username', value: 'admin' },
    { icon: <EmailIcon />, label: 'Email', value: 'admin@example.com' },
  ];

  const handleThemeChange = (themeId: string) => {
    changeTheme(themeId);
    localStorage.setItem('theme', themeId);
    
    // Add ripple effect
    const ripple = document.createElement('div');
    ripple.className = 'theme-ripple';
    document.body.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 1000);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div className="header-content">
          <SettingsIcon className="settings-main-icon pulse" />
          <div className="header-text">
            <h1>Settings</h1>
            <p>Customize your admin experience</p>
          </div>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-sidebar">
          {menuItems.map(item => (
            <div
              key={item.id}
              className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
              <div className="hover-indicator"></div>
            </div>
          ))}
        </div>

        <div className="settings-content">
          {activeSection === 'account' && (
            <div className="settings-section animate-in">
              <h2>Profile Settings</h2>
              <div className="profile-grid">
                {accountDetails.map((detail, index) => (
                  <div key={index} className="profile-card">
                    <div className="profile-icon">{detail.icon}</div>
                    <div className="profile-info">
                      <label>{detail.label}</label>
                      <span className="value highlight">{detail.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="settings-section animate-in">
              <h2>Theme Settings</h2>
              <div className="theme-grid">
                {themes.map(theme => (
                  <div
                    key={theme.id}
                    className={`theme-card ${currentTheme === theme.id ? 'selected' : ''}`}
                    onClick={() => handleThemeChange(theme.id)}
                  >
                    <div 
                      className="theme-preview"
                      style={{ background: theme.gradient }}
                    ></div>
                    <span className="theme-name">{theme.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'system' && (
            <div className="settings-section animate-in">
              <h2>System Preferences</h2>
              <div className="settings-card">
                <div className="settings-item">
                  <label>Auto-refresh Dashboard</label>
                  <div className="toggle-switch">
                    <input type="checkbox" id="refresh" />
                    <label htmlFor="refresh"></label>
                  </div>
                </div>
                <div className="settings-item">
                  <label>Export Format</label>
                  <select className="settings-select" defaultValue="json">
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                    <option value="excel">Excel</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings; 