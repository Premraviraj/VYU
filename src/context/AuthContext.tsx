import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

type UserRole = "admin" | "user";

interface AuthContextType {
  login: (username: string, password: string) => void;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  
  const [userRole, setUserRole] = useState<UserRole | null>(() => {
    return (localStorage.getItem('userRole') as UserRole) || null;
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated.toString());
    if (userRole) {
      localStorage.setItem('userRole', userRole);
    } else {
      localStorage.removeItem('userRole');
    }
  }, [isAuthenticated, userRole]);

  useEffect(() => {
    const path = window.location.pathname;
    const lastPath = localStorage.getItem('lastPath');

    if (isAuthenticated && userRole) {
      if (path === '/login') {
        const defaultPath = userRole === 'admin' ? '/localconfig/dashboard' : '/localhost';
        navigate(lastPath || defaultPath);
      } else if (path === '/') {
        navigate(userRole === 'admin' ? '/localconfig/dashboard' : '/localhost');
      } else if (userRole === 'user' && path.includes('/localconfig')) {
        navigate('/localhost');
      } else if (userRole === 'admin' && path === '/localhost') {
        navigate('/localconfig/dashboard');
      } else {
        localStorage.setItem('lastPath', path);
      }
    } else if (!isAuthenticated && path !== '/login') {
      navigate('/login');
    }
  }, [isAuthenticated, userRole, navigate]);

  const login = (username: string, password: string) => {
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      setUserRole('admin');
      localStorage.setItem('lastLoginTime', new Date().toLocaleString());
      return;
    }

    if (username === 'user' && password === 'user123') {
      setIsAuthenticated(true);
      setUserRole('user');
      localStorage.setItem('lastLoginTime', new Date().toLocaleString());
      return;
    }

    setIsAuthenticated(false);
    setUserRole(null);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('lastPath');
    navigate('/login', { replace: true });
  };

  const changePassword = (currentPassword: string, newPassword: string): boolean => {
    const username = userRole === 'admin' ? 'admin' : 'user';
    const correctCurrentPassword = userRole === 'admin' ? 'admin123' : 'user123';

    if (currentPassword === correctCurrentPassword) {
      localStorage.setItem(`${username}Password`, newPassword);
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ login, userRole, isAuthenticated, logout, changePassword }}>
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