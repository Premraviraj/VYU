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
    vehicleType: "Car",
    count: 150,
    in: 90,
    out: 60,
    lastUpdated: new Date().toLocaleString(),
    details: {
      morning: { in: 30, out: 10 },
      afternoon: { in: 20, out: 15 },
      evening: { in: 25, out: 20 },
      night: { in: 15, out: 15 }
    }
  },
  {
    vehicleType: "Truck",
    count: 80,
    in: 45,
    out: 35,
    lastUpdated: new Date().toLocaleString(),
    details: {
      morning: { in: 15, out: 5 },
      afternoon: { in: 10, out: 10 },
      evening: { in: 12, out: 12 },
      night: { in: 8, out: 8 }
    }
  },
  {
    vehicleType: "Motorcycle",
    count: 100,
    in: 60,
    out: 40,
    lastUpdated: new Date().toLocaleString(),
    details: {
      morning: { in: 20, out: 8 },
      afternoon: { in: 15, out: 12 },
      evening: { in: 15, out: 12 },
      night: { in: 10, out: 8 }
    }
  },
  {
    vehicleType: "Bus",
    count: 50,
    in: 30,
    out: 20,
    lastUpdated: new Date().toLocaleString(),
    details: {
      morning: { in: 10, out: 5 },
      afternoon: { in: 8, out: 5 },
      evening: { in: 7, out: 6 },
      night: { in: 5, out: 4 }
    }
  },
  {
    vehicleType: "Van",
    count: 70,
    in: 40,
    out: 30,
    lastUpdated: new Date().toLocaleString(),
    details: {
      morning: { in: 12, out: 8 },
      afternoon: { in: 10, out: 7 },
      evening: { in: 10, out: 8 },
      night: { in: 8, out: 7 }
    }
  }
]; 