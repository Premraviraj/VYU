import express from 'express';
import { KPIModel } from '../models/KPIModel'; // Adjust the path based on your project structure

const router = express.Router();

const CACHE_DURATION = 30000000; // 30000 seconds (matches frontend interval)

// If using a caching middleware
const kpiCache: {
  data: any | null;
  lastUpdated: number;
} = {
  data: null,
  lastUpdated: 0
};

// KPI Cards endpoint
router.get('/api/v1/kpiCards', async (req, res) => {
  try {
    const currentTime = Date.now();
    
    // Check if cached data is still valid
    if (kpiCache.data && (currentTime - kpiCache.lastUpdated) < CACHE_DURATION) {
      return res.json(kpiCache.data);
    }

    // If cache is expired or doesn't exist, fetch new data
    const kpiData = await KPIModel.find().lean();
    
    // Update cache
    kpiCache.data = kpiData;
    kpiCache.lastUpdated = currentTime;

    res.json(kpiData);
  } catch (error) {
    console.error('Error fetching KPI cards:', error);
    res.status(500).json({ error: 'Failed to fetch KPI cards' });
  }
});

export default router; 