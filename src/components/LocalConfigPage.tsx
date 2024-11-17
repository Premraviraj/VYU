import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/dashboard/DashboardPage';
import WidgetsPage from './pages/widgets/WidgetsPage';
import './LocalConfigPage.css';

const LocalConfigPage: React.FC = () => {
  return (
    <div className="stats-container">
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="widgets" element={<WidgetsPage />} />
          <Route path="documents" element={<div>Documents Content</div>} />
          <Route path="messages" element={<div>Messages Content</div>} />
          <Route path="calendar" element={<div>Calendar Content</div>} />
          <Route path="team" element={<div>Team Content</div>} />
          <Route path="history" element={<div>History Content</div>} />
        </Routes>
      </div>
    </div>
  );
};

export default LocalConfigPage; 