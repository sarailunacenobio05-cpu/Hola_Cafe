import React, { useState } from 'react';
import { useApp, esAlertaParaMesero } from '../context/AppContext';
import { Logo } from '../components/Logo';
import { AlertaBarraPopover } from '../components/AlertaBarraPopover';
import { UsuarioPerfilNavbar } from '../components/UsuarioPerfilNavbar';
import {
  Bell,
  LogOut,
  LayoutGrid,
  ChefHat,
  Check,
  Coffee,
  UtensilsCrossed,
  XCircle,
} from 'lucide-react';
import Swal from 'sweetalert2';
import manitaCancelarMesaImg from '../img/ManitaCancelarMesa.jpg';
import { TableInfo } from '../types';

export const MapaMesasView: React.FC = () => {
  const {
    tables,
    barAlerts,
    currentUser,
    activeTableId,
    selectTable,
    setActiveView,
    mostrarCobroModal,
    liberarMesaDirectamente,
    mesasAtendidas,
    marcarMesaAtendida,
    logout,
  } = useApp();

  const visibleAlerts = barAlerts.filter((a) => esAlertaParaMesero(a, currentUser));

  const [activeFilter, setActiveFilter] = useState<'Todas' | 'Libres' | 'Ocupadas' | 'Atención'>('Todas');

  const handleOpenComanda = (tableId: string) => {
    selectTable(tableId);
    setActiveView('comandero');
  };

  const handleCobrar = (tableId: string) => {
    selectTable(tableId);
    mostrarCobroModal(tableId);
  };

  const handleCancelarMesa = async (tableId: string) => {
    const mesaLabel = tableId.replace('M', 'Mesa ');
    const res = await Swal.fire({
      imageUrl: manitaCancelarMesaImg,
      imageWidth: 135,
      imageHeight: 135,
      imageAlt: 'Manita cancelar mesa',
      title: `¿Cancelar comanda de ${mesaLabel}?`,
      text: 'Esta acción liberará la mesa, descartará la comanda actual y quitará las alertas activas.',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar y liberar mesa',
      cancelButtonText: 'No, conservar',
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#786B63',
      reverseButtons: true,
      background: '#FFFFFF',
      color: '#1E110A',
      customClass: {
        popup: 'rounded-2xl shadow-xl border border-[#EFE6DA]',
        image: 'mx-auto mb-2 object-contain',
        title: 'text-[#1E110A] font-extrabold text-xl',
        confirmButton: 'rounded-xl px-5 py-2.5 font-bold',
        cancelButton: 'rounded-xl px-5 py-2.5 font-bold',
      },
    });
    if (res.isConfirmed) {
      liberarMesaDirectamente(tableId);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `${mesaLabel} liberada correctamente`,
        showConfirmButton: false,
        timer: 2200,
        background: '#FAF8F5',
        color: '#1E110A',
      });
    }
  };

  const isTableLibre = (table: TableInfo) => {
    const st = (table.status || '').toLowerCase();
    return st.includes('limpia') || st.includes('disponible') || st === 'libre' || st.includes('reservada');
  };

  const hasActiveAlert = (table: TableInfo) => {
    return visibleAlerts.some((a) => a.tableId === table.id);
  };

  const getOrderTotal = (table: TableInfo): number => {
    if (table.currentOrder && table.currentOrder.items.length > 0) {
      const sub = table.currentOrder.items.reduce((acc, it) => acc + it.price * it.quantity, 0);
      return sub;
    }
    return 0;
  };

  const totalMesas = tables.length;
  const libresCount = tables.filter((t) => isTableLibre(t)).length;
  const ocupadasCount = tables.filter((t) => !isTableLibre(t)).length;
  const alertasCount = visibleAlerts.length;

  const filteredTables = tables.filter((table) => {
    if (activeFilter === 'Libres') return isTableLibre(table);
    if (activeFilter === 'Ocupadas') return !isTableLibre(table);
    if (activeFilter === 'Atención') return hasActiveAlert(table);
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#1E110A] flex flex-col justify-between font-sans selection:bg-amber-100">
      {/* 1. TOP HEADER */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[#E7DDD3] bg-[#F5EFEB] shrink-0">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          <Logo size="md" variant="badge-only" />
          <span className="font-extrabold text-[#1E110A] text-xl tracking-tight leading-none">
            ¡Hola, Café!
          </span>
        </div>

        {/* Center: Views Navigation */}
        <div className="hidden sm:flex items-center bg-[#EDE3D8] rounded-xl p-1 gap-1 border border-[#D5C7BA]">
          <button
            type="button"
            className="px-3 py-1 text-xs font-bold text-[#1E110A] bg-white rounded-lg flex items-center gap-1.5 shadow-2xs"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#8B4513]" />
            <span>Mesas</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (!activeTableId && tables[0]) {
                selectTable(tables[0].id);
              }
              setActiveView('comandero');
            }}
            className="px-3 py-1 text-xs font-semibold text-[#6E5A4E] hover:text-[#1E110A] rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#8B4513]" />
            <span>Comandero</span>
          </button>
        </div>

        {/* Right: Alerta Barra + User + Logout */}
        <div className="flex items-center gap-4">
          <AlertaBarraPopover />
          <UsuarioPerfilNavbar />
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#6E5A4E] hover:text-[#1E110A] transition-colors ml-1"
          >
            <LogOut className="w-3.5 h-3.5 text-[#6E5A4E]" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </header>

      {/* 2. SUBHEADER TOOLBAR & COUNTERS */}
      <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 max-w-[1600px] w-full mx-auto">
        {/* Left: Filter selector pill */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter('Todas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeFilter === 'Todas'
                ? 'bg-[#3A1F13] text-white shadow-xs'
                : 'bg-white border border-[#D5C7BA] text-[#1E110A]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-amber-500" />
            <span>Todo el Local ({totalMesas} Mesas)</span>
          </button>
        </div>

        {/* Right: Status counts pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 md:pb-0">
          {/* Libres */}
          <button
            type="button"
            onClick={() => setActiveFilter('Libres')}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-2 ${
              activeFilter === 'Libres' ? 'ring-2 ring-stone-400 bg-white' : 'bg-white/80 border-[#D5C7BA]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#059669]" />
            <span className="text-[10px] text-[#8C7D73] font-bold uppercase">LIBRES</span>
            <span className="font-extrabold text-[#1E110A]">
              {libresCount} {libresCount === 1 ? 'Mesa' : 'Mesas'}
            </span>
          </button>

          {/* Ocupadas */}
          <button
            type="button"
            onClick={() => setActiveFilter('Ocupadas')}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-2 ${
              activeFilter === 'Ocupadas' ? 'ring-2 ring-amber-500 bg-white' : 'bg-white/80 border-[#D5C7BA]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#DF7B1B]" />
            <span className="text-[10px] text-[#8C7D73] font-bold uppercase">OCUPADAS</span>
            <span className="font-extrabold text-[#1E110A]">
              {ocupadasCount} {ocupadasCount === 1 ? 'Mesa' : 'Mesas'}
            </span>
          </button>

          {/* Atención (Alertas en vivo) */}
          <button
            type="button"
            onClick={() => setActiveFilter('Atención')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-xs transition-colors ${
              alertasCount > 0
                ? 'bg-[#D32F2F] text-white hover:bg-[#B71C1C]'
                : 'bg-white border border-[#D5C7BA] text-[#6E5A4E]'
            } ${activeFilter === 'Atención' ? 'ring-2 ring-red-400' : ''}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                alertasCount > 0 ? 'bg-white animate-ping' : 'bg-[#059669]'
              }`}
            />
            <span className="text-[10px] uppercase tracking-wider">ATENCIÓN</span>
            <span>
              {alertasCount} {alertasCount === 1 ? 'Alerta' : 'Alertas'}
            </span>
          </button>
        </div>
      </div>

      {/* 3. SECTION SUBHEADER */}
      <div className="px-6 flex items-center justify-between max-w-[1600px] w-full mx-auto mb-3">
        <h2 className="text-lg font-black text-[#1E110A]">
          Mesas del Servicio ({filteredTables.length})
        </h2>
        <span className="text-xs text-[#786B63] font-medium hidden sm:block">
          Pulse sobre una mesa para abrir comanda o gestionar servicio
        </span>
      </div>

      {/* 4. MAIN TABLES GRID (Cuadrícula 3x3 para las 9 mesas) */}
      <main className="flex-1 px-6 pb-8 max-w-[1600px] w-full mx-auto">
        {filteredTables.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5DCD3] p-10 text-center space-y-2">
            <p className="text-sm font-black text-[#1E110A]">No hay mesas en este filtro</p>
            <p className="text-xs text-[#8C7D73]">
              Cambia el filtro superior para ver el resto de las mesas del salón.
            </p>
            <button
              type="button"
              onClick={() => setActiveFilter('Todas')}
              className="mt-2 px-4 py-2 bg-[#3A1F13] text-white rounded-xl text-xs font-bold"
            >
              Ver todas las mesas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTables.map((table) => {
              const enAlerta = hasActiveAlert(table);
              const fueAtendida = Boolean(mesasAtendidas[table.id]);
              const libre = isTableLibre(table);
              const stLower = (table.status || '').toLowerCase();
              const enPreparacion = stLower.includes('preparaci');
              const totalMesa = getOrderTotal(table);
              const tieneProductoEntregado = Boolean(
                table.currentOrder?.items.some((i) => Boolean(i.entregado))
              );

              // 1. MESA CON ALERTA ACTIVA (Pedido listo, Cancelación de cocina o Llamado de mesa)
              if (enAlerta) {
                const alertaMesa = visibleAlerts.find((a) => a.tableId === table.id);
                const esPedidoListo = alertaMesa?.tipo === 'cocina';
                const esCancelacionCocina = alertaMesa?.tipo === 'cocina-cancelacion';
                return (
                  <div
                    key={table.id}
                    className={`bg-white rounded-2xl p-5 flex flex-col justify-between shadow-2xs transition-all border-2 ${
                      esCancelacionCocina
                        ? 'border-[#D97706]'
                        : esPedidoListo
                          ? 'border-[#059669]'
                          : 'border-[#D32F2F]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3
                            className={`text-xl font-black leading-tight ${
                              esCancelacionCocina
                                ? 'text-[#D97706]'
                                : esPedidoListo
                                  ? 'text-[#059669]'
                                  : 'text-[#D32F2F]'
                            }`}
                          >
                            {table.id}
                          </h3>
                          <span className="text-[11px] text-[#8C7D73] font-medium">
                            Capacidad: {table.capacity} personas
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase ${
                            esCancelacionCocina
                              ? 'bg-[#D97706] text-white'
                              : esPedidoListo
                                ? 'bg-[#059669] text-white'
                                : 'bg-[#3A1F13] text-white'
                          }`}
                        >
                          {esCancelacionCocina ? 'Sin ingredientes' : esPedidoListo ? 'Pedido listo' : 'Atender'}
                        </span>
                      </div>

                      <div className="py-5 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-black text-[#1E110A]">
                          {esPedidoListo || esCancelacionCocina ? (
                            <ChefHat className={`w-4 h-4 ${esCancelacionCocina ? 'text-[#D97706]' : 'text-[#059669]'}`} />
                          ) : (
                            <Bell className="w-3.5 h-3.5 text-[#D32F2F] animate-bounce" />
                          )}
                          <span>
                            {esCancelacionCocina
                              ? 'Producto cancelado en cocina'
                              : esPedidoListo
                                ? 'Pedido listo para llevar a mesa'
                                : 'Llamado de mesa activo'}
                          </span>
                        </div>
                        <p className="text-xs text-[#8C7D73]">
                          {(esPedidoListo || esCancelacionCocina) && alertaMesa?.message ? (
                            <span className={esCancelacionCocina ? 'text-[#92400E] font-medium' : 'text-[#065F46] font-medium'}>
                              {alertaMesa.message}
                            </span>
                          ) : (
                            <span>{alertaMesa?.message || 'El cliente solicita atención en esta mesa'}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => marcarMesaAtendida(table.id)}
                        className={`py-2.5 px-2 text-white rounded-xl text-xs font-bold shadow-xs transition-colors text-center ${
                          esCancelacionCocina
                            ? 'bg-[#D97706] hover:bg-[#B45309]'
                            : esPedidoListo
                              ? 'bg-[#059669] hover:bg-[#047857]'
                              : 'bg-[#D32F2F] hover:bg-[#B71C1C]'
                        }`}
                      >
                        {esCancelacionCocina ? 'Enterado' : esPedidoListo ? 'Entregar a mesa' : 'Atender llamado'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenComanda(table.id)}
                        className="py-2.5 px-2 bg-white hover:bg-stone-50 border border-[#D5C7BA] text-[#1E110A] rounded-xl text-xs font-bold text-center"
                      >
                        Abrir comanda
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCancelarMesa(table.id)}
                      className="mt-2 w-full py-2 px-2 bg-[#FFF5F5] hover:bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancelar mesa</span>
                    </button>
                  </div>
                );
              }

              // 2. MESA LIMPIA / DISPONIBLE
              if (libre) {
                return (
                  <div
                    key={table.id}
                    className="bg-[#FAF8F5] rounded-2xl border border-[#E5DCD3] p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-black text-[#1E110A] leading-tight">
                            {table.id}
                          </h3>
                          <span className="text-[11px] text-[#8C7D73] font-medium">
                            Capacidad: {table.capacity} personas
                          </span>
                        </div>
                        <span className="bg-[#E6F7F0] text-[#059669] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#A7F3D0]">
                          Limpia
                        </span>
                      </div>

                      <div className="py-5 space-y-1">
                        <p className="text-xs font-bold text-[#1E110A] flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-[#059669]" />
                          <span>Disponible / Libre</span>
                        </p>
                        <p className="text-[11px] text-[#8C7D73]">
                          Lista para tomar orden
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenComanda(table.id)}
                      className="w-full py-2.5 bg-white hover:bg-amber-50/60 text-[#1E110A] border border-[#D5C7BA] hover:border-[#DF7B1B] rounded-xl text-xs font-bold text-center transition-colors shadow-2xs"
                    >
                      Abrir comanda
                    </button>
                  </div>
                );
              }

              // 3. MESA OCUPADA (En Preparación / En Consumo / Atendida)
              return (
                <div
                  key={table.id}
                  className="bg-white rounded-2xl p-5 flex flex-col justify-between shadow-2xs border border-[#E5DCD3]"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-black text-[#1E110A] leading-tight">
                          {table.id}
                        </h3>
                        <span className="text-[11px] text-[#8C7D73] font-medium">
                          Capacidad: {table.capacity} personas
                        </span>
                      </div>
                      {enPreparacion ? (
                        <span className="bg-[#FAF8F5] border border-[#E5DCD3] text-[#786B63] text-[10px] font-bold px-2 py-0.5 rounded-md">
                          KDS
                        </span>
                      ) : fueAtendida ? (
                        <span className="bg-[#E6F7F0] text-[#059669] border border-[#A7F3D0] text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase">
                          Atendida
                        </span>
                      ) : (
                        <span className="bg-[#FAF8F5] border border-[#E5DCD3] text-[#786B63] text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Activa
                        </span>
                      )}
                    </div>

                    <div className="py-4 space-y-1">
                      {enPreparacion ? (
                        <p className="text-xs text-[#786B63] flex items-center gap-1 font-medium">
                          <ChefHat className="w-3.5 h-3.5 text-amber-600" />
                          <span>En Preparación</span>
                        </p>
                      ) : tieneProductoEntregado ? (
                        <p className="text-xs text-[#786B63] flex items-center gap-1 font-medium">
                          <Coffee className="w-3.5 h-3.5 text-[#8B4513]" />
                          <span>En Consumo</span>
                        </p>
                      ) : (
                        <p className="text-xs text-[#786B63] flex items-center gap-1 font-medium">
                          <UtensilsCrossed className="w-3.5 h-3.5 text-[#DF7B1B]" />
                          <span>Tomando Comanda</span>
                        </p>
                      )}

                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-[#1E110A]">
                          ${totalMesa.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-[#8C7D73] font-bold">MXN</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleOpenComanda(table.id)}
                      className="py-2 px-2 bg-white hover:bg-stone-50 border border-[#D5C7BA] text-[#1E110A] rounded-xl text-xs font-bold text-center"
                    >
                      Ver comanda
                    </button>
                    <button
                      type="button"
                      disabled={!tieneProductoEntregado}
                      title={
                        tieneProductoEntregado
                          ? 'Cobrar mesa'
                          : 'Disponible hasta que se entregue al menos un producto de cocina'
                      }
                      onClick={() => handleCobrar(table.id)}
                      className="py-2 px-2 bg-[#8B4513] hover:bg-[#72380F] disabled:opacity-45 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold text-center shadow-xs"
                    >
                      Cobrar
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCancelarMesa(table.id)}
                    className="mt-2 w-full py-2 px-2 bg-[#FFF5F5] hover:bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancelar mesa</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
