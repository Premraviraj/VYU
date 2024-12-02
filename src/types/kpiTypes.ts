// Received data structure
export interface ReceivedKpiData {
  collection: string;
  filter: {
    database: string;
    type: string;
  };
  fieldCounts: Record<string, any>;
}

// Expected data structure
export interface ExpectedKpiData {
  kpiCards: any[];
  otherField: any; // Update this type based on your actual needs
}

// Transform function type
export type KpiDataTransformer = (data: ReceivedKpiData) => ExpectedKpiData; 