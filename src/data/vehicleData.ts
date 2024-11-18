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
  details: DailyDetails;
  lastUpdated: string;
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

// Function to transform API data to match our interface
const transformAPIData = (apiData: APIVehicleData): VehicleStats => {
  return {
    vehicleType: apiData.vehicle_type,
    count: apiData.total_count,
    in: apiData.total_in,
    out: apiData.total_out,
    details: {
      morning: {
        in: apiData.time_details.morning.vehicles_in,
        out: apiData.time_details.morning.vehicles_out
      },
      afternoon: {
        in: apiData.time_details.afternoon.vehicles_in,
        out: apiData.time_details.afternoon.vehicles_out
      },
      evening: {
        in: apiData.time_details.evening.vehicles_in,
        out: apiData.time_details.evening.vehicles_out
      },
      night: {
        in: apiData.time_details.night.vehicles_in,
        out: apiData.time_details.night.vehicles_out
      }
    },
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
      mode: 'cors',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch vehicle data');
    }

    const apiData = await response.json();
    const dataArray = Array.isArray(apiData) ? apiData : [apiData];
    
    console.log('API Response in vehicleData:', apiData); // Add this to debug
    
    return dataArray.map((item: any): VehicleStats => ({
      vehicleType: item.vehicle_type || item.vehicleType,
      count: item.total_count || item.count,
      in: item.total_in || item.in,
      out: item.total_out || item.out,
      details: {
        morning: {
          in: item.time_details?.morning?.vehicles_in || item.details?.morning?.in || 0,
          out: item.time_details?.morning?.vehicles_out || item.details?.morning?.out || 0
        },
        afternoon: {
          in: item.time_details?.afternoon?.vehicles_in || item.details?.afternoon?.in || 0,
          out: item.time_details?.afternoon?.vehicles_out || item.details?.afternoon?.out || 0
        },
        evening: {
          in: item.time_details?.evening?.vehicles_in || item.details?.evening?.in || 0,
          out: item.time_details?.evening?.vehicles_out || item.details?.evening?.out || 0
        },
        night: {
          in: item.time_details?.night?.vehicles_in || item.details?.night?.in || 0,
          out: item.time_details?.night?.vehicles_out || item.details?.night?.out || 0
        }
      },
      lastUpdated: item.last_updated || item.lastUpdated || new Date().toISOString(),
      rawData: item
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
};