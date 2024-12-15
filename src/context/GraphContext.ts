import React, { createContext, useContext, useState } from 'react';

export interface ColorState {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface Graph {
  id: string;
  title: string;
  type: string;
  data: {
    type: string;
    selectedData?: { label: string; Entry: number; Exit: number; Total: number; }[];
    timeOfDay?: string;
    rules?: string;
  }[];
}

interface GraphContextType {
  graphs: Graph[];
  addGraph: (graph: Graph) => void;
  removeGraph: (id: string) => void;
  updateGraph: (id: string, updates: Partial<Graph>) => void;
}

const GraphContext = createContext<GraphContextType | undefined>(undefined);

export const GraphProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [graphs, setGraphs] = useState<Graph[]>([]);

  const addGraph = (graph: Graph) => {
    setGraphs(prev => [...prev, graph]);
  };

  const removeGraph = (id: string) => {
    setGraphs(prev => prev.filter(g => g.id !== id));
  };

  const updateGraph = (id: string, updates: Partial<Graph>) => {
    setGraphs(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const contextValue: GraphContextType = {
    graphs,
    addGraph,
    removeGraph,
    updateGraph
  };

  return React.createElement(
    GraphContext.Provider,
    { value: contextValue },
    children
  );
};

export const useGraphs = (): GraphContextType => {
  const context = useContext(GraphContext);
  if (context === undefined) {
    throw new Error('useGraphs must be used within a GraphProvider');
  }
  return context;
}; 