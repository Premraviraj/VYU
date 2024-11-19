import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { VehicleStats } from '../data/vehicleData';

interface KPICard {
  id: string;
  title: string;
  data: {
    total: number;
    in: number;
    out: number;
    trend: number;
  };
  type: string;
}

export interface ColorState {
  [key: string]: {
    total: string;
    in: string;
    out: string;
  };
}

export interface Graph {
  id: string;
  type: string;
  title: string;
  data: {
    type: string;
    selectedData?: { label: string; Entry: number; Exit: number; Total: number; }[];
    timeOfDay?: string;
    rules?: string;
  };
  backgroundColor: string;
  colors?: ColorState;
}

interface GraphContextType {
  generatedGraphs: Graph[];
  kpiCards: KPICard[];
  addGraph: (id: string, graph: Graph) => void;
  removeGraph: (id: string) => void;
  addKPICard: (data: VehicleStats[]) => void;
  removeKPICard: (id: string) => void;
  dashboardLayout: any[];
  userDashboardLayout: any[];
  setDashboardLayout: (layout: any[]) => void;
  setUserDashboardLayout: (layout: any[]) => void;
}

const GraphContext = createContext<GraphContextType | undefined>(undefined);

// Create a custom event for widget updates
const widgetUpdateEvent = new CustomEvent('widgetUpdate');

export const GraphProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize states from localStorage
  const [generatedGraphs, setGeneratedGraphs] = useState<Graph[]>(() => {
    const savedGraphs = localStorage.getItem('generatedGraphs');
    return savedGraphs ? JSON.parse(savedGraphs) : [];
  });

  const [kpiCards, setKPICards] = useState<KPICard[]>(() => {
    const savedKPIs = localStorage.getItem('kpiCards');
    return savedKPIs ? JSON.parse(savedKPIs) : [];
  });

  const [dashboardLayout, setDashboardLayout] = useState(() => {
    const savedLayout = localStorage.getItem('dashboardLayout');
    return savedLayout ? JSON.parse(savedLayout) : [];
  });

  const [userDashboardLayout, setUserDashboardLayout] = useState(() => {
    const savedLayout = localStorage.getItem('userDashboardLayout');
    return savedLayout ? JSON.parse(savedLayout) : [];
  });

  // Save to localStorage and dispatch event when state changes
  useEffect(() => {
    localStorage.setItem('generatedGraphs', JSON.stringify(generatedGraphs));
    window.dispatchEvent(widgetUpdateEvent);
  }, [generatedGraphs]);

  useEffect(() => {
    localStorage.setItem('kpiCards', JSON.stringify(kpiCards));
    window.dispatchEvent(widgetUpdateEvent);
  }, [kpiCards]);

  useEffect(() => {
    localStorage.setItem('dashboardLayout', JSON.stringify(dashboardLayout));
  }, [dashboardLayout]);

  useEffect(() => {
    localStorage.setItem('userDashboardLayout', JSON.stringify(userDashboardLayout));
  }, [userDashboardLayout]);

  const addGraph = (id: string, graph: Graph) => {
    setGeneratedGraphs(prev => {
      // Check if a graph with this id already exists
      const exists = prev.some(g => g.id === id);
      if (exists) {
        // Update existing graph
        return prev.map(g => g.id === id ? graph : g);
      }
      // Add new graph
      return [...prev, graph];
    });
  };

  const removeGraph = (id: string) => {
    setGeneratedGraphs(prev => prev.filter(graph => graph.id !== id));
  };

  const addKPICard = (selectedData: VehicleStats[]) => {
    const newKPICards = selectedData.map(vehicle => ({
      id: Math.random().toString(36).substr(2, 9),
      title: vehicle.vehicleType,
      data: {
        total: vehicle.count,
        in: vehicle.in,
        out: vehicle.out,
        trend: ((vehicle.in - vehicle.out) / vehicle.count) * 100
      },
      type: 'vehicle'
    }));

    setKPICards(prev => [...prev, ...newKPICards]);
  };

  const removeKPICard = (id: string) => {
    setKPICards(prev => prev.filter(card => card.id !== id));
  };

  return (
    <GraphContext.Provider value={{ 
      generatedGraphs, 
      kpiCards,
      addGraph, 
      removeGraph,
      addKPICard,
      removeKPICard,
      dashboardLayout,
      userDashboardLayout,
      setDashboardLayout,
      setUserDashboardLayout
    }}>
      {children}
    </GraphContext.Provider>
  );
};

export const useGraphs = () => {
  const context = useContext(GraphContext);
  if (context === undefined) {
    throw new Error('useGraphs must be used within a GraphProvider');
  }
  return context;
}; 