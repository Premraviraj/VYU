import { ColorState } from '../context/GraphContext';

// Define chart types supported by Recharts
export type GraphType = 'line' | 'bar' | 'pie' | 'area' | 'scatter';

// Define the data structure for chart data
export interface ChartData {
  label: string;
  Entry: number;
  Exit: number;
  Total: number;
  value: number;  // For pie charts
}

// Define chart properties
export interface ChartProps {
  type: GraphType;
  data: ChartData[];
  colors: ColorState;
}

// Define Widget interface
export interface Widget {
  id: string;
  type: 'graph';
  title: string;
  content: string;
  backgroundColor?: string;
  chartProps?: {
    type: GraphType;
    data: any[];
    colors: ColorState;
  };
}

// Type guard for graph widgets
export function isGraphWidget(widget: Widget): widget is Widget & { chartProps: ChartProps } {
  return widget.type === 'graph' && widget.chartProps !== undefined;
} 