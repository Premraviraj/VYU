import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FieldConfig {
  id: string;
  fieldName: string;
  collectionName: string;
  videoSource: string;
  apiEndpoint: string;
  value: number;
  lastUpdated: string;
}

interface WidgetBinding {
  widgetId: string;
  widgetType: 'kpi' | 'graph';
  boundFields: {
    displayName: string;  // User-defined display name
    fieldConfigId: string;  // Reference to FieldConfig
    styleConfig: {
      color: string;
      icon?: string;
      format?: string;
    };
  }[];
}

interface DataContextType {
  fieldConfigs: FieldConfig[];
  widgetBindings: WidgetBinding[];
  addFieldConfig: (config: Omit<FieldConfig, 'id'>) => string;
  removeFieldConfig: (id: string) => void;
  updateFieldConfig: (id: string, updates: Partial<FieldConfig>) => void;
  addWidgetBinding: (binding: Omit<WidgetBinding, 'widgetId'>) => string;
  removeWidgetBinding: (widgetId: string) => void;
  updateWidgetBinding: (widgetId: string, updates: Partial<WidgetBinding>) => void;
  getFieldValue: (fieldConfigId: string) => number | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fieldConfigs, setFieldConfigs] = useState<FieldConfig[]>([]);
  const [widgetBindings, setWidgetBindings] = useState<WidgetBinding[]>([]);

  const addFieldConfig = (config: Omit<FieldConfig, 'id'>) => {
    const id = `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newConfig: FieldConfig = { ...config, id };
    setFieldConfigs(prev => [...prev, newConfig]);
    return id;
  };

  const removeFieldConfig = (id: string) => {
    setFieldConfigs(prev => prev.filter(config => config.id !== id));
  };

  const updateFieldConfig = (id: string, updates: Partial<FieldConfig>) => {
    setFieldConfigs(prev => 
      prev.map(config => 
        config.id === id ? { ...config, ...updates } : config
      )
    );
  };

  const addWidgetBinding = (binding: Omit<WidgetBinding, 'widgetId'>) => {
    const widgetId = `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newBinding: WidgetBinding = { ...binding, widgetId };
    setWidgetBindings(prev => [...prev, newBinding]);
    return widgetId;
  };

  const removeWidgetBinding = (widgetId: string) => {
    setWidgetBindings(prev => prev.filter(binding => binding.widgetId !== widgetId));
  };

  const updateWidgetBinding = (widgetId: string, updates: Partial<WidgetBinding>) => {
    setWidgetBindings(prev => 
      prev.map(binding => 
        binding.widgetId === widgetId ? { ...binding, ...updates } : binding
      )
    );
  };

  const getFieldValue = (fieldConfigId: string) => {
    const config = fieldConfigs.find(config => config.id === fieldConfigId);
    return config ? config.value : null;
  };

  // Function to fetch and update field values
  const updateFieldValues = React.useCallback(async () => {
    for (const config of fieldConfigs) {
      try {
        const response = await fetch(config.apiEndpoint);
        if (response.ok) {
          const data = await response.json();
          updateFieldConfig(config.id, {
            value: data.value,
            lastUpdated: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error(`Error updating field ${config.fieldName}:`, error);
      }
    }
  }, [fieldConfigs]);

  // Set up periodic updates with useCallback
  React.useEffect(() => {
    const interval = setInterval(updateFieldValues, 5000);
    return () => clearInterval(interval);
  }, [updateFieldValues]);

  return (
    <DataContext.Provider value={{
      fieldConfigs,
      widgetBindings,
      addFieldConfig,
      removeFieldConfig,
      updateFieldConfig,
      addWidgetBinding,
      removeWidgetBinding,
      updateWidgetBinding,
      getFieldValue
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}; 