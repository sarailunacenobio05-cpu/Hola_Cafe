import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from '../components/Logo';
import { 
  Bell, 
  LogOut, 
  LayoutGrid, 
  ChefHat, 
  Receipt, 
  Check, 
  Coffee, 
  Users, 
  UtensilsCrossed, 
  Store 
} from 'lucide-react';
import Swal from 'sweetalert2';

export const MapaMesasView: React.FC = () => {
  const { 
    selectTable, 
    setActiveView, 
    mostrarCobroModal, 
    logout 
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'Todas' | 'Libres' | 'Ocupadas' | 'Atención'>('Todas');

  const handleOpenComanda = (tableId: string) => {
    selectTable(tableId);
    setActiveView('comandero');
  };

  const handleCobrar = (tableId: string) => {
    mostrarCobroModal(tableId);
  };

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#1E110A] flex flex-col justify-between font-sans selection:bg-amber-100">
      
      {/* 1. TOP HEADER (Exact Figma Match) */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[#E7DDD3] bg-[#F5EFEB] shrink-0">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          <Logo size="md" variant="badge-only" />
          <span className="font-extrabold text-[#1E110A] text-xl tracking-tight leading-none">
            ¡Hola, Café!
          </span>
        </div>

        {/* Center: Views Navigation (Only Mesas and Comandero for mesero) */}
        <div className="hidden sm:flex items-center bg-[#EDE3D8] rounded-xl p-1 gap-1 border border-[#D5C7BA]">
          <button
            className="px-3 py-1 text-xs font-bold text-[#1E110A] bg-white rounded-lg flex items-center gap-1.5 shadow-2xs"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#8B4513]" />
            <span>Mesas</span>
          </button>
          <button
            onClick={() => {
              selectTable('M02');
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
          {/* Alerta Barra red pill button */}
          <button
          onClick={() => {
              Swal.fire({
                title: 'Alerta de Barra',
                text: 'Alerta de Barra atendida correctamente.',
                icon: 'success',
                confirmButtonColor: '#7B3F00',
              });
            }}
            className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Bell className="w-3.5 h-3.5 fill-current" />
            <span>Alerta Barra</span>
          </button>

          {/* User profile pill */}
          <button 
            type="button"
            onClick={() => {
              Swal.fire({
                title: 'Mi Perfil',
                html: '<p><b>Nombre:</b> Sarai L.</p><p><b>Correo:</b> sarai@holacafe.com </p><p><b>Rol:</b> Mesero </p>',
                icon: 'info',
                confirmButtonColor:'#7B3F00', 
              });
            }}
            className="flex items-center gap-2 text-right hover:opacity-80 transition-opacity">
              <div>
                <span className="block text-xs font-bold text-[#1E110A] leading-tight">Sarai L.</span>
    <span className="block text-[10px] text-[#8C7D73] leading-tight">sarai@holacafe.com</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-[#EFE6DC] border border-[#D5C7BA] flex items-center justify-center text-[11px] font-black text-[#6E4F32]">
              SL
            </div>

          </button>
          

          {/* Cerrar sesión */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#6E5A4E] hover:text-[#1E110A] transition-colors ml-1"
          >
            <LogOut className="w-3.5 h-3.5 text-[#6E5A4E]" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>

      </header>

      {/* 2. SUBHEADER TOOLBAR & COUNTERS (Figma Match) */}
      <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 max-w-[1600px] w-full mx-auto">
        
        {/* Left: Filter selector pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFilter('Todas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeFilter === 'Todas'
                ? 'bg-[#3A1F13] text-white shadow-xs'
                : 'bg-white border border-[#D5C7BA] text-[#1E110A]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-amber-500" />
            <span>Todo el Local (9 Mesas)</span>
          </button>
        </div>

        {/* Right: Status counts pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 md:pb-0">
          {/* Libres 1 Mesa */}
          <button
            onClick={() => setActiveFilter('Libres')}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-2 ${
              activeFilter === 'Libres' ? 'ring-2 ring-stone-400 bg-white' : 'bg-white/80 border-[#D5C7BA]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#A8988D]" />
            <span className="text-[10px] text-[#8C7D73] font-bold uppercase">LIBRES</span>
            <span className="font-extrabold text-[#1E110A]">1 Mesa</span>
          </button>

          {/* Ocupadas 8 Mesas */}
          <button
            onClick={() => setActiveFilter('Ocupadas')}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-2 ${
              activeFilter === 'Ocupadas' ? 'ring-2 ring-amber-500 bg-white' : 'bg-white/80 border-[#D5C7BA]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#DF7B1B]" />
            <span className="text-[10px] text-[#8C7D73] font-bold uppercase">OCUPADAS</span>
            <span className="font-extrabold text-[#1E110A]">8 Mesas</span>
          </button>

          {/* Atención 2 Alertas (Solid Red) */}
          <button
            onClick={() => setActiveFilter('Atención')}
            className="px-3.5 py-1.5 rounded-xl bg-[#D32F2F] text-white text-xs font-extrabold flex items-center gap-2 shadow-xs hover:bg-[#B71C1C] transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span className="text-[10px] uppercase tracking-wider">ATENCIÓN</span>
            <span>2 Alertas</span>
          </button>
        </div>

      </div>

      {/* 3. SECTION SUBHEADER */}
      <div className="px-6 flex items-center justify-between max-w-[1600px] w-full mx-auto mb-3">
        <h2 className="text-lg font-black text-[#1E110A]">
          Mesas del Servicio
        </h2>
        <span className="text-xs text-[#786B63] font-medium hidden sm:block">
          Pulse sobre una mesa para abrir comanda o gestionar servicio
        </span>
      </div>

      {/* 4. MAIN TABLES GRID (4 columns x 2 rows, matching Figma exactly) */}
      <main className="flex-1 px-6 pb-8 max-w-[1600px] w-full mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* CARD M01 (Atención / Red Border) */}
          <div className="bg-white rounded-2xl border-2 border-[#D32F2F] p-4 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-black text-[#D32F2F] leading-tight">M01</h3>
                  <p className="text-xs text-[#8C7D73] mt-0.5">4 Pax</p>
                </div>
                <span className="bg-[#3A1F13] text-white text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase">
                  Atender
                </span>
              </div>

              <div className="py-6 space-y-1">
                <div 
                className="flex items-center gap-1.5 text-xs font-black text-[#1E110A]">
                  <Bell className="w-3.5 h-3.5 text-[#D32F2F]" />
                  <span>Atender</span>
                  
                </div>
                <p className="text-xs text-[#8C7D73]">
                  Mesero: <strong className="text-[#1E110A] font-semibold">Carlos R.</strong>
                </p>
              </div>
            </div>

            <button
              className="w-full py-2.5 bg-[#D32F2F] hover:bg-[#B71C1C] text-white rounded-xl text-xs font-bold shadow-xs transition-colors text-center"
            >
              Atender
            </button>
          </div>

          {/* CARD M02 (En Preparación / KDS) */}
          <div className="bg-white rounded-2xl border border-[#E5DCD3] p-4 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-black text-[#1E110A] leading-tight">M02</h3>
                  <p className="text-xs text-[#8C7D73] mt-0.5">3 Pax</p>
                </div>
                <span className="bg-[#FAF8F5] border border-[#E5DCD3] text-[#786B63] text-[10px] font-bold px-2 py-0.5 rounded-md">
                  KDS
                </span>
              </div>

              <div className="py-4 space-y-1">
                <p className="text-xs text-[#786B63] flex items-center gap-1 font-medium">
                  <ChefHat className="w-3.5 h-3.5 text-amber-600" />
                  <span>En Preparación</span>
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#1E110A]">$272.60</span>
                  <span className="text-[10px] text-[#8C7D73] font-bold">MXN</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => handleOpenComanda('M02')}
                className="py-2 px-2 bg-white hover:bg-stone-50 border border-[#D5C7BA] text-[#1E110A] rounded-xl text-xs font-bold text-center"
              >
                Ver comanda
              </button>
              <button
                onClick={() => handleCobrar('M02')}
                className="py-2 px-2 bg-[#8B4513] hover:bg-[#72380F] text-white rounded-xl text-xs font-bold text-center shadow-xs"
              >
                Cobrar
              </button>
            </div>
          </div>

          {/* CARD M03 (Limpia / Disponible) */}
          <div className="bg-[#FAF8F5] rounded-2xl border border-[#E5DCD3] p-4 flex flex-col justify-between opacity-80">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-black text-[#1E110A] leading-tight">M03</h3>
                  <p className="text-xs text-[#8C7D73] mt-0.5">Cap. 4 Pax</p>
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
                <p className="text-[11px] text-[#8C7D73]">Lista para asignar</p>
              </div>
            </div>

            <button
              onClick={() => handleOpenComanda('M03')}
              className="w-full py-2 bg-white/70 hover:bg-white text-[#8C7D73] hover:text-[#1E110A] border border-[#E5DCD3] rounded-xl text-xs font-semibold text-center transition-colors"
            >
              En espera
            </button>
          </div>

          {/* CARD M04 (Pidiendo Cuenta / Yellow Border) */}
          <div className="bg-white rounded-2xl border-2 border-[#F6C36C] p-4 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-black text-[#1E110A] leading-tight">M04</h3>
                  <p className="text-xs text-[#8C7D73] mt-0.5">2 Pax</p>
                </div>
              </div>

              <div className="py-4 space-y-1">
                <p className="text-xs text-[#DF7B1B] font-bold flex items-center gap-1">
                  <Bell className="w-3.5 h-3.5 text-[#D32F2F]" />
                  <span>Atendiendo</span>
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#1E110A]">$1,240.00</span>
                  <span className="text-[10px] text-[#8C7D73] font-bold">MXN</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => handleOpenComanda('M04')}
                className="py-2 px-2 bg-white hover:bg-stone-50 border border-[#D5C7BA] text-[#1E110A] rounded-xl text-xs font-bold text-center"
              >
                Ver comanda
              </button>
              <button
                onClick={() => handleCobrar('M04')}
                className="py-2 px-2 bg-[#8B4513] hover:bg-[#72380F] text-white rounded-xl text-xs font-bold text-center shadow-xs"
              >
                Cobrar
              </button>
            </div>
          </div>

          {/* CARD M05 (Atención / Red Border) */}
          <div className="bg-white rounded-2xl border-2 border-[#D32F2F] p-4 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-start justify-between">
                <div >
                 
                  <h3 className="text-xl font-black text-[#D32F2F] leading-tight">M05</h3>
                  <p className="text-xs text-[#8C7D73] mt-0.5">4 Pax</p>
                </div>
                <span className="bg-[#3A1F13] text-white text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase">
                  Atender
                </span>
              </div>

              <div className="py-6 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#1E110A]">
                  <Bell className="w-3.5 h-3.5 text-[#D32F2F]" />
                  <span>Atender</span>
                </div>
                <p className="text-xs text-[#8C7D73]">
                  Mesero: <strong className="text-[#1E110A] font-semibold">Carlos R.</strong>
                </p>
              </div>
            </div>

            <button
              className="w-full py-2.5 bg-[#D32F2F] hover:bg-[#B71C1C] text-white rounded-xl text-xs font-bold shadow-xs transition-colors text-center"
            >
              Atender
            </button>
          </div>

          {/* CARD M06 (Reservada) */}
          <div 
         
          className="bg-white rounded-2xl border border-[#E5DCD3] p-4 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-black text-[#1E110A] leading-tight">M06</h3>
                  <p className="text-xs text-[#8C7D73] mt-0.5">Reservada</p>
                </div>
                <span className="bg-[#FAF8F5] border border-[#E5DCD3] text-[#786B63] text-[10px] font-bold px-2 py-0.5 rounded-md">
                  20:30 hrs
                </span>
              </div>

              <div className="py-5 space-y-1">
                <p className="text-xs font-bold text-[#1E110A] flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#8B4513]" />
                  <span>RESERVADA</span>
                </p>
                <p className="text-[11px] text-[#8C7D73] font-medium">Familia Morales (6 Pax)</p>
              </div>
            </div>

            <button
            onClick={() => {
              Swal.fire({
                title: 'Detalles',
                html: '<p><b>Detalle de Reserva:</b> Familia Morales</p><p><b>Fecha:</b> Hoy · 20:30 hrs </p><p><b>Lugares:</b> 6 </p>',
                icon: 'info',
                confirmButtonColor: '#7B3F00',
              });
            }}
              className="w-full py-2 bg-white hover:bg-stone-50 border border-[#D5C7BA] text-[#1E110A] rounded-xl text-xs font-bold text-center"
            >
              Detalle Reserva
            </button>
          </div>

          {/* CARD M07 (Disponible / Libre) */}
          <div className="bg-[#FAF8F5] rounded-2xl border border-[#E5DCD3] p-4 flex flex-col justify-between opacity-80">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-black text-[#1E110A] leading-tight">M07</h3>
                  <p className="text-xs text-[#8C7D73] mt-0.5">1 Pax</p>
                </div>
              </div>

              <div className="py-6 space-y-1">
                <p className="text-xs font-bold text-[#1E110A] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Disponible / Libre</span>
                </p>
                <p className="text-[11px] text-[#8C7D73]">Mesa libre</p>
              </div>
            </div>

            <button
              onClick={() => handleOpenComanda('M07')}
              className="w-full py-2 bg-white/70 hover:bg-white text-[#8C7D73] hover:text-[#1E110A] border border-[#E5DCD3] rounded-xl text-xs font-semibold text-center transition-colors"
            >
              Mesa libre
            </button>
          </div>

          {/* CARD M08 (En Consumo) */}
          <div className="bg-white rounded-2xl border border-[#E5DCD3] p-4 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-black text-[#1E110A] leading-tight">M08</h3>
                  <p className="text-xs text-[#8C7D73] mt-0.5">1 Pax</p>
                </div>
              </div>

              <div className="py-4 space-y-1">
                <p className="text-xs text-[#786B63] flex items-center gap-1 font-medium">
                  <Coffee className="w-3.5 h-3.5 text-[#8B4513]" />
                  <span>En Consumo</span>
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#1E110A]">$145.00</span>
                  <span className="text-[10px] text-[#8C7D73] font-bold">MXN</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => handleOpenComanda('M08')}
                className="py-2 px-2 bg-white hover:bg-stone-50 border border-[#D5C7BA] text-[#1E110A] rounded-xl text-xs font-bold text-center"
              >
                Ver comanda
              </button>
              <button
                onClick={() => handleCobrar('M08')}
                className="py-2 px-2 bg-[#8B4513] hover:bg-[#72380F] text-white rounded-xl text-xs font-bold text-center shadow-xs"
              >
                Cobrar
              </button>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
};
