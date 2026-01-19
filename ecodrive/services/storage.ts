
import { Driver, Settings, Trip } from '../types';

const STORAGE_KEYS = {
  DRIVERS: 'ecodrive_drivers',
  SETTINGS: 'ecodrive_settings',
  TRIPS: 'ecodrive_trips'
};

export const StorageService = {
  getDrivers: (): Driver[] => {
    const data = localStorage.getItem(STORAGE_KEYS.DRIVERS);
    return data ? JSON.parse(data) : [
      { id: '1', name: 'Pai', avgConsumption: 12 },
      { id: '2', name: 'Mãe', avgConsumption: 10 }
    ];
  },
  saveDrivers: (drivers: Driver[]) => {
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
  },

  getSettings: (): Settings => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : { fuelPrice: 5.89 };
  },
  saveSettings: (settings: Settings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getTrips: (): Trip[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TRIPS);
    return data ? JSON.parse(data) : [];
  },
  saveTrip: (trip: Trip) => {
    const trips = StorageService.getTrips();
    trips.unshift(trip);
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
  },
  deleteTrip: (id: string) => {
    const trips = StorageService.getTrips().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
  }
};
