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

  // Simplified navigation logic
  useEffect(() => {
    const path = window.location.pathname;

    if (!isAuthenticated && path !== '/login') {
      navigate('/login');
      return;
    }

    if (isAuthenticated && userRole) {
      // Only redirect if on login or root path
      if (path === '/login' || path === '/') {
        const defaultPath = userRole === 'admin' ? '/localconfig/dashboard' : '/localhost/dashboard';
        navigate(defaultPath);
        return;
      }

      // Check for incorrect role access
      const isAdminPath = path.includes('/localconfig');
      const isUserPath = path.includes('/localhost');

      if (userRole === 'admin' && isUserPath) {
        navigate('/localconfig/dashboard');
      } else if (userRole === 'user' && isAdminPath) {
        navigate('/localhost/dashboard');
      }
      // If path is correct for role, don't navigate
    }
  }, [isAuthenticated, userRole, navigate]);

  const login = (role: 'admin' | 'user', redirectPath?: string) => {
    setIsAuthenticated(true);
    setUserRole(role);
    const defaultPath = role === 'admin' ? '/localconfig/dashboard' : '/localhost/dashboard';
    navigate(redirectPath || defaultPath);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    
    // Clear auth-related items but keep preferences
    const preferencesToKeep = {
      theme: localStorage.getItem('theme'),
      layout: localStorage.getItem('layout'),
      dashboardWidgets: localStorage.getItem('dashboardWidgets')
    };
    
    localStorage.clear();
    
    // Restore preferences
    Object.entries(preferencesToKeep).forEach(([key, value]) => {
      if (value) localStorage.setItem(key, value);
    });
    
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