import React, { useState } from 'react';
import { Bell, BatteryWarning, Receipt, CheckCircle2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdminNotificacionesBell: React.FC = () => {
  const { adminNotificaciones, descartarAdminNotificacion, setActiveView } = useApp();
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label={`${adminNotificaciones.length} notificaciones`}
        className="relative p-1.5 text-[#7C6E65] hover:text-[#231815] transition-colors"
      >
        <Bell className="w-5 h-5" />
        {adminNotificaciones.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#DC2626] text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow-xs">
            {adminNotificaciones.length}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#E5DCD3] shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-4 py-3 bg-[#231815] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#DF7B1B]" />
              <span className="text-xs font-black tracking-wide uppercase">Notificaciones de Admin</span>
            </div>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="p-0.5 rounded hover:bg-white/10 text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 max-h-80 overflow-y-auto space-y-2 bg-[#FAF8F5]">
            {adminNotificaciones.length === 0 ? (
              <div className="py-6 text-center space-y-1.5">
                <CheckCircle2 className="w-6 h-6 text-[#059669] mx-auto" />
                <p className="text-xs font-bold text-[#1E110A]">Todo en orden</p>
                <p className="text-[11px] text-[#8C7D73]">No hay alertas de batería ni cortes pendientes.</p>
              </div>
            ) : (
              adminNotificaciones.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-xl bg-white border flex items-start justify-between gap-2.5 shadow-2xs ${
                    notif.tipo === 'bateria' ? 'border-[#FED7AA]' : 'border-[#E5DCD3]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        notif.tipo === 'bateria'
                          ? 'bg-[#FFF3E0] text-[#DF7B1B]'
                          : 'bg-[#E6F7F0] text-[#059669]'
                      }`}
                    >
                      {notif.tipo === 'bateria' ? (
                        <BatteryWarning className="w-4 h-4" />
                      ) : (
                        <Receipt className="w-4 h-4" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-black text-[#1E110A]">{notif.titulo}</p>
                      <p className="text-[11px] text-[#6E5A4E] leading-snug">{notif.mensaje}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] text-[#8C7D73]">{notif.hora}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setAbierto(false);
                            setActiveView(notif.vistaDestino);
                          }}
                          className="text-[10px] font-bold text-[#DF7B1B] hover:underline"
                        >
                          {notif.tipo === 'bateria' ? 'Ver botones →' : 'Ir a Caja →'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => descartarAdminNotificacion(notif.id)}
                    className="text-[10px] font-bold text-[#8C7D73] hover:text-[#1E110A] px-1.5 py-0.5 rounded hover:bg-stone-100"
                    title="Marcar como leída"
                  >
                    ✓
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
