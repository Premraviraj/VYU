import { Options as HighchartsOptions } from 'highcharts';

interface ChartOptions extends HighchartsOptions {
  chart?: {
    backgroundColor?: string;
    animation?: boolean;
    height?: string | number;
    width?: string | number;
    reflow?: boolean;
    spacingTop?: number;
    spacingRight?: number;
    spacingBottom?: number;
    spacingLeft?: number;
    type?: string;
  };
}

export interface Widget {
  id: string;
  type: 'graph' | 'kpi';
  title: string;
  content: string;
  backgroundColor?: string;
  chartOptions?: Highcharts.Options;
} 