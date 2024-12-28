import React, { createContext, useContext, useState } from 'react';
import { Widget } from '../types/Widget';
import type { DashboardKPICard } from '../types/kpiTypes';

interface WidgetContextType {
  widgets: (Widget | DashboardKPICard)[];
  addWidget: (widget: Widget | DashboardKPICard) => void;
  removeWidget: (id: string) => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export const WidgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [widgets, setWidgets] = useState<(Widget | DashboardKPICard)[]>([]);

  const addWidget = (widget: Widget | DashboardKPICard) => {
    setWidgets(prev => [...prev, widget]);
  };

  const removeWidget = (id: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== id));
  };

  return (
    <WidgetContext.Provider value={{ widgets, addWidget, removeWidget }}>
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