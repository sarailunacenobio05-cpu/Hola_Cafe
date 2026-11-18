import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AdminSidebar } from '../components/AdminSidebar';
import adminAvatarImg from '../img/admin-avatar.jpg';
import { 
  Search, 
  Plus, 
  ChevronRight, 
  ChevronDown,
  UserX,
  RotateCcw,
  Bell
} from 'lucide-react';
import { User } from '../types';

export const ConfiguracionUsuariosView: React.FC = () => {
  const { 
    users, 
    openAddUserModal, 
    openConfirmBajaModal, 
    reactivateUser,
    setActiveView 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'Todos' | 'Activos' | 'Baja'>('Todos');
  const [search, setSearch] = useState('');

  // Counts
  const activosCount = users.filter(u => u.status === 'ACTIVO').length;
  const bajasCount = users.filter(u => u.status === 'BAJA').length;

  // Filtered
  const filteredUsers = users.filter(user => {
    const matchesTab = 
      activeTab === 'Todos' || 
      (activeTab === 'Activos' && user.status === 'ACTIVO') || 
      (activeTab === 'Baja' && user.status === 'BAJA');
    const matchesSearch = 
      user.name.toLowerCase().includes(search.toLowerCase()) || 
      user.username.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#1E110A] flex flex-row font-sans selection:bg-amber-100">
      
      {/* 1. SIDEBAR */}
      <AdminSidebar currentSubTitle="USUARIOS" />

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header */}
        <header className="bg-white border-b border-[#E7DDD3] px-8 py-3.5 flex items-center justify-between shrink-0">
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#8C7D73] font-medium">Panel Principal</span>
              <span className="text-[#A8988D] font-bold">›</span>
              <span className="text-[#1E110A] font-bold">Configuración de usuarios</span>
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
          
          {/* Header Title + Stats */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-[#1E110A] tracking-tight">
                Configuración de usuarios
              </h1>
              <p className="text-xs sm:text-sm text-[#786B63] mt-1 font-medium">
                Da de alta o de baja a los meseros y asígnales las credenciales para ingresar al sistema.
              </p>
            </div>

            {/* 3 Metrics Grouped Box (Meseros activos 5 | Dados de baja 1 | Total de usuarios 6) */}
            <div className="inline-flex items-center bg-white border border-[#E5DCD3] rounded-2xl overflow-hidden self-start md:self-auto shadow-2xs divide-x divide-[#E5DCD3]">
              <div className="px-5 py-3 text-center min-w-[110px]">
                <span className="block text-[11px] font-semibold text-[#8C7D73]">Meseros activos</span>
                <span className="text-xl sm:text-2xl font-black text-[#1E110A] leading-tight">{activosCount}</span>
              </div>
              <div className="px-5 py-3 text-center min-w-[110px]">
                <span className="block text-[11px] font-semibold text-[#8C7D73]">Dados de baja</span>
                <span className="text-xl sm:text-2xl font-black text-[#DC2626] leading-tight">{bajasCount}</span>
              </div>
              <div className="px-5 py-3 text-center min-w-[110px]">
                <span className="block text-[11px] font-semibold text-[#8C7D73]">Total de usuarios</span>
                <span className="text-xl sm:text-2xl font-black text-[#1E110A] leading-tight">{users.length}</span>
              </div>
            </div>
          </div>

          {/* Filter Bar with Tabs and Add Waiter button */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5DCD3] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
              {/* Tabs */}
              <div className="flex items-center bg-[#FAF8F5] p-1 rounded-xl border border-[#E5DCD3]">
                <button
                  onClick={() => setActiveTab('Todos')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'Todos' ? 'bg-[#DF7B1B] text-white shadow-xs' : 'text-[#6E5A4E] hover:text-[#1E110A]'
                  }`}
                >
                  Todos ({users.length})
                </button>
                <button
                  onClick={() => setActiveTab('Activos')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'Activos' ? 'bg-[#DF7B1B] text-white shadow-xs' : 'text-[#6E5A4E] hover:text-[#1E110A]'
                  }`}
                >
                  Activos ({activosCount})
                </button>
                <button
                  onClick={() => setActiveTab('Baja')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'Baja' ? 'bg-[#DF7B1B] text-white shadow-xs' : 'text-[#6E5A4E] hover:text-[#1E110A]'
                  }`}
                >
                  Baja ({bajasCount})
                </button>
              </div>

              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7D73]" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o usuario..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#D5C7BA] rounded-xl text-xs font-semibold text-[#1E110A] focus:outline-none"
                />
              </div>
            </div>

            {/* Nuevo mesero */}
            <button
              onClick={openAddUserModal}
              className="w-full md:w-auto px-5 py-2.5 bg-[#DF7B1B] hover:bg-[#C96910] text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo mesero</span>
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-[#E5DCD3] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#F5EFEB] flex items-center justify-between">
              <h2 className="text-base font-black text-[#1E110A]">Meseros registrados</h2>
              <span className="text-xs font-bold text-[#8C7D73] bg-[#FAF8F5] border border-[#E5DCD3] px-3 py-1 rounded-lg">
                {filteredUsers.length} usuarios
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-[#8C7D73] font-bold border-b border-[#E5DCD3] uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-6">MESERO</th>
                    <th className="py-3.5 px-6">USUARIO</th>
                    <th className="py-3.5 px-6">CONTRASEÑA</th>
                    <th className="py-3.5 px-6">ÚLTIMO ACCESO</th>
                    <th className="py-3.5 px-6">ESTADO</th>
                    <th className="py-3.5 px-6 text-right">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5EFEB] font-medium text-[#1E110A]">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EFE6DC] border border-[#D5C7BA] flex items-center justify-center text-xs font-black text-[#6E4F32]">
                          {user.initials}
                        </div>
                        <div>
                          <p className="font-bold text-[#1E110A] text-xs">{user.name}</p>
                          <p className="text-[11px] text-[#8C7D73] mt-0.5">{user.shift}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-[#6E5A4E]">
                        {user.username}
                      </td>
                      <td className="py-4 px-6 text-[#A8988D] tracking-widest text-sm">
                        ••••••••
                      </td>
                      <td className="py-4 px-6 text-[#6E5A4E]">
                        {user.lastAccess}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          user.status === 'ACTIVO'
                            ? 'bg-[#E6F7F0] text-[#059669]'
                            : 'bg-[#FFF1F1] text-[#DC2626]'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {user.status === 'ACTIVO' ? (
                          <button
                            onClick={() => openConfirmBajaModal(user)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF5F5] border border-[#FECACA] hover:bg-[#FEE2E2] text-[#DC2626] rounded-xl text-xs font-semibold shadow-2xs transition-all"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Dar de baja</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => reactivateUser(user.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#e59819] hover:bg-[#d98d12] text-white rounded-xl text-xs font-semibold shadow-2xs transition-all"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reactivar</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Notice Footer */}
            <div className="p-4 bg-[#FAF8F5] border-t border-[#E5DCD3] flex items-center gap-2 text-xs text-[#8C7D73]">
              <span className="w-2 h-2 rounded-full bg-[#DF7B1B]" />
              <span>Dar de baja a un mesero bloquea su acceso, pero conserva su historial de comandas y tickets.</span>
            </div>

          </div>

        </main>
      </div>

    </div>
  );
};
