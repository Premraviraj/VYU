import { API_URL } from '../utils/config';

// Define the data structure types
export interface TimeDetails {
  in: number;
  out: number;
}

export interface DailyDetails {
  morning: TimeDetails;
  afternoon: TimeDetails;
  evening: TimeDetails;
  night: TimeDetails;
}

export interface VehicleStats {
  vehicleType: string;
  count: number;
  in: number;
  out: number;
  lastUpdated: string;
  filteredStats?: FilteredStats;
  rawData: Record<string, any>;
}

// API response interfaces
interface APITimeDetails {
  vehicles_in: number;
  vehicles_out: number;
}

interface APIDailyDetails {
  morning: APITimeDetails;
  afternoon: APITimeDetails;
  evening: APITimeDetails;
  night: APITimeDetails;
}

interface APIVehicleData {
  vehicle_type: string;
  total_count: number;
  total_in: number;
  total_out: number;
  time_details: APIDailyDetails;
  last_updated: string;
}

// Add new interfaces for filtered data
export interface RuleCounts {
  Entry: number;
  Exit: number;
  Total: number;
  [key: string]: number;
}

export interface FilteredStats {
  VideoSource: string;
  RuleCounts: RuleCounts;
}

// Function to transform API data to match our interface
const transformAPIData = (apiData: APIVehicleData): VehicleStats => {
  return {
    vehicleType: apiData.vehicle_type,
    count: apiData.total_count,
    in: apiData.total_in,
    out: apiData.total_out,
    lastUpdated: apiData.last_updated,
    rawData: apiData
  };
};

// Function to fetch vehicle data from API
export const fetchVehicleData = async (): Promise<VehicleStats[]> => {
  try {
    const response = await fetch(`${API_URL}/api/v1/allCollections`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch vehicle data');
    }

    const data = await response.json();
    
    // Transform the data into VehicleStats array
    return Object.entries(data).map(([key, value]: [string, any]): VehicleStats => ({
      vehicleType: key,
      count: value.count || 0,
      in: value.in || 0,
      out: value.out || 0,
      lastUpdated: value.lastUpdated || new Date().toISOString(),
      rawData: value
    }));
  } catch (error) {
    console.error('Error fetching vehicle data:', error);
    throw error;
  }
};

// Optional: Function to fetch data for a specific time period
export const fetchVehicleDataByPeriod = async (startDate: string, endDate: string): Promise<VehicleStats[]> => {
  try {
    // Replace with your actual API endpoint
    const response = await fetch(
      `YOUR_API_ENDPOINT/vehicle-stats?start_date=${startDate}&end_date=${endDate}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch vehicle data for specified period');
    }

    const apiData: APIVehicleData[] = await response.json();
    return apiData.map(transformAPIData);
  } catch (error) {
    console.error('Error fetching vehicle data for period:', error);
    throw error;
  }
};

// Optional: Function to fetch real-time updates
export const subscribeToVehicleUpdates = (
  callback: (data: VehicleStats[]) => void
): (() => void) => {
  // Replace with your actual WebSocket endpoint
  const ws = new WebSocket('YOUR_WEBSOCKET_ENDPOINT');

  ws.onmessage = (event) => {
    const apiData: APIVehicleData[] = JSON.parse(event.data);
    const transformedData = apiData.map(transformAPIData);
    callback(transformedData);
  };

  // Return cleanup function
  return () => {
    ws.close();
  };
};

// Optional: Cache management
let cachedData: VehicleStats[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getVehicleData = async (): Promise<VehicleStats[]> => {
  const now = Date.now();
  
  if (cachedData && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedData;
  }

  try {
    const freshData = await fetchVehicleData();
    cachedData = freshData;
    lastFetchTime = now;
    return freshData;
  } catch (error) {
    if (cachedData) {
      console.warn('Returning cached data due to fetch error');
      return cachedData;
    }
    throw error;
  }
};

// Optional: Function to invalidate cache
export const invalidateCache = () => {
  cachedData = null;
  lastFetchTime = 0;
};// Add new function to fetch filtered data
export const fetchFilteredData = async (
  collection: string,
  videoSource: string,
  rules: string[],
  startTime?: string,
  endTime?: string
): Promise<FilteredStats> => {
  try {
    const queryParams = new URLSearchParams({
      collection,
      VideoSource: videoSource,
      Rule: rules.join(',')
    });

    if (startTime) queryParams.append('startTime', startTime);
    if (endTime) queryParams.append('endTime', endTime);

    const response = await fetch(
      `${API_URL}/api/v1/Collection/filtered/count?${queryParams}`,
      {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch filtered data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching filtered data:', error);
    throw error;
  }
};

