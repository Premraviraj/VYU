import { API_URL } from '../utils/config';
import { KPIField } from '../types/kpi';

export const kpiApi = {
  // Fetch all available collections
  fetchCollections: async (): Promise<string[]> => {
    try {
      const response = await fetch(`${API_URL}/api/v1/allCollections`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Collections response:', data);

      if (data && Array.isArray(data.collections)) {
        const filteredCollections = data.collections.filter(
          (collection: string) => !['Widgets', 'KpiCards'].includes(collection)
        );
        console.log('Filtered collections:', filteredCollections);
        return filteredCollections;
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
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Video sources API response:', data);

      if (data && data.videoSources) {
        // Extract video sources from the response
        const videoSources = data.videoSources
          .map((vs: any) => vs.source)
          .filter((source: string | null | undefined): source is string => 
            typeof source === 'string' && source.length > 0
          );
        
        // Create Set with explicit string type
        const uniqueSourcesSet = new Set<string>(videoSources);
        const uniqueSources = Array.from(uniqueSourcesSet);
        
        console.log('Extracted video sources:', uniqueSources);
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
        `${API_URL}/api/v1/Collection/filtered?collection=${encodeURIComponent(collection)}&VideoSource=${encodeURIComponent(videoSource)}`, {
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
      console.log('Fields data:', data);
      return data.fieldCounts || {};
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
  }
}; 