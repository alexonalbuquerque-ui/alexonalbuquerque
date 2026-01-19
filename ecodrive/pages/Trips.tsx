
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Driver, Trip, Settings, TripCategory } from '../types';
import { calculateDistance, searchPlaces, PlaceResult } from '../services/geminiService';

interface TripsProps {
  drivers: Driver[];
  settings: Settings;
  trips: Trip[];
  onAddTrip: (trip: Trip) => void;
  onDeleteTrip: (id: string) => void;
}

const CATEGORIES: { label: TripCategory; icon: string; color: string }[] = [
  { label: 'Trabalho', icon: 'fa-briefcase', color: 'bg-blue-100 text-blue-600' },
  { label: 'Lazer', icon: 'fa-umbrella-beach', color: 'bg-emerald-100 text-emerald-600' },
  { label: 'Essencial', icon: 'fa-cart-shopping', color: 'bg-amber-100 text-amber-600' },
  { label: 'Educação', icon: 'fa-graduation-cap', color: 'bg-purple-100 text-purple-600' },
  { label: 'Outros', icon: 'fa-ellipsis', color: 'bg-gray-100 text-gray-600' },
];

const LocationPickerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelect: (place: string) => void;
  title: string;
  coords?: { lat: number, lng: number };
}> = ({ isOpen, onClose, onSelect, title, coords }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [summary, setSummary] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    setSummary('');
    const response = await searchPlaces(query, coords);
    setResults(response.places);
    setSummary(response.summary);
    setSearching(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-emerald-600 text-white">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-map-marked-alt text-xl"></i>
            <h3 className="font-bold text-lg">{title}</h3>
          </div>
          <button onClick={onClose} className="hover:bg-emerald-500 p-2 rounded-full transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        
        <div className="p-6 bg-gray-50 border-b border-gray-100">
          <form onSubmit={handleSearch} className="relative">
            <input
              autoFocus
              type="text"
              placeholder="Ex: Aeroporto, Shopping, Endereço..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-28 py-4 border-2 border-transparent bg-white rounded-2xl shadow-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-gray-700 font-medium"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
            <button 
              type="submit" 
              disabled={searching}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md active:scale-95 disabled:bg-gray-400"
            >
              {searching ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Buscar'}
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {searching && (
            <div className="flex flex-col items-center justify-center py-16 text-emerald-600">
              <i className="fa-solid fa-compass animate-spin text-5xl mb-4 opacity-50"></i>
              <p className="font-medium text-gray-500 animate-pulse text-center">Cruzando dados espaciais...</p>
            </div>
          )}

          {!searching && summary && (
            <div className="bg-emerald-50/50 border-l-4 border-emerald-500 p-5 rounded-r-xl">
              <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                Descrição do Local
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed italic">{summary}</p>
            </div>
          )}

          {!searching && results.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">Sugestões Diretas</h4>
              {results.map((place, idx) => (
                <div 
                  key={idx}
                  className="group p-4 bg-white hover:bg-emerald-600 border border-gray-100 hover:border-emerald-500 rounded-2xl transition-all cursor-pointer flex justify-between items-center shadow-sm hover:shadow-emerald-200"
                  onClick={() => onSelect(place.name)}
                >
                  <div className="flex gap-4">
                    <div className="bg-gray-50 p-3 rounded-xl text-emerald-600 group-hover:bg-white group-hover:text-emerald-600 transition-colors shadow-inner">
                      <i className="fa-solid fa-location-dot"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 group-hover:text-white transition-colors">{place.name}</h4>
                      <div className="text-[10px] text-blue-500 group-hover:text-emerald-100 font-bold uppercase tracking-tighter mt-1 flex items-center gap-1">
                        <i className="fa-solid fa-check-circle"></i> Local verificado
                      </div>
                    </div>
                  </div>
                  <i className="fa-solid fa-plus-circle text-gray-200 group-hover:text-white transition-colors text-xl"></i>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Trips: React.FC<TripsProps> = ({ drivers, settings, trips, onAddTrip, onDeleteTrip }) => {
  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState<'origin' | 'destination' | null>(null);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number, lng: number } | undefined>();
  
  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    driverId: '',
    origin: '',
    destination: '',
    isRoundTrip: false,
    category: 'Trabalho' as TripCategory,
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.log("Usando busca global.")
      );
    }
  }, []);

  // Lógica de "Favoritos" baseada nos últimos locais buscados (Histórico Recente)
  const recentLocations = useMemo(() => {
    const locations = new Set<string>();
    // As viagens já vêm ordenadas por data descendente do StorageService
    for (const trip of trips) {
      if (trip.origin) locations.add(trip.origin);
      if (trip.destination) locations.add(trip.destination);
      if (locations.size >= 5) break;
    }
    return Array.from(locations);
  }, [trips]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(event.target as Node)) setShowOriginSuggestions(false);
      if (destRef.current && !destRef.current.contains(event.target as Node)) setShowDestSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.driverId || !formData.origin || !formData.destination) {
      alert('Complete os campos para calcular a viagem.');
      return;
    }

    setLoading(true);
    try {
      const result = await calculateDistance(formData.origin, formData.destination, userCoords);
      
      if (result.km <= 0) {
        alert('Rota não encontrada. Tente informar endereços mais detalhados.');
        setLoading(false);
        return;
      }

      const driver = drivers.find(d => d.id === formData.driverId);
      if (!driver) return;

      const totalDistance = formData.isRoundTrip ? result.km * 2 : result.km;
      const cost = (totalDistance / driver.avgConsumption) * settings.fuelPrice;

      onAddTrip({
        id: crypto.randomUUID(),
        driverId: driver.id,
        driverName: driver.name,
        origin: formData.origin,
        destination: formData.destination,
        distance: result.km,
        isRoundTrip: formData.isRoundTrip,
        totalDistance,
        cost,
        category: formData.category,
        date: new Date(formData.date).toISOString()
      });

      setFormData(prev => ({ ...prev, origin: '', destination: '', isRoundTrip: false }));
    } catch (err) {
      alert('Erro ao processar rota via satélite.');
    } finally {
      setLoading(false);
    }
  };

  const SuggestionList = ({ type }: { type: 'origin' | 'destination' }) => (
    recentLocations.length > 0 ? (
      <div className="absolute z-40 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1">
        <div className="bg-emerald-50 px-3 py-2 border-b border-emerald-100 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">Últimos Locais (Favoritos)</span>
          <i className="fa-solid fa-star text-amber-500 text-[10px]"></i>
        </div>
        <div className="max-h-48 overflow-y-auto">
          {recentLocations.map((loc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, [type]: loc }));
                setShowOriginSuggestions(false);
                setShowDestSuggestions(false);
              }}
              className="w-full text-left px-4 py-3 text-sm hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-3 border-b border-gray-50 last:border-0 group"
            >
              <i className="fa-solid fa-clock-rotate-left text-gray-300 group-hover:text-emerald-100"></i>
              <span className="truncate font-medium">{loc}</span>
            </button>
          ))}
        </div>
      </div>
    ) : null
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Registrar Viagem</h2>
          <p className="text-gray-500">Gestão simplificada com inteligência de rotas.</p>
        </div>
        {userCoords && (
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            SATÉLITE CONECTADO
          </div>
        )}
      </header>

      <LocationPickerModal
        isOpen={!!modalType}
        onClose={() => setModalType(null)}
        onSelect={(p) => {
          setFormData(prev => ({ ...prev, [modalType!]: p }));
          setModalType(null);
        }}
        title={modalType === 'origin' ? 'Ponto de Origem' : 'Ponto de Destino'}
        coords={userCoords}
      />

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-visible">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Condutor</label>
              <select
                value={formData.driverId}
                onChange={e => setFormData(prev => ({ ...prev, driverId: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium transition-all"
              >
                <option value="">Selecione...</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            <div className="relative" ref={originRef}>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Origem</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="De onde você saiu?"
                  autoComplete="off"
                  value={formData.origin}
                  onFocus={() => { setShowOriginSuggestions(true); setShowDestSuggestions(false); }}
                  onClick={() => { setShowOriginSuggestions(true); setShowDestSuggestions(false); }}
                  onChange={e => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                  className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                />
                <button type="button" onClick={() => setModalType('origin')} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 hover:scale-110 transition-transform">
                  <i className="fa-solid fa-map-pin"></i>
                </button>
              </div>
              {showOriginSuggestions && <SuggestionList type="origin" />}
            </div>

            <div className="relative" ref={destRef}>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Destino</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Para onde você vai?"
                  autoComplete="off"
                  value={formData.destination}
                  onFocus={() => { setShowDestSuggestions(true); setShowOriginSuggestions(false); }}
                  onClick={() => { setShowDestSuggestions(true); setShowOriginSuggestions(false); }}
                  onChange={e => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                  className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                />
                <button type="button" onClick={() => setModalType('destination')} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 hover:scale-110 transition-transform">
                  <i className="fa-solid fa-map-location-dot"></i>
                </button>
              </div>
              {showDestSuggestions && <SuggestionList type="destination" />}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Data da Viagem</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-4 border-t border-gray-50">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">Categoria</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: cat.label }))}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border
                      ${formData.category === cat.label ? `${cat.color} border-current shadow-sm` : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'}`}
                  >
                    <i className={`fa-solid ${cat.icon}`}></i>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6 self-end">
              <label className="flex items-center gap-3 text-sm font-bold text-gray-600 cursor-pointer group">
                <div className={`w-10 h-6 rounded-full transition-colors relative ${formData.isRoundTrip ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isRoundTrip ? 'left-5' : 'left-1'}`}></div>
                </div>
                <input type="checkbox" className="hidden" checked={formData.isRoundTrip} onChange={e => setFormData(p => ({ ...p, isRoundTrip: e.target.checked }))} />
                Ida e Volta
              </label>

              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all flex items-center gap-3 disabled:bg-gray-400 shadow-lg shadow-emerald-200 active:scale-95"
              >
                {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-plus-circle"></i>}
                {loading ? 'Calculando...' : 'Registrar'}
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-black text-gray-800 tracking-tight">Histórico de Movimentação</h3>
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{trips.length} ENTRADAS</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-[9px] uppercase font-black tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Data/Cat.</th>
                <th className="px-6 py-4">Condutor</th>
                <th className="px-6 py-4">Rota</th>
                <th className="px-6 py-4 text-center">Distância</th>
                <th className="px-6 py-4 text-right">Custo Total</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {trips.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-gray-300 italic font-medium">Nenhum registro no período.</td></tr>
              ) : (
                trips.map(trip => {
                  const catInfo = CATEGORIES.find(c => c.label === trip.category) || CATEGORIES[4];
                  return (
                    <tr key={trip.id} className="hover:bg-emerald-50/20 transition-colors group">
                      <td className="px-6 py-5">
                        <p className="text-xs font-bold text-gray-700">{new Date(trip.date).toLocaleDateString('pt-BR')}</p>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md mt-1 inline-block ${catInfo.color}`}>
                          {trip.category}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-black">
                            {trip.driverName.charAt(0)}
                          </div>
                          <span className="font-bold text-gray-800 text-sm">{trip.driverName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-900 font-bold max-w-[120px] truncate" title={trip.origin}>{trip.origin}</span>
                          <i className="fa-solid fa-arrow-right-long text-gray-300 text-[10px]"></i>
                          <span className="text-emerald-700 font-bold max-w-[120px] truncate" title={trip.destination}>{trip.destination}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <p className="font-black text-gray-800 text-sm">{trip.totalDistance.toFixed(1)} km</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">{trip.isRoundTrip ? 'Ida e Volta' : 'Só Ida'}</p>
                      </td>
                      <td className="px-6 py-5 text-right font-black text-emerald-600 text-lg">
                        <span className="text-[10px] mr-1">R$</span>{trip.cost.toFixed(2)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button onClick={() => onDeleteTrip(trip.id)} className="text-gray-200 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-50">
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Trips;
