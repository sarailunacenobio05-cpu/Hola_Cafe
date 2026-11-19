import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AdminSidebar } from '../components/AdminSidebar';
import adminAvatarImg from '../img/admin-avatar.jpg';
import { 
  Radio, 
  Wifi, 
  WifiOff, 
  Battery, 
  BatteryWarning, 
  RefreshCw, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  Edit3, 
  Search,
  Bell
} from 'lucide-react';
import { IoTDevice } from '../types';

export const BotonesAvisoView: React.FC = () => {
  const { iotDevices, mostrarAddBotonModal, setActiveView } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Metrics
  const totalBotones = iotDevices.length;
  const conectadosCount = iotDevices.filter(d => d.status !== 'Sin conexión').length;
  const bateriaBajaCount = iotDevices.filter(d => d.batteryPercentage <= 25).length;
  const criticosCount = iotDevices.filter(d => d.batteryPercentage <= 10).length;
  const sinConexionCount = iotDevices.filter(d => d.status === 'Sin conexión').length;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  // Filtered
  const filtered = iotDevices.filter(dev => {
    const matchSearch = dev.id.toLowerCase().includes(search.toLowerCase()) || 
                        dev.name.toLowerCase().includes(search.toLowerCase()) ||
                        dev.tableId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Todos' || dev.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: IoTDevice['status']) => {
    switch (status) {
      case 'En línea':
        return (
          <span className="flex items-center gap-1.5 text-[#059669] font-bold text-xs">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            En línea
          </span>
        );
      case 'Batería baja':
        return (
          <span className="flex items-center gap-1.5 text-[#D97706] font-bold text-xs">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            Batería baja
          </span>
        );
      case 'Batería crítica':
        return (
          <span className="flex items-center gap-1.5 text-[#DC2626] font-bold text-xs animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
            Batería crítica
          </span>
        );
      case 'Sin conexión':
        return (
          <span className="flex items-center gap-1.5 text-[#8C7D73] font-bold text-xs">
            <span className="w-2 h-2 rounded-full bg-[#A8988D]" />
            Sin conexión
          </span>
        );
    }
  };

  const getBatteryBarColor = (percent: number) => {
    if (percent <= 10) return 'bg-[#DC2626]';
    if (percent <= 25) return 'bg-[#F59E0B]';
    return 'bg-[#059669]';
  };

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#1E110A] flex flex-row font-sans selection:bg-amber-100">
      
      {/* 1. SIDEBAR */}
      <AdminSidebar currentSubTitle="BOTONES DE AVISO" />

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header */}
        <header className="bg-white border-b border-[#E7DDD3] px-8 py-3.5 flex items-center justify-between shrink-0">
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#8C7D73] font-medium">Panel Principal</span>
              <span className="text-[#A8988D] font-bold">›</span>
              <span className="text-[#1E110A] font-bold">Botones de Aviso</span>
            </div>
          </div>

          {/* User profile & notifications */}
          <div className="flex items-center gap-4">
            <button 
              type="button" 
              aria-label="2 notificaciones"
              className="relative p-1.5 text-[#7C6E65] hover:text-[#231815] transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#DC2626] text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow-xs">
                2
              </span>
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-[#D5C7BA] bg-[#231815]">
                <img 
                  src={adminAvatarImg} 
                  alt="Administrador" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-[#1E110A] leading-tight">Dante M.</p>
                <p className="text-[10px] text-[#8C7D73] leading-tight">Administrador</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#8C7D73]" />
            </div>
          </div>

        </header>

        {/* Content Area */}
        <main className="p-8 max-w-6xl w-full mx-auto space-y-6 flex-1">
          
          {/* Header Title + Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-[#1E110A] tracking-tight">
                Botones de Aviso
              </h1>
              <p className="text-xs sm:text-sm text-[#786B63] mt-1 font-medium">
                Supervisa la batería y la conexión de los botones de cada mesa.
              </p>
            </div>

            <button
              onClick={mostrarAddBotonModal}
              className="px-5 py-2.5 bg-[#DF7B1B] hover:bg-[#C96910] text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar botón</span>
            </button>
          </div>

          {/* 4 Metrics Cards (Botones Registrados | Conectados | Batería Baja | Sin Conexión) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#E5DCD3] shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#8C7D73] uppercase tracking-wider">BOTONES REGISTRADOS</span>
                <Radio className="w-4 h-4 text-[#8C7D73]" />
              </div>
              <p className="text-2xl font-black text-[#1E110A] mt-2">{totalBotones}</p>
              <span className="text-[11px] text-[#8C7D73] mt-1">{totalBotones} mesas asignadas</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E5DCD3] shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#8C7D73] uppercase tracking-wider">CONECTADOS</span>
                <Wifi className="w-4 h-4 text-[#059669]" />
              </div>
              <p className="text-2xl font-black text-[#1E110A] mt-2">{conectadosCount} / {totalBotones}</p>
              <span className="text-[11px] text-[#059669] font-semibold mt-1">En comunicación con el sistema</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E5DCD3] shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#8C7D73] uppercase tracking-wider">BATERÍA BAJA</span>
                <BatteryWarning className="w-4 h-4 text-[#DF7B1B]" />
              </div>
              <p className="text-2xl font-black text-[#DF7B1B] mt-2">{bateriaBajaCount}</p>
              <span className="text-[11px] text-[#8C7D73] mt-1">{criticosCount} crítico · {bateriaBajaCount - criticosCount} por reemplazar</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E5DCD3] shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#8C7D73] uppercase tracking-wider">SIN CONEXIÓN</span>
                <WifiOff className="w-4 h-4 text-[#DC2626]" />
              </div>
              <p className="text-2xl font-black text-[#DC2626] mt-2">{sinConexionCount}</p>
              <span className="text-[11px] text-[#8C7D73] mt-1">Botón pendiente de revisión</span>
            </div>
          </div>

          {/* Search, Filter & Refresh toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5DCD3] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7D73]" />
                <input
                  type="text"
                  placeholder="Buscar por identificador o mesa..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#D5C7BA] rounded-xl text-xs font-semibold text-[#1E110A] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[#8C7D73] font-semibold">Estado:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-[#D5C7BA] rounded-xl px-3 py-2 text-xs font-bold text-[#1E110A] focus:outline-none"
                >
                  <option value="Todos">Todos</option>
                  <option value="En línea">En línea</option>
                  <option value="Batería baja">Batería baja</option>
                  <option value="Batería crítica">Batería crítica</option>
                  <option value="Sin conexión">Sin conexión</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              className="w-full sm:w-auto px-4 py-2 bg-[#FAF8F5] hover:bg-stone-100 border border-[#D5C7BA] rounded-xl text-xs font-bold text-[#1E110A] flex items-center justify-center gap-1.5 transition-all shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#DF7B1B]' : 'text-[#8C7D73]'}`} />
              <span>Actualizar</span>
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-[#E5DCD3] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#F5EFEB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-[#1E110A]">Dispositivos registrados</h2>
                <span className="text-xs font-bold text-[#8C7D73] bg-[#FAF8F5] border border-[#E5DCD3] px-2.5 py-0.5 rounded-lg">
                  16 botones
                </span>
              </div>
              <span className="text-xs font-semibold text-[#DF7B1B]">
                Con atención primero
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-[#8C7D73] font-bold border-b border-[#E5DCD3] uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-6">DISPOSITIVO</th>
                    <th className="py-3.5 px-6">MESA ASIGNADA</th>
                    <th className="py-3.5 px-6">BATERÍA</th>
                    <th className="py-3.5 px-6">ESTADO</th>
                    <th className="py-3.5 px-6">ÚLTIMA CONEXIÓN</th>
                    <th className="py-3.5 px-6 text-right">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5EFEB] font-medium text-[#1E110A]">
                  {filtered.map(device => (
                    <tr key={device.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-4 px-6 flex items-center gap-2.5">
                        <span className="p-1.5 rounded-lg bg-[#FAF8F5] border border-[#E5DCD3] text-[#8C7D73]">
                          <Radio className="w-3.5 h-3.5" />
                        </span>
                        <div>
                          <p className="font-bold text-[#1E110A] text-xs">{device.id}</p>
                          <p className="text-[11px] text-[#8C7D73]">{device.name}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-[#1E110A]">
                        {device.tableId ? `Mesa ${device.tableId.replace('M', '')}` : 'Sin asignar'}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-[#F5EFEB] h-2 rounded-full overflow-hidden border border-[#E5DCD3]">
                            <div 
                              className={`h-full ${getBatteryBarColor(device.batteryPercentage)}`} 
                              style={{ width: `${device.batteryPercentage}%` }}
                            />
                          </div>
                          <span className={`font-black ${
                            device.batteryPercentage <= 10 ? 'text-[#DC2626]' :
                            device.batteryPercentage <= 25 ? 'text-[#DF7B1B]' : 'text-[#1E110A]'
                          }`}>
                            {device.batteryPercentage}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(device.status)}
                      </td>
                      <td className="py-4 px-6 text-[#6E5A4E]">
                        <p>{device.lastConnection}</p>
                        {device.status === 'Sin conexión' && (
                          <span className="text-[10px] text-[#A8988D] block">Última batería recibida</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D5C7BA] hover:border-[#e59819] hover:text-[#e59819] text-[#231815] rounded-xl text-xs font-semibold shadow-2xs transition-all"
                          title="Editar botón"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#7c6e65]" />
                          <span>Editar</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Informative Footer */}
            <div className="p-4 bg-[#FAF8F5] border-t border-[#E5DCD3] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#8C7D73]">
              <span>
                Última actualización: 14:32:10 · Batería baja: 25% o menos · Crítica: 10% o menos.
              </span>
              <div className="flex items-center gap-3">
                <span>Filas por página: 8</span>
                <div className="flex items-center gap-1">
                  <button disabled className="w-7 h-7 rounded border border-[#E5DCD3] flex items-center justify-center bg-white text-[#A8988D] cursor-not-allowed">
                    ‹
                  </button>
                  <button className="w-7 h-7 rounded bg-[#DF7B1B] text-white font-bold flex items-center justify-center shadow-xs">
                    1
                  </button>
                  <button className="w-7 h-7 rounded border border-[#E5DCD3] flex items-center justify-center bg-white text-[#1E110A] hover:bg-stone-50">
                    2
                  </button>
                  <button className="w-7 h-7 rounded border border-[#E5DCD3] flex items-center justify-center bg-white text-[#1E110A] hover:bg-stone-50">
                    ›
                  </button>
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>

    </div>
  );
};
