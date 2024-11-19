import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  currentTheme: string;
  changeTheme: (theme: string) => void;
}

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  cardBg: string;
  text: string;
  textSecondary: string;
  border: string;
  icon: string;
  iconGradient: string;
}

const themeColors: { [key: string]: ThemeColors } = {
  default: {
    primary: '#4f46e5',
    secondary: '#7c3aed',
    background: '#f8fafc',
    cardBg: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    icon: '#4f46e5',
    iconGradient: 'linear-gradient(135deg, #4f46e5, #7c3aed)'
  },
  emerald: {
    primary: '#059669',
    secondary: '#10b981',
    background: '#ecfdf5',
    cardBg: '#ffffff',
    text: '#064e3b',
    textSecondary: '#047857',
    border: '#d1fae5',
    icon: '#059669',
    iconGradient: 'linear-gradient(135deg, #059669, #10b981)'
  },
  royal: {
    primary: '#7c3aed',
    secondary: '#8b5cf6',
    background: '#f5f3ff',
    cardBg: '#ffffff',
    text: '#5b21b6',
    textSecondary: '#7c3aed',
    border: '#ddd6fe',
    icon: '#7c3aed',
    iconGradient: 'linear-gradient(135deg, #7c3aed, #8b5cf6)'
  },
  crimson: {
    primary: '#dc2626',
    secondary: '#ef4444',
    background: '#fef2f2',
    cardBg: '#ffffff',
    text: '#991b1b',
    textSecondary: '#dc2626',
    border: '#fecaca',
    icon: '#dc2626',
    iconGradient: 'linear-gradient(135deg, #dc2626, #ef4444)'
  },
  midnight: {
    primary: '#1e293b',
    secondary: '#334155',
    background: '#f8fafc',
    cardBg: '#ffffff',
    text: '#0f172a',
    textSecondary: '#1e293b',
    border: '#e2e8f0',
    icon: '#1e293b',
    iconGradient: 'linear-gradient(135deg, #1e293b, #334155)'
  },
  sunset: {
    primary: '#f59e0b',
    secondary: '#fbbf24',
    background: '#fffbeb',
    cardBg: '#ffffff',
    text: '#b45309',
    textSecondary: '#f59e0b',
    border: '#fde68a',
    icon: '#f59e0b',
    iconGradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)'
  }
};

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: 'default',
  changeTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('default');

  const changeTheme = (theme: string) => {
    const colors = themeColors[theme];
    document.body.style.setProperty('--theme-transition', 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)');
    
    // Update all CSS variables
    document.documentElement.style.setProperty('--primary-color', colors.primary);
    document.documentElement.style.setProperty('--secondary-color', colors.secondary);
    document.documentElement.style.setProperty('--background-color', colors.background);
    document.documentElement.style.setProperty('--card-background', colors.cardBg);
    document.documentElement.style.setProperty('--text-primary', colors.text);
    document.documentElement.style.setProperty('--text-secondary', colors.textSecondary);
    document.documentElement.style.setProperty('--border-color', colors.border);
    document.documentElement.style.setProperty('--icon-color', colors.icon);
    document.documentElement.style.setProperty('--icon-gradient', colors.iconGradient);

    document.documentElement.setAttribute('data-theme', theme);
    setCurrentTheme(theme);

    // Add ripple effect
    const ripple = document.createElement('div');
    ripple.className = 'theme-ripple';
    document.body.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 1000);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'default';
    changeTheme(savedTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 