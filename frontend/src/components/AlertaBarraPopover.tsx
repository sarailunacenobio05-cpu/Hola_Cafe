import React, { useState } from 'react';
import { Bell, CheckCircle2, ChefHat, Radio, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { useApp, esAlertaParaMesero } from '../context/AppContext';

export const AlertaBarraPopover: React.FC = () => {
  const { barAlerts, currentUser, descartarAlertaBarra, activarAlertaBarra } = useApp();
  const [abierto, setAbierto] = useState(false);

  const visibleAlerts = barAlerts.filter((a) => esAlertaParaMesero(a, currentUser));

  const handleAtenderAlerta = (id: string, tableId: string, tipo?: 'boton' | 'cocina' | 'cocina-cancelacion') => {
    descartarAlertaBarra(id);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title:
        tipo === 'cocina'
          ? `Pedido entregado en ${tableId.replace('M', 'Mesa ')}`
          : tipo === 'cocina-cancelacion'
            ? `Aviso confirmado (${tableId.replace('M', 'Mesa ')})`
            : `${tableId.replace('M', 'Mesa ')} atendida`,
      showConfirmButton: false,
      timer: 2200,
      background: '#FAF8F5',
      color: '#1E110A',
    });
  };

  const handleSimularBoton = () => {
    const mesas = ['M02', 'M04', 'M07', 'M08'];
    const mesaRandom = mesas[Math.floor(Math.random() * mesas.length)];
    activarAlertaBarra(mesaRandom, `${mesaRandom.replace('M', 'Mesa ')} solicita atención del mesero`);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs transition-colors"
      >
        <Bell className="w-3.5 h-3.5 fill-current" />
        <span>Alerta Barra</span>
        {visibleAlerts.length > 0 && (
          <span className="ml-0.5 bg-white text-[#D32F2F] text-[10px] font-black px-1.5 py-0.2 rounded-full leading-tight">
            {visibleAlerts.length}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-[#E5DCD3] shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-4 py-3 bg-[#7B3F00] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-black tracking-wide uppercase">Alertas de Mesas</span>
            </div>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="p-0.5 rounded hover:bg-white/10 text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 max-h-72 overflow-y-auto space-y-2 bg-[#FAF8F5]">
            {visibleAlerts.length === 0 ? (
              <div className="py-6 text-center space-y-1.5">
                <CheckCircle2 className="w-6 h-6 text-[#059669] mx-auto" />
                <p className="text-xs font-bold text-[#1E110A]">Sin alertas pendientes</p>
                <p className="text-[11px] text-[#8C7D73]">Todas las mesas han sido atendidas.</p>
              </div>
            ) : (
              visibleAlerts.map((alerta) => {
                const esCocina = alerta.tipo === 'cocina';
                const esCancelacion = alerta.tipo === 'cocina-cancelacion';
                return (
                  <div
                    key={alerta.id}
                    className={`p-3 rounded-xl bg-white border flex items-start justify-between gap-2.5 shadow-2xs ${
                      esCancelacion
                        ? 'border-[#FDE68A]'
                        : esCocina
                          ? 'border-[#A7F3D0]'
                          : 'border-[#FECACA]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        {esCocina || esCancelacion ? (
                          <ChefHat className={`w-3.5 h-3.5 ${esCancelacion ? 'text-[#D97706]' : 'text-[#059669]'}`} />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-[#D32F2F] animate-pulse" />
                        )}
                        <span
                          className={`text-xs font-black ${
                            esCancelacion
                              ? 'text-[#D97706]'
                              : esCocina
                                ? 'text-[#059669]'
                                : 'text-[#D32F2F]'
                          }`}
                        >
                          {esCancelacion
                            ? `Sin ingredientes · ${alerta.tableId.replace('M', 'Mesa ')}`
                            : esCocina
                              ? `Cocina · ${alerta.tableId.replace('M', 'Mesa ')}`
                              : alerta.tableId.replace('M', 'Mesa ')}
                        </span>
                        <span className="text-[10px] text-[#8C7D73] font-medium">{alerta.time}</span>
                      </div>
                      <p className="text-xs font-semibold text-[#1E110A] leading-snug">
                        {alerta.message}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAtenderAlerta(alerta.id, alerta.tableId, alerta.tipo)}
                      className={`px-2.5 py-1.5 text-white text-[11px] font-bold rounded-lg transition-colors shrink-0 ${
                        esCancelacion
                          ? 'bg-[#D97706] hover:bg-[#B45309]'
                          : esCocina
                            ? 'bg-[#059669] hover:bg-[#047857]'
                            : 'bg-[#D32F2F] hover:bg-[#B71C1C]'
                      }`}
                    >
                      {esCancelacion ? 'Enterado' : esCocina ? 'Entregado' : 'Atender'}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-2.5 bg-white border-t border-[#E5DCD3] flex justify-between items-center">
            <span className="text-[10px] text-[#8C7D73] font-medium">Botones IoT en tiempo real</span>
            <button
              type="button"
              onClick={handleSimularBoton}
              className="text-[11px] font-bold text-[#8B4513] hover:text-[#DF7B1B] px-2 py-1 rounded-lg bg-[#FAF8F5] border border-[#E5DCD3] transition-colors"
            >
              + Simular presión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
