import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveView } from '../types';
import { Logo } from './Logo';
import { 
  Radio, 
  Store, 
  Users, 
  Settings, 
  LogOut,
  ReceiptText
} from 'lucide-react';

interface AdminSidebarProps {
  currentSubTitle?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentSubTitle }) => {
  const { activeView, setActiveView, logout } = useApp();

  const navItems: { view: ActiveView; label: string; icon: React.ReactNode }[] = [
    {
      view: 'botones-aviso',
      label: 'Botones de Aviso',
      icon: <Radio className="w-4 h-4" />
    },
    {
      view: 'caja',
      label: 'Caja',
      icon: <Store className="w-4 h-4" />
    },
    {
      view: 'revision-tickets',
      label: 'Revisión de tickets',
      icon: <ReceiptText className="w-4 h-4" />
    },
    {
      view: 'config-usuarios',
      label: 'Usuarios',
      icon: <Users className="w-4 h-4" />
    },
    {
      view: 'config-menu',
      label: 'Configuración menú',
      icon: <Settings className="w-4 h-4" />
    }
  ];

  const getSubTitleText = () => {
    if (currentSubTitle) return currentSubTitle;
    switch (activeView) {
      case 'botones-aviso': return 'BOTONES DE AVISO';
      case 'caja': return 'CAJA';
      case 'revision-tickets': return 'REVISIÓN DE TICKETS';
      case 'config-usuarios': return 'USUARIOS';
      case 'config-menu': return 'MENÚ';
      default: return 'CAJA';
    }
  };

  return (
    <aside className="w-64 bg-[#2C1810] text-[#EFE6DC] flex flex-col justify-between shrink-0 min-h-screen border-r border-[#1E110A]">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-[#3D251A] flex items-center gap-3">
          <Logo size="sm" variant="badge-only" />
          <div className="flex flex-col">
            <h1 className="font-extrabold text-white text-base tracking-tight leading-tight">
              ¡Hola, Café!
            </h1>
            <span className="text-[10px] font-black tracking-widest text-[#DF7B1B] uppercase block mt-0.5">
              {getSubTitleText()}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map(item => {
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setActiveView(item.view)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#7B3F00] text-white shadow-xs'
                    : 'text-[#A8988D] hover:text-white hover:bg-[#3D251A]'
                }`}
              >
                <span className={isActive ? 'text-amber-400' : 'text-[#8C7D73]'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-[#3D251A]">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-[#A8988D] hover:text-white rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4 text-[#A8988D]" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
