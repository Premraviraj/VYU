import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './components/pages/auth/LoginPage';
import DashboardPage from './components/pages/dashboard/DashboardPage';
import LocalConfigPage from './components/LocalConfigPage';
import UserHomePage from './components/pages/user/UserHomePage';
import WidgetsPage from './components/pages/widgets/WidgetsPage';
import MainLayout from './components/layout/MainLayout';
import { GraphProvider } from './context/GraphContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminSettings from './components/pages/settings/AdminSettings';
import UserSettings from './components/pages/settings/UserSettings';

const ProtectedRoute: React.FC<{ 
  children: React.ReactNode;
  allowedRole?: 'admin' | 'user';
}> = ({ children, allowedRole }) => {
  const { isAuthenticated, userRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to={userRole === 'admin' ? '/localconfig/dashboard' : '/localhost/dashboard'} replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, userRole } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={
        isAuthenticated ? (
          <Navigate to={userRole === 'admin' ? '/localconfig/dashboard' : '/localhost/dashboard'} replace />
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      <Route path="/login" element={
        isAuthenticated ? (
          <Navigate to={userRole === 'admin' ? '/localconfig/dashboard' : '/localhost/dashboard'} replace />
        ) : (
          <LoginPage />
        )
      } />
      
      {/* Admin routes */}
      <Route path="/localconfig" element={
        <ProtectedRoute allowedRole="admin">
          <GraphProvider>
            <MainLayout />
          </GraphProvider>
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="widgets" element={<WidgetsPage />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="graph" element={<LocalConfigPage />} />
      </Route>

      {/* User routes */}
      <Route path="/localhost" element={
        <ProtectedRoute allowedRole="user">
          <GraphProvider>
            <MainLayout />
          </GraphProvider>
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<UserHomePage />} />
        <Route path="widgets" element={<WidgetsPage />} />
        <Route path="settings" element={<UserSettings />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;
