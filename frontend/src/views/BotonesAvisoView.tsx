import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { obtenerPaginado } from '../api/servicios';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminNotificacionesBell } from '../components/AdminNotificacionesBell';
import { UsuarioPerfilNavbar } from '../components/UsuarioPerfilNavbar';
import {
  Radio,
  Wifi,
  WifiOff,
  BatteryWarning,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  Search
} from 'lucide-react';
import Swal from 'sweetalert2';
import { IoTDevice } from '../types';

export const BotonesAvisoView: React.FC = () => {
  const { iotDevices, mostrarAddBotonModal, mostrarEditBotonModal, eliminarBoton } = useApp();

  const confirmarEliminarBoton = async (device: IoTDevice) => {
    const result = await Swal.fire({
      title: '¿Eliminar dispositivo?',
      html: `Se eliminará el dispositivo <strong>${device.id}</strong> (${device.name}). Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#8C7D73',
      background: '#FAF8F5',
      color: '#1E110A',
    });

    if (result.isConfirmed) {
      await eliminarBoton(device.id);
    }
  };

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Metrics
  const totalBotones = iotDevices.length;
  const conectadosCount = iotDevices.filter(d => d.status !== 'Sin conexión').length;
  const bateriaBajaCount = iotDevices.filter(d => d.batteryPercentage <= 25).length;
  const criticosCount = iotDevices.filter(d => d.batteryPercentage <= 10).length;
  const sinConexionCount = iotDevices.filter(d => d.status === 'Sin conexión').length;

  const [paginaActual, setPaginaActual] = useState(1);
  const filasPorPagina = 8;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const filtered = iotDevices.filter(dev => {
    const matchSearch = dev.id.toLowerCase().includes(search.toLowerCase()) ||
      dev.name.toLowerCase().includes(search.toLowerCase()) ||
      dev.tableId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Todos' || dev.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const [serverPage, setServerPage] = useState<{
    content: IoTDevice[];
    totalPages: number;
    totalElements: number;
  } | null>(null);

  useEffect(() => {
    let activo = true;
    obtenerPaginado<IoTDevice>(
      '/mesas/botones/paginado',
      {
        page: paginaActual,
        size: filasPorPagina,
        search: search.trim() || undefined,
        estado: statusFilter !== 'Todos' ? statusFilter : undefined,
      },
      filtered,
      (b: any) => {
        if (b.tableId !== undefined && b.batteryPercentage !== undefined) return b as IoTDevice;
        const bat = Number(b.bateria ?? 100);
        return {
          id: b.id,
          name:
            b.nombre ||
            `Botón de Mesa ${b.mesaNumero ? (b.mesaNumero < 10 ? `0${b.mesaNumero}` : b.mesaNumero) : ''}`.trim(),
          tableId:
            b.mesaId ||
            (b.mesaNumero ? `M${b.mesaNumero < 10 ? `0${b.mesaNumero}` : b.mesaNumero}` : ''),
          batteryPercentage: bat,
          status:
            b.estado === 'Sin conexión'
              ? 'Sin conexión'
              : bat <= 10
                ? 'Batería crítica'
                : bat <= 25
                  ? 'Batería baja'
                  : b.estado === 'ONLINE' || b.estado === 'En línea'
                    ? 'En línea'
                    : 'Sin conexión',
          lastConnection: b.estado === 'Sin conexión' ? 'Sin señal' : 'En línea',
        };
      }
    ).then((res) => {
      if (activo) {
        setServerPage({
          content: res.content,
          totalPages: res.totalPages,
          totalElements: res.totalElements,
        });
      }
    });
    return () => {
      activo = false;
    };
  }, [paginaActual, search, statusFilter, iotDevices]);

  const totalElements = serverPage ? serverPage.totalElements : filtered.length;
  const totalPaginas = serverPage
    ? serverPage.totalPages
    : Math.ceil(filtered.length / filasPorPagina) || 1;
  const elementosPaginados = serverPage
    ? serverPage.content
    : filtered.slice(
        (paginaActual - 1) * filasPorPagina,
        paginaActual * filasPorPagina
      );

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
              <span className="text-[#1E110A] font-bold">Botones de Aviso</span>
            </div>
          </div>

          {/* User profile & notifications */}
          <div className="flex items-center gap-4">
            <AdminNotificacionesBell />
            <UsuarioPerfilNavbar />
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
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPaginaActual(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#D5C7BA] rounded-xl text-xs font-semibold text-[#1E110A] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[#8C7D73] font-semibold">Estado:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPaginaActual(1);
                  }}
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
                  {totalElements} botones
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
                    <th className="py-3.5 px-6 text-right">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5EFEB] font-medium text-[#1E110A]">
                  {elementosPaginados.map(device => (
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
                          <span className={`font-black ${device.batteryPercentage <= 10 ? 'text-[#DC2626]' :
                              device.batteryPercentage <= 25 ? 'text-[#DF7B1B]' : 'text-[#1E110A]'
                            }`}>
                            {device.batteryPercentage}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(device.status)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => mostrarEditBotonModal(device)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D5C7BA] hover:border-[#e59819] hover:text-[#e59819] text-[#231815] rounded-xl text-xs font-semibold shadow-2xs transition-all"
                            title="Editar botón"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#7c6e65]" />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmarEliminarBoton(device)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D5C7BA] hover:border-red-300 hover:bg-red-50 hover:text-red-700 text-[#7c6e65] rounded-xl text-xs font-semibold shadow-2xs transition-all"
                            title="Eliminar dispositivo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar</span>
                          </button>
                        </div>
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
                <span>Filas por página: {filasPorPagina}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                    disabled={paginaActual === 1}
                    className="w-7 h-7 rounded border border-[#E5DCD3] flex items-center justify-center bg-white text-[#1E110A] disabled:text-[#A8988D] disabled:cursor-not-allowed hover:bg-stone-50"
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPaginas }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPaginaActual(idx + 1)}
                      className={`w-7 h-7 rounded font-bold flex items-center justify-center ${paginaActual === idx + 1
                          ? 'bg-[#DF7B1B] text-white shadow-xs'
                          : 'border border-[#E5DCD3] bg-white text-[#1E110A] hover:bg-stone-50'
                        }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                    disabled={paginaActual === totalPaginas}
                    className="w-7 h-7 rounded border border-[#E5DCD3] flex items-center justify-center bg-white text-[#1E110A] disabled:text-[#A8988D] disabled:cursor-not-allowed hover:bg-stone-50"
                  >
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
