import { GraphType } from './Widget';
import { ColorState } from '../context/GraphContext';

export interface PreparedField {
  field_id: string;
  field_name: string;
  fieldvalue: number;
  collection_name: string;
  video_source: string;
  rule_name: string;
  styling?: {
    color: string;
    size: string;
    icon?: string;
  };
}

export interface BaseWidget {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  type: 'graph' | 'kpi';
  backgroundColor?: string;
}

export interface GraphWidget extends BaseWidget {
  type: 'graph';
  chartProps: {
    type: GraphType;
    data: any;
    colors: ColorState;
  };
}

export interface KPIWidget extends BaseWidget {
  type: 'kpi';
  data: {
    design: string;
    fields: PreparedField[];
  };
}

export type Widget = GraphWidget | KPIWidget;

export interface KPICard {
  kpi_id: string;
  kpi_name: string;
  kpi_type: string;
  design_type: string;
  created_at: string;
  updated_at: string;
  fields: Array<{
    field_id: string;
    field_name: string;
    field_value: number;
    collection_name: string;
    video_source: string;
    rule_name: string;
    styling: {
      color: string;
      size: string;
      icon?: string;
    };
  }>;
  config: {
    refresh_interval: number;
    layout: {
      columns: number;
      gap: string;
    };
  };
} 