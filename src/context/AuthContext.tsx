import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: 'admin' | 'user' | null;
  login: (role: 'admin' | 'user', redirectPath?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(() => {
    return (localStorage.getItem('userRole') as 'admin' | 'user' | null) || null;
  });
  
  const navigate = useNavigate();

  // Persist auth state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated.toString());
    if (userRole) {
      localStorage.setItem('userRole', userRole);
    } else {
      localStorage.removeItem('userRole');
    }
  }, [isAuthenticated, userRole]);

  // Check and redirect based on auth state
  useEffect(() => {
    const path = window.location.pathname;
    const lastPath = localStorage.getItem('lastPath');

    if (isAuthenticated && userRole) {
      if (path === '/login') {
        // If on login page, redirect to last path or default path based on role
        const defaultPath = userRole === 'admin' ? '/localconfig/dashboard' : '/localhost';
        navigate(lastPath || defaultPath);
      } else if (path === '/') {
        // If on root, redirect to appropriate dashboard
        navigate(userRole === 'admin' ? '/localconfig/dashboard' : '/localhost');
      } else if (userRole === 'user' && path.includes('/localconfig')) {
        // If user tries to access admin routes
        navigate('/localhost');
      } else if (userRole === 'admin' && path === '/localhost') {
        // If admin tries to access user routes
        navigate('/localconfig/dashboard');
      } else {
        // Store current valid path
        localStorage.setItem('lastPath', path);
      }
    } else if (!isAuthenticated && path !== '/login') {
      navigate('/login');
    }
  }, [isAuthenticated, userRole, navigate]);

  const login = (role: 'admin' | 'user', redirectPath?: string) => {
    setIsAuthenticated(true);
    setUserRole(role);
    const defaultPath = role === 'admin' ? '/localconfig/dashboard' : '/localhost';
    const path = redirectPath || defaultPath;
    localStorage.setItem('lastPath', path);
    navigate(path);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    // Clear localStorage
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('lastPath');
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 