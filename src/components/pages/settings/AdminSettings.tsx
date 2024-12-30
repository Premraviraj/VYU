import React, { useState, useEffect } from 'react';
import './Settings.css';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

// Import icons
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import SystemUpdateIcon from '@mui/icons-material/SystemUpdate';
import PersonIcon from '@mui/icons-material/Person';
import KeyIcon from '@mui/icons-material/Key';
import EmailIcon from '@mui/icons-material/Email';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import LanguageIcon from '@mui/icons-material/Language';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';

// Add interface for user profile
interface UserProfile {
  username: string;
  email: string;
  avatar: string;
  notifications: boolean;
  role?: string;
}

// Add interface for account details
interface AccountDetail {
  icon: JSX.Element;
  label: string;
  value: string;
  editable: boolean;
  key: keyof UserProfile;
}

const AdminSettings: React.FC = () => {
  const { userRole, updateUserProfile } = useAuth();
  const { currentTheme, changeTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('account');
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: 'admin',
    email: 'admin@example.com',
    avatar: '',
    notifications: true,
    role: userRole
  });

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
    { id: 'appearance', icon: <ColorLensIcon />, label: 'Appearance' }
  ];

  // Update accountDetails with proper typing
  const accountDetails: AccountDetail[] = [
    { 
      icon: <PersonIcon />, 
      label: 'Role', 
      value: userProfile.role || userRole, 
      editable: false,
      key: 'role'
    },
    { 
      icon: <KeyIcon />, 
      label: 'Username', 
      value: userProfile.username, 
      editable: true,
      key: 'username'
    },
    { 
      icon: <EmailIcon />, 
      label: 'Email', 
      value: userProfile.email, 
      editable: true,
      key: 'email'
    },
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

    toast.success('Theme updated successfully!');
  };

  const handleProfileUpdate = async () => {
    try {
      await updateUserProfile(userProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  // Update the input handling
  const handleInputChange = (key: keyof UserProfile, value: string) => {
    setUserProfile(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <motion.div 
      className="settings-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="settings-header">
        <div className="header-content">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
          >
            <SettingsIcon className="settings-main-icon pulse" />
          </motion.div>
          <div className="header-text">
            <h1>Settings</h1>
            <p>Customize your admin experience</p>
          </div>
        </div>
      </div>

      <div className="settings-layout">
        <motion.div 
          className="settings-sidebar"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
              whileHover={{ x: 10 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {item.icon}
              <span>{item.label}</span>
              <div className="hover-indicator"></div>
            </motion.div>
          ))}
        </motion.div>

        <AnimatePresence mode='wait'>
          <motion.div 
            key={activeSection}
            className="settings-content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeSection === 'account' && (
              <div className="settings-section">
                <h2>Profile Settings</h2>
                <div className="profile-grid">
                  {accountDetails.map((detail, index) => (
                    <motion.div 
                      key={index} 
                      className="profile-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="profile-icon">{detail.icon}</div>
                      <div className="profile-info">
                        <label>{detail.label}</label>
                        {isEditing && detail.editable ? (
                          <input 
                            type="text" 
                            value={detail.value}
                            onChange={(e) => handleInputChange(detail.key, e.target.value)}
                            className="profile-input"
                          />
                        ) : (
                          <span className="value highlight">{detail.value}</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="profile-actions">
                  {isEditing ? (
                    <>
                      <button className="save-btn" onClick={handleProfileUpdate}>Save Changes</button>
                      <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                    </>
                  ) : (
                    <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'appearance' && (
              <div className="settings-section">
                <h2>Theme Settings</h2>
                <div className="theme-grid">
                  {themes.map((theme, index) => (
                    <motion.div
                      key={theme.id}
                      className={`theme-card ${currentTheme === theme.id ? 'selected' : ''}`}
                      onClick={() => handleThemeChange(theme.id)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div 
                        className="theme-preview"
                        style={{ background: theme.gradient }}
                      ></div>
                      <span className="theme-name">{theme.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AdminSettings; 