import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const { userRole } = useAuth();
  const basePath = userRole === 'admin' ? '/localconfig' : '/localhost';

  return (
    <div className="sidebar-icon-only">
      {/* Company Logo */}
      <div className="company-logo">
        <i className="fas fa-building"></i>
      </div>

      {/* Divider */}
      <div className="sidebar-divider"></div>

      {/* Dashboard Link */}
      <NavLink 
        to={`${basePath}/dashboard`} 
        title="Dashboard"
        className={({ isActive }) => isActive ? 'active' : ''}
      >
        <i className="fas fa-chart-line"></i>
      </NavLink>

      {/* Widget Link - Now appears for both admin and user */}
      <NavLink 
        to={`${basePath}/widgets`} 
        title="Widgets"
        className={({ isActive }) => isActive ? 'active' : ''}
      >
        <i className="fas fa-th-large"></i>
      </NavLink>

      {/* Settings Link */}
      <NavLink 
        to={`${basePath}/settings`} 
        title="Settings"
        className={({ isActive }) => isActive ? 'active' : ''}
      >
        <i className="fas fa-cog"></i>
      </NavLink>

      {/* Admin-only links */}
      {userRole === 'admin' && (
        <NavLink 
          to={`${basePath}/graph`} 
          title="Graph"
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <i className="fas fa-project-diagram"></i>
        </NavLink>
      )}
    </div>
  );
};

export default Sidebar; 