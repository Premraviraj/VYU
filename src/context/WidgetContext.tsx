import React, { createContext, useContext, useState, useEffect } from 'react';

interface Widget {
  id: string;
  type: 'graph' | 'kpi';
  title: string;
  content: string;
  createdAt: number;
  backgroundColor?: string;
}

interface WidgetContextType {
  widgets: Widget[];
  addWidget: (widget: Omit<Widget, 'id' | 'createdAt'>) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export const WidgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [widgets, setWidgets] = useState<Widget[]>(() => {
    const savedWidgets = localStorage.getItem('dashboardWidgets');
    return savedWidgets ? JSON.parse(savedWidgets) : [];
  });

  useEffect(() => {
    console.log('Saving widgets:', widgets);
    localStorage.setItem('dashboardWidgets', JSON.stringify(widgets));
  }, [widgets]);

  const addWidget = (widget: Omit<Widget, 'id' | 'createdAt'>) => {
    console.log('Adding new widget:', widget);
    const newWidget: Widget = {
      ...widget,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    setWidgets(prev => [...prev, newWidget]);
  };

  const removeWidget = (id: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== id));
  };

  const updateWidget = (id: string, updates: Partial<Widget>) => {
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === id ? { ...widget, ...updates } : widget
      )
    );
  };

  return (
    <WidgetContext.Provider value={{ widgets, addWidget, removeWidget, updateWidget }}>
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