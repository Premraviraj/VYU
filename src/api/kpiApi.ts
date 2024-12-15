import { API_URL } from '../utils/config';
import { KPIField } from '../types/kpi';

// Helper function to get unique values from array
const getUniqueValues = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

export const kpiApi = {
  // Fetch all available collections
  fetchCollections: async (): Promise<string[]> => {
    try {
      const response = await fetch(`${API_URL}/api/v1/allCollections`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Collections response:', data);

      // Extract unique collections from the response
      if (data && Array.isArray(data)) {
        // First filter out undefined and unwanted collections, then map
        const collections = data
          .filter((item: any) => 
            item?.collection && 
            !['Widgets', 'KpiCards'].includes(item.collection)
          )
          .map((item: any) => item.collection as string);
        
        const uniqueCollections = getUniqueValues(collections);
        console.log('Filtered collections:', uniqueCollections);
        return uniqueCollections;
      }
      return [];
    } catch (error) {
      console.error('Error fetching collections:', error);
      throw error;
    }
  },

  // Fetch video sources for a collection
  fetchVideoSources: async (collection: string): Promise<string[]> => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/Collection/videoSources?collection=${encodeURIComponent(collection)}`,
        { 
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Video sources response:', data);

      if (Array.isArray(data)) {
        // First filter out invalid entries, then map to VideoSource
        const sources = data
          .filter((item: any) => item?.VideoSource)
          .map((item: any) => item.VideoSource as string);
        
        const uniqueSources = getUniqueValues(sources);
        console.log('Unique video sources:', uniqueSources);
        return uniqueSources;
      }
      return [];
    } catch (error) {
      console.error('Error fetching video sources:', error);
      throw error;
    }
  },

  // Fetch fields for a collection and video source
  fetchFields: async (collection: string, videoSource: string): Promise<Record<string, number>> => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/Collection/filtered/count?collection=${encodeURIComponent(collection)}&VideoSource=${encodeURIComponent(videoSource)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fields response:', data);

      // Extract field counts from the response
      if (data && data.fieldCounts) {
        return data.fieldCounts;
      }

      // If data is in a different format, try to extract counts
      if (data && typeof data === 'object') {
        const counts: Record<string, number> = {};
        Object.entries(data).forEach(([key, value]: [string, any]) => {
          if (typeof value === 'number') {
            counts[key] = value;
          }
        });
        return counts;
      }

      return {};
    } catch (error) {
      console.error('Error fetching fields:', error);
      throw error;
    }
  },

  // Fetch real-time field data
  fetchFieldData: async (field: KPIField): Promise<number | null> => {
    if (!field.collection || !field.videoSource || !field.label) return null;

    try {
      const response = await fetch(
        `${API_URL}/api/v1/Collection/filtered?collection=${encodeURIComponent(field.collection)}&VideoSource=${encodeURIComponent(field.videoSource)}&Rule=${encodeURIComponent(field.label)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.fieldCounts && data.fieldCounts[field.label] !== undefined) {
          return data.fieldCounts[field.label];
        }
      }
      return null;
    } catch (error) {
      console.error(`Error fetching data for field ${field.label}:`, error);
      return null;
    }
  },

  fetchKPICards: async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/kpiCards`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        // Return empty array as fallback if endpoint doesn't exist
        console.warn('KPI Cards endpoint not available, using fallback data');
        return [];
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching KPI cards:', error);
      // Return empty array as fallback
      return [];
    }
  },

  createKPICard: async (cardData: any) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/kpiCards`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(cardData)
      });

      if (!response.ok) {
        // Store card data locally if endpoint doesn't exist
        console.warn('KPI Cards endpoint not available, storing data locally');
        const localCards = JSON.parse(localStorage.getItem('kpiCards') || '[]');
        localCards.push(cardData);
        localStorage.setItem('kpiCards', JSON.stringify(localCards));
        return cardData;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating KPI card:', error);
      // Store card data locally as fallback
      const localCards = JSON.parse(localStorage.getItem('kpiCards') || '[]');
      localCards.push(cardData);
      localStorage.setItem('kpiCards', JSON.stringify(localCards));
      return cardData;
    }
  }
}; 