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
  otherField: any;
}

// Transform function type
export type KpiDataTransformer = (data: ReceivedKpiData) => ExpectedKpiData;

// Add the DashboardKPICard interface and export it
export interface DashboardKPICard {
  _id: string;
  id: string;
  type: 'kpi';
  kpi_id: string;
  kpi_name: string;
  kpi_type: string;
  design_type: string;
  created_at: string;
  updated_at: string;
  field_id: string;
  field_name: string;
  field_value: string;
  collection_name: string;
  video_source: string;
  rule_name: string;
  style_color: string;
  style_size: string;
  style_icon: string;
  config: {
    refresh_interval: number;
    layout: Object;
  };
  createdAt?: string;
  updatedAt?: string;
} 