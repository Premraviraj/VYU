export interface VehicleStats {
  vehicleType: string;
  count: number;
  in: number;
  out: number;
  lastUpdated: string;
  details: {
    morning: { in: number; out: number };
    afternoon: { in: number; out: number };
    evening: { in: number; out: number };
    night: { in: number; out: number };
  };
}

export const vehicleData: VehicleStats[] = [
  {
    vehicleType: 'Cars',
    count: 150,
    in: 85,
    out: 65,
    lastUpdated: '2024-03-20 15:30',
    details: {
      morning: { in: 30, out: 15 },
      afternoon: { in: 25, out: 20 },
      evening: { in: 20, out: 25 },
      night: { in: 10, out: 5 }
    }
  },
  {
    vehicleType: 'Bikes',
    count: 200,
    in: 120,
    out: 80,
    lastUpdated: '2024-03-20 15:30',
    details: {
      morning: { in: 45, out: 20 },
      afternoon: { in: 35, out: 25 },
      evening: { in: 25, out: 30 },
      night: { in: 15, out: 5 }
    }
  },
  {
    vehicleType: 'Trucks',
    count: 45,
    in: 25,
    out: 20,
    lastUpdated: '2024-03-20 15:30',
    details: {
      morning: { in: 8, out: 5 },
      afternoon: { in: 7, out: 6 },
      evening: { in: 6, out: 7 },
      night: { in: 4, out: 2 }
    }
  },
  {
    vehicleType: 'Buses',
    count: 30,
    in: 18,
    out: 12,
    lastUpdated: '2024-03-20 15:30',
    details: {
      morning: { in: 6, out: 3 },
      afternoon: { in: 5, out: 4 },
      evening: { in: 4, out: 3 },
      night: { in: 3, out: 2 }
    }
  },
  {
    vehicleType: 'Delivery Vans',
    count: 80,
    in: 45,
    out: 35,
    lastUpdated: '2024-03-20 15:30',
    details: {
      morning: { in: 15, out: 10 },
      afternoon: { in: 12, out: 10 },
      evening: { in: 10, out: 12 },
      night: { in: 8, out: 3 }
    }
  },
  {
    vehicleType: 'Persons',
    count: 500,
    in: 300,
    out: 200,
    lastUpdated: '2024-03-20 15:30',
    details: {
      morning: { in: 100, out: 50 },
      afternoon: { in: 85, out: 60 },
      evening: { in: 75, out: 70 },
      night: { in: 40, out: 20 }
    }
  }
]; 