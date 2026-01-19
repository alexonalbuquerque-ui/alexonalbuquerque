
import React from 'react';
import { Page } from '../types';

interface LayoutProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentPage, setCurrentPage, children }) => {
  const menuItems = [
    { id: Page.Dashboard, label: 'Dashboard', icon: 'fa-chart-line' },
    { id: Page.Trips, label: 'Viagens', icon: 'fa-route' },
    { id: Page.Settings, label: 'Configurações', icon: 'fa-cog' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar / Top Nav */}
      <nav className="bg-emerald-700 text-white w-full md:w-64 flex-shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg">
            <i className="fa-solid fa-gas-pump text-emerald-700 text-xl"></i>
          </div>
          <h1 className="font-bold text-xl tracking-tight">EcoDrive</h1>
        </div>
        
        <div className="mt-4 flex md:flex-col overflow-x-auto md:overflow-x-visible">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex items-center gap-3 px-6 py-4 transition-colors w-full text-left whitespace-nowrap
                ${currentPage === item.id ? 'bg-emerald-800 border-l-4 border-white' : 'hover:bg-emerald-600'}`}
            >
              <i className={`fa-solid ${item.icon} w-5`}></i>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 bg-gray-50 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
