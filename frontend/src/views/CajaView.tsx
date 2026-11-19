import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AdminSidebar } from '../components/AdminSidebar';
import adminAvatarImg from '../img/admin-avatar.jpg';
import { 
  ChevronRight, 
  ChevronDown, 
  Printer,
  Bell
} from 'lucide-react';
import Swal from 'sweetalert2';

interface CorteRow {
  id: string;
  fecha: string;
  mesero: string;
  total: number;
}

export const CajaView: React.FC = () => {
  const { mostrarTicketModal, setActiveView } = useApp();
  const [paginaActual, setPaginaActual] = useState(1);
  const filasPorPagina = 5;

  const cortes: CorteRow[] = [
    { id: '#07', fecha: '26/03/2026 · 20:00', mesero: 'Melissa H.', total: 7450.00 },
    { id: '#06', fecha: '25/03/2026 · 20:00', mesero: 'Dante M.', total: 4310.00 },
    { id: '#05', fecha: '24/03/2026 · 20:00', mesero: 'Gael O.', total: 6980.00 },
    { id: '#04', fecha: '23/03/2026 · 20:00', mesero: 'Melissa H.', total: 5150.00 },
    { id: '#03', fecha: '22/03/2026 · 20:00', mesero: 'Melissa H.', total: 6390.00 },
    { id: '#02', fecha: '21/03/2026 · 20:00', mesero: 'Gael O.', total: 7210.00 },
    { id: '#01', fecha: '20/03/2026 · 20:00', mesero: 'Dante M.', total: 4820.00 },
  ];

  const totalPaginas = Math.ceil(cortes.length / filasPorPagina) || 1;
  const elementosPaginados = cortes.slice(
    (paginaActual - 1) * filasPorPagina,
    paginaActual * filasPorPagina
  );

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#1E110A] flex flex-row font-sans selection:bg-amber-100">
      
      {/* 1. LEFT ADMIN SIDEBAR */}
      <AdminSidebar currentSubTitle="CAJA" />

      {/* 2. MAIN ADMINISTRATIVE WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header */}
        <header className="bg-white border-b border-[#E7DDD3] px-8 py-3.5 flex items-center justify-between shrink-0">
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#8C7D73] font-medium">Panel Principal</span>
              <span className="text-[#A8988D] font-bold">›</span>
              <span className="text-[#1E110A] font-bold">Caja</span>
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
            <div
              onClick={() => {
                Swal.fire({
                  title: 'Perfil de Administrador',
                  html: '<p><b>Nombre:</b> Dante M.</p><p><b>Correo:</b> admin@holacafe.com</p><p><b>Rol:</b> Administrador</p>',
                  icon: 'info',
                  confirmButtonColor: '#7B3F00',
                });
              }}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
            ></div>
            
              <div className="w-8 h-8 rounded-full overflow-hidden border border-[#D5C7BA] bg-[#231815]">
                <img 
                  src={adminAvatarImg} 
                  alt="Administrador" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-[#1E110A] leading-tight">Dante M.</p>
                <p className="text-[10px] text-[#8C7D73] leading-tight">admin@holacafe.com</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#8C7D73]" />
            
          </div>

        </header>

        {/* Content Area */}
        <main className="p-8 max-w-6xl w-full mx-auto space-y-6 flex-1">
          
          {/* Header Title + 3 Metrics Cards (Ventas del día | Cuentas abiertas | Tickets impresos) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-[#1E110A] tracking-tight">
                Caja
              </h1>
              <p className="text-xs sm:text-sm text-[#786B63] mt-1 font-medium">
                Cuentas abiertas por mesa, cobro y emisión de tickets.
              </p>
            </div>

            {/* 3 Metrics Grouped Box matching Figma UI_Caja.pdf */}
            <div className="inline-flex items-center bg-white border border-[#E5DCD3] rounded-2xl overflow-hidden self-start md:self-auto shadow-2xs divide-x divide-[#E5DCD3]">
              <div className="px-5 py-3 text-left min-w-[130px]">
                <span className="block text-[11px] font-semibold text-[#8C7D73]">Ventas del día</span>
                <span className="text-xl sm:text-2xl font-black text-[#1E110A] leading-tight">$18,420.00</span>
              </div>
              <div className="px-5 py-3 text-left min-w-[110px]">
                <span className="block text-[11px] font-semibold text-[#8C7D73]">Cuentas abiertas</span>
                <span className="text-xl sm:text-2xl font-black text-[#DF7B1B] leading-tight">5</span>
              </div>
              <div className="px-5 py-3 text-left min-w-[110px]">
                <span className="block text-[11px] font-semibold text-[#8C7D73]">Tickets impresos</span>
                <span className="text-xl sm:text-2xl font-black text-[#1E110A] leading-tight">37</span>
              </div>
            </div>
          </div>

          {/* Historial de cortes card and table */}
          <div className="bg-white rounded-2xl border border-[#E5DCD3] shadow-sm overflow-hidden">
            
            <div className="p-6 border-b border-[#F5EFEB] flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-[#1E110A]">
                  Historial de cortes
                </h2>
                <p className="text-xs text-[#8C7D73] mt-0.5">
                  Últimos 7 cortes realizados en la caja.
                </p>
              </div>

              <span className="text-xs font-bold text-[#8C7D73] bg-[#FAF8F5] border border-[#E5DCD3] px-3 py-1 rounded-lg">
                7 REGISTROS
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-[#8C7D73] font-bold border-b border-[#E5DCD3] uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-6">ID</th>
                    <th className="py-3.5 px-6">FECHA</th>
                    <th className="py-3.5 px-6 text-right">MESERO</th>
                    <th className="py-3.5 px-6 text-right">TOTAL</th>
                    <th className="py-3.5 px-6 text-right">IMPRIMIR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5EFEB] font-medium text-[#1E110A]">
                  {elementosPaginados.map(corte => (
                    <tr key={corte.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-[#1E110A]">{corte.id}</td>
                      <td className="py-4 px-6 text-[#786B63]">{corte.fecha}</td>
                      <td className="py-4 px-6 text-right text-[#786B63] font-medium">{corte.mesero}</td>
                      <td className="py-4 px-6 text-right font-black text-[#1E110A]">
                        ${corte.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => {
                                            Swal.fire({
                                              title: 'Ticket',
                                              text: 'Imprimir ticket',
                                              icon: 'success',
                                              confirmButtonColor: '#7B3F00',
                                            });
                                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D5C7BA] hover:bg-stone-50 rounded-xl text-xs font-bold text-[#1E110A] transition-colors shadow-2xs"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#8C7D73]" />
                          <span>Imprimir</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-[#FAF8F5] border-t border-[#E5DCD3] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8C7D73]">
              <span>Mostrando {elementosPaginados.length} de {cortes.length} cortes registrados</span>

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
                      className={`w-7 h-7 rounded font-bold flex items-center justify-center ${
                        paginaActual === idx + 1
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
