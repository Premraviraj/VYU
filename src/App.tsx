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
import { WidgetProvider } from './context/WidgetContext';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';

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
    return <Navigate to={userRole === 'admin' ? '/localconfig/dashboard' : '/localhost'} replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/localconfig" element={
        <ProtectedRoute allowedRole="admin">
          <MainLayout>
            <Routes>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="widgets" element={<WidgetsPage />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="graph" element={<LocalConfigPage />} />
            </Routes>
          </MainLayout>
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="widgets" element={<WidgetsPage />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="graph" element={<LocalConfigPage />} />
      </Route>

      <Route path="/user" element={
        <ProtectedRoute>
          <MainLayout>
            <Routes>
              <Route path="dashboard" element={<UserHomePage />} />
              <Route path="settings" element={<UserSettings />} />
            </Routes>
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <WidgetProvider>
              <GraphProvider>
                <AppContent />
              </GraphProvider>
            </WidgetProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </DataProvider>
  );
};

export default App;
