
import React, { useState } from 'react';
import { Driver, Settings } from '../types';

interface SettingsPageProps {
  drivers: Driver[];
  settings: Settings;
  onUpdateDrivers: (drivers: Driver[]) => void;
  onUpdateSettings: (settings: Settings) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ drivers, settings, onUpdateDrivers, onUpdateSettings }) => {
  const [newDriver, setNewDriver] = useState({ name: '', avgConsumption: 12 });

  const addDriver = () => {
    if (!newDriver.name) return;
    const driver: Driver = {
      id: crypto.randomUUID(),
      name: newDriver.name,
      avgConsumption: newDriver.avgConsumption
    };
    onUpdateDrivers([...drivers, driver]);
    setNewDriver({ name: '', avgConsumption: 12 });
  };

  const removeDriver = (id: string) => {
    onUpdateDrivers(drivers.filter(d => d.id !== id));
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-gray-800">Configurações</h2>
        <p className="text-gray-500">Gerencie motoristas e valores de combustível.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Fuel Price */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <i className="fa-solid fa-gas-pump text-emerald-600"></i>
            Preço do Combustível
          </h3>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
              <input
                type="number"
                step="0.01"
                value={settings.fuelPrice}
                onChange={e => onUpdateSettings({ ...settings, fuelPrice: parseFloat(e.target.value) || 0 })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <p className="text-sm text-gray-500">Valor utilizado nos cálculos automáticos.</p>
          </div>
        </section>

        {/* Drivers List */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <i className="fa-solid fa-users text-emerald-600"></i>
            Condutores e Consumo Médio
          </h3>
          
          <div className="space-y-4 mb-6">
            {drivers.map(driver => (
              <div key={driver.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <p className="font-semibold text-gray-800">{driver.name}</p>
                  <p className="text-xs text-gray-500">Consumo: {driver.avgConsumption} km/l</p>
                </div>
                <button 
                  onClick={() => removeDriver(driver.id)}
                  className="text-red-400 hover:text-red-600 p-2"
                >
                  <i className="fa-solid fa-user-minus"></i>
                </button>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-sm font-bold text-gray-400 uppercase mb-3">Novo Condutor</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nome do motorista"
                value={newDriver.name}
                onChange={e => setNewDriver({ ...newDriver, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Consumo km/l"
                  value={newDriver.avgConsumption}
                  onChange={e => setNewDriver({ ...newDriver, avgConsumption: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <button
                  onClick={addDriver}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
