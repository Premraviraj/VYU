import React, { createContext, useContext, useState, ReactNode } from 'react';
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

interface GraphContextType {
  generatedGraphs: string[];
  kpiCards: KPICard[];
  addGraph: (svg: string) => void;
  removeGraph: (index: number) => void;
  addKPICard: (data: VehicleStats[]) => void;
  removeKPICard: (id: string) => void;
}

const GraphContext = createContext<GraphContextType | undefined>(undefined);

export const GraphProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [generatedGraphs, setGeneratedGraphs] = useState<string[]>([]);
  const [kpiCards, setKPICards] = useState<KPICard[]>([]);

  const addGraph = (svg: string) => {
    setGeneratedGraphs(prev => [...prev, svg]);
  };

  const removeGraph = (index: number) => {
    setGeneratedGraphs(prev => prev.filter((_, i) => i !== index));
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
      removeKPICard
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