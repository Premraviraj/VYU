// Data structure interfaces
interface RuleCounts {
  [key: string]: number;
}

interface FilteredStats {
  RuleCounts?: RuleCounts;
  VideoSource?: string;
}

export interface VehicleStatsData {
  vehicleType: string;
  filteredStats?: FilteredStats;
}

export interface KPIField {
  id: string;
  label: string;
  value: number;
  color: string;
  collection?: string;
  videoSource?: string;
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  customIcon?: JSX.Element;
  showAdvanced?: boolean;
}

export interface KPIFieldUpdate {
  label?: string;
  value?: number;
  color?: string;
  collection?: string;
  videoSource?: string;
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  customIcon?: JSX.Element;
  showAdvanced?: boolean;
}

export interface CollectionData {
  collection: string;
  fieldCounts: {
    [key: string]: number;
  };
}

export interface KPIModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedData: VehicleStatsData[];
  onKPICreated?: () => void;
} 