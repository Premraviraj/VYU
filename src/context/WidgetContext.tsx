import React, { createContext, useContext, useState, useEffect } from 'react';
import { Widget } from '../types/Widget';
import type { DashboardKPICard } from '../types/kpiTypes';

export interface WidgetContextType {
  widgets: (Widget | DashboardKPICard)[];
  addWidget: (widget: Widget | DashboardKPICard) => void;
  removeWidget: (id: string) => void;
  setWidgets: React.Dispatch<React.SetStateAction<(Widget | DashboardKPICard)[]>>;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export const WidgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize widgets from localStorage or empty array
  const [widgets, setWidgets] = useState<(Widget | DashboardKPICard)[]>(() => {
    const savedWidgets = localStorage.getItem('dashboardWidgets');
    return savedWidgets ? JSON.parse(savedWidgets) : [];
  });

  // Save widgets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('dashboardWidgets', JSON.stringify(widgets));
  }, [widgets]);

  const addWidget = (widget: Widget | DashboardKPICard) => {
    setWidgets(prev => [...prev, widget]);
  };

  const removeWidget = (id: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== id));
  };

  return (
    <WidgetContext.Provider value={{ widgets, setWidgets, addWidget, removeWidget }}>
      {children}
    </WidgetContext.Provider>
  );
};

export const useWidgets = () => {
  const context = useContext(WidgetContext);
  if (context === undefined) {
    throw new Error('useWidgets must be used within a WidgetProvider');
  }
  return context;
}; 