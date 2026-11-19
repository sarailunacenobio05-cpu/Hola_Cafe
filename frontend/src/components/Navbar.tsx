import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { 
  Bell, 
  LogOut, 
  LayoutGrid, 
  UtensilsCrossed, 
  ChefHat, 
  SlidersHorizontal,
  ChevronDown,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface NavbarProps {
  sectionTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ sectionTitle }) => {
  const { 
    currentUser, 
    activeView, 
    setActiveView, 
    logout, 
    tables, 
    barAlerts, 
    descartarAlertaBarra,
    selectTable
  } = useApp();

  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Status counts
  const libresCount = tables.filter(t => t.status === 'Limpia / Disponible' || t.status === 'Reservada').length;
  const ocupadasCount = tables.filter(t => t.status !== 'Limpia / Disponible' && t.status !== 'Reservada').length;
  const atencionCount = tables.filter(t => t.hasAlert || t.status === 'Pidiendo Cuenta').length;

  return (
    <header className="bg-white border-b border-[#EAE3DB] sticky top-0 z-40 px-4 lg:px-6 py-2.5 shadow-sm transition-all">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Logo & Section Pill */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveView('mapa-mesas')} 
            className="flex items-center hover:opacity-95 transition-opacity text-left"
          >
            <Logo size="sm" />
          </button>

          {sectionTitle && (
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-stone-200">
              <span className="text-[11px] font-bold tracking-wider text-amber-900 bg-amber-50 border border-amber-200/80 uppercase px-2.5 py-1 rounded-md">
                {sectionTitle}
              </span>
            </div>
          )}
        </div>

        {/* Center: Operational View Navigation Bar */}
        <div className="hidden lg:flex items-center bg-[#F5EFEB] p-1 rounded-xl border border-[#E7DDD3] gap-1">
          <button
            onClick={() => setActiveView('mapa-mesas')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'mapa-mesas' 
                ? 'bg-white text-[#2C1810] shadow-sm font-bold' 
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-amber-600" />
            Mapa de Mesas
          </button>

          <button
            onClick={() => {
              selectTable('M04');
              setActiveView('comandero');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'comandero' 
                ? 'bg-white text-[#2C1810] shadow-sm font-bold' 
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600" />
            Comandero Táctil
          </button>

          <button
            onClick={() => setActiveView('cocina')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'cocina' 
                ? 'bg-white text-[#2C1810] shadow-sm font-bold' 
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5 text-amber-600" />
            Cocina (KDS)
          </button>

          <button
            onClick={() => setActiveView('caja')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              ['caja', 'config-menu', 'config-usuarios', 'botones-aviso'].includes(activeView)
                ? 'bg-[#3A1F13] text-white shadow-sm font-bold' 
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            Admin & Caja
          </button>
        </div>

        {/* Right: Metrics, Alerts & User Profile */}
        <div className="flex items-center gap-3">
          {/* Table Metrics summary (visible on md+) */}
          <div className="hidden xl:flex items-center gap-2 text-xs font-medium">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Libres: <strong className="font-bold">{libresCount}</strong>
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Ocupadas: <strong className="font-bold">{ocupadasCount}</strong>
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Atención: <strong className="font-bold">{atencionCount}</strong>
            </span>
          </div>

          {/* Alerta Barra button */}
          <div className="relative">
            <button
              onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                barAlerts.length > 0 
                  ? 'bg-rose-600 text-white border-rose-700 shadow-sm hover:bg-rose-700 animate-pulse' 
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Alerta Barra</span>
              {barAlerts.length > 0 && (
                <span className="bg-white text-rose-700 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {barAlerts.length}
                </span>
              )}
            </button>

            {/* Dropdown for Alerts */}
            {showAlertsDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-stone-200 p-3 z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Alertas activas</h4>
                  <span className="text-[11px] text-stone-500">{barAlerts.length} pendientes</span>
                </div>
                {barAlerts.length === 0 ? (
                  <p className="text-xs text-stone-500 py-4 text-center">No hay alertas en barra en este momento.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {barAlerts.map(alert => (
                      <div key={alert.id} className="p-2.5 rounded-lg bg-rose-50 border border-rose-100 flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-rose-900">{alert.message}</p>
                          <span className="text-[10px] text-rose-600 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> {alert.time}
                          </span>
                        </div>
                        <button
                          onClick={() => descartarAlertaBarra(alert.id)}
                          className="text-[11px] text-rose-700 hover:text-rose-950 font-bold bg-white px-2 py-0.5 rounded border border-rose-200 shadow-xs"
                        >
                          Atender
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-full bg-[#F5EFEB] hover:bg-[#EAE1D7] border border-[#E7DDD3] transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center overflow-hidden">
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser?.initials || 'DM'
                )}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-[#2C1810] leading-none">{currentUser?.name || 'Invitado'}</p>
                <p className="text-[10px] text-stone-500 mt-0.5 leading-none">{currentUser?.role || 'Mesero activo'}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-stone-500" />
            </button>

            {/* User Dropdown */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-200 p-2 z-50">
                <div className="px-3 py-2 border-b border-stone-100">
                  <p className="text-xs font-bold text-stone-900">{currentUser?.name}</p>
                  <p className="text-[11px] text-stone-500">{currentUser?.username}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                    {currentUser?.role}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setActiveView('mapa-mesas');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-stone-700 hover:bg-amber-50 rounded-lg flex items-center gap-2"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-amber-600" />
                    Mapa de Mesas
                  </button>
                  <button
                    onClick={() => {
                      setActiveView('cocina');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-stone-700 hover:bg-amber-50 rounded-lg flex items-center gap-2"
                  >
                    <ChefHat className="w-3.5 h-3.5 text-amber-600" />
                    Pantalla de Cocina
                  </button>
                  <button
                    onClick={() => {
                      setActiveView('caja');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-stone-700 hover:bg-amber-50 rounded-lg flex items-center gap-2"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
                    Panel Administrativo
                  </button>
                </div>

                <div className="border-t border-stone-100 pt-1 mt-1">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Logout Button */}
          <button
            onClick={logout}
            title="Cerrar sesión"
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>

        </div>
      </div>
    </header>
  );
};
