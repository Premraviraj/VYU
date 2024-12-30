import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  userRole: string;
  login: (role: 'admin' | 'user', redirectPath?: string) => void;
  logout: () => void;
  updateUserProfile: (profile: UserProfile) => Promise<void>;
  isAuthenticated: boolean;
}

interface UserProfile {
  username: string;
  email: string;
  avatar: string;
  notifications: boolean;
  role?: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  
  const [userRole, setUserRole] = useState<string>(() => {
    return localStorage.getItem('userRole') || '';
  });

  const navigate = useNavigate();

  // Persist auth state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated.toString());
    if (userRole) {
      localStorage.setItem('userRole', userRole);
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
        const defaultPath = userRole === 'admin' ? '/localconfig/dashboard' : '/user/dashboard';
        navigate(defaultPath, { replace: true });
        return;
      }

      // Check for incorrect role access
      const isAdminPath = path.includes('/localconfig');
      const isUserPath = path.includes('/user');

      if (userRole === 'admin' && isUserPath) {
        navigate('/localconfig/dashboard', { replace: true });
      } else if (userRole === 'user' && isAdminPath) {
        navigate('/user/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, userRole, navigate]);

  const login = (role: 'admin' | 'user', redirectPath?: string) => {
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', role);
    
    const defaultPath = role === 'admin' ? '/localconfig/dashboard' : '/user/dashboard';
    navigate(redirectPath || defaultPath, { replace: true });
  };

  const logout = () => {
    // Keep preferences before clearing localStorage
    const preferencesToKeep = {
      theme: localStorage.getItem('theme'),
      dashboardWidgets: localStorage.getItem('dashboardWidgets')
    };
    
    // Clear auth state
    setIsAuthenticated(false);
    setUserRole('');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    
    // Restore preferences
    Object.entries(preferencesToKeep).forEach(([key, value]) => {
      if (value) localStorage.setItem(key, value);
    });
    
    navigate('/login', { replace: true });
  };

  const updateUserProfile = async (profile: UserProfile) => {
    try {
      // Here you would typically make an API call to update the user profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUserRole(profile.role || userRole);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const value = {
    userRole,
    login,
    logout,
    updateUserProfile,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
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