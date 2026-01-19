
export interface Driver {
  id: string;
  name: string;
  avgConsumption: number; // km/l
}

export interface Settings {
  fuelPrice: number;
}

export type TripCategory = 'Trabalho' | 'Lazer' | 'Essencial' | 'Educação' | 'Outros';

export interface Trip {
  id: string;
  driverId: string;
  driverName: string;
  origin: string;
  destination: string;
  distance: number; // km
  isRoundTrip: boolean;
  totalDistance: number;
  cost: number;
  date: string;
  category: TripCategory;
}

export enum Page {
  Dashboard = 'dashboard',
  Trips = 'trips',
  Settings = 'settings'
}
