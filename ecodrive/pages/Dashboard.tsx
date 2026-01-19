
import React, { useMemo } from 'react';
import { Trip, Driver } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

interface DashboardProps {
  trips: Trip[];
  drivers: Driver[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const Dashboard: React.FC<DashboardProps> = ({ trips, drivers }) => {
  const stats = useMemo(() => {
    const totalTrips = trips.length;
    const totalSpent = trips.reduce((acc, t) => acc + t.cost, 0);
    const totalDistance = trips.reduce((acc, t) => acc + t.totalDistance, 0);
    const avgCostPerKm = totalDistance > 0 ? totalSpent / totalDistance : 0;
    
    // Group by driver
    const driverData = drivers.map(d => {
      const driverTrips = trips.filter(t => t.driverId === d.id);
      return {
        name: d.name,
        spent: driverTrips.reduce((acc, t) => acc + t.cost, 0),
        trips: driverTrips.length,
        km: driverTrips.reduce((acc, t) => acc + t.totalDistance, 0)
      };
    }).filter(d => d.trips > 0);

    // Group by category
    const categories: Record<string, number> = {};
    trips.forEach(t => {
      const cat = t.category || 'Outros';
      categories[cat] = (categories[cat] || 0) + t.cost;
    });
    const categoryData = Object.entries(categories).map(([name, value]) => ({ name, value }));

    // Most active driver
    const topDriver = [...driverData].sort((a, b) => b.km - a.km)[0]?.name || '-';

    // Timeline
    const timelineData = [...trips].reverse().slice(-10).map(t => ({
      date: new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      custo: t.cost
    }));

    return { totalTrips, totalSpent, totalDistance, avgCostPerKm, topDriver, driverData, categoryData, timelineData };
  }, [trips, drivers]);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Painel de Controle</h2>
        <p className="text-gray-500">Inteligência de gastos e consumo da família.</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-emerald-500">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Gasto</p>
          <p className="text-2xl font-black text-emerald-600">R$ {stats.totalSpent.toFixed(2)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Custo Médio/KM</p>
          <p className="text-2xl font-black text-blue-600">R$ {stats.avgCostPerKm.toFixed(2)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-amber-500">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">KM Total</p>
          <p className="text-2xl font-black text-amber-600">{stats.totalDistance.toFixed(1)} km</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Mais Ativo</p>
          <p className="text-2xl font-black text-purple-600 truncate">{stats.topDriver}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Category */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Gastos por Categoria (R$)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  label={({ name }) => name}
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost per Driver */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Gasto por Condutor (R$)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.driverData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="spent" fill="#10b981" radius={[6, 6, 0, 0]} name="Total R$" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Costs Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Tendência de Custos (Últimas Viagens)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.timelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="custo" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} name="R$" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
