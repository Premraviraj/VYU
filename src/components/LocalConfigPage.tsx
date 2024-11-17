import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './configComponents/sidebar/Sidebar';
import Widget from './pages/widgets/Widget';
import DashboardPage from './pages/dashboard/DashboardPage';
import './LocalConfigPage.css';

const LocalConfigPage: React.FC = () => {
  return (
    <div className="stats-container">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="widgets" element={<Widget />} />
          <Route path="documents" element={<div>Documents Content</div>} />
          <Route path="messages" element={<div>Messages Content</div>} />
          <Route path="calendar" element={<div>Calendar Content</div>} />
          <Route path="team" element={<div>Team Content</div>} />
          <Route path="history" element={<div>History Content</div>} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default LocalConfigPage; 