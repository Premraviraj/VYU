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
  occupancy?: number;
  status?: string;
  nextService?: string;
  fuelLevel?: number;
  speed?: number;
  location?: string;
  route?: string;
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
    },
    occupancy: 4,
    status: "Active",
    nextService: "2024-04-15",
    fuelLevel: 75,
    speed: 60,
    location: "Main Street",
    route: "City Center"
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
    },
    occupancy: 45,
    status: "En Route",
    nextService: "2024-04-10",
    fuelLevel: 60,
    speed: 40,
    location: "Downtown",
    route: "Express Line 1"
  },
  {
    vehicleType: "Bike",
    count: 100,
    in: 60,
    out: 40,
    lastUpdated: new Date().toLocaleString(),
    details: {
      morning: { in: 20, out: 8 },
      afternoon: { in: 15, out: 12 },
      evening: { in: 15, out: 12 },
      night: { in: 10, out: 8 }
    },
    status: "Available",
    nextService: "2024-04-20",
    location: "Bike Station A",
    route: "Cycle Path 3"
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
    },
    occupancy: 2,
    status: "Loading",
    nextService: "2024-04-12",
    fuelLevel: 85,
    speed: 55,
    location: "Warehouse District",
    route: "Delivery Route 5"
  }
]; 