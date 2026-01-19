
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Trips from './pages/Trips';
import SettingsPage from './pages/Settings';
import { Page, Driver, Settings, Trip } from './types';
import { StorageService } from './services/storage';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const [drivers, setDrivers] = useState<Driver[]>(StorageService.getDrivers());
  const [settings, setSettings] = useState<Settings>(StorageService.getSettings());
  const [trips, setTrips] = useState<Trip[]>(StorageService.getTrips());

  // Persistence effects
  useEffect(() => {
    StorageService.saveDrivers(drivers);
  }, [drivers]);

  useEffect(() => {
    StorageService.saveSettings(settings);
  }, [settings]);

  const handleAddTrip = (trip: Trip) => {
    StorageService.saveTrip(trip);
    setTrips(StorageService.getTrips());
    setCurrentPage(Page.Dashboard); // View result on dashboard
  };

  const handleDeleteTrip = (id: string) => {
    StorageService.deleteTrip(id);
    setTrips(StorageService.getTrips());
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.Dashboard:
        return <Dashboard trips={trips} drivers={drivers} />;
      case Page.Trips:
        return (
          <Trips 
            drivers={drivers} 
            settings={settings} 
            trips={trips} 
            onAddTrip={handleAddTrip} 
            onDeleteTrip={handleDeleteTrip}
          />
        );
      case Page.Settings:
        return (
          <SettingsPage 
            drivers={drivers} 
            settings={settings} 
            onUpdateDrivers={setDrivers} 
            onUpdateSettings={setSettings} 
          />
        );
      default:
        return <Dashboard trips={trips} drivers={drivers} />;
    }
  };

  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

export default App;
