import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminNotificacionesBell } from '../components/AdminNotificacionesBell';
import { UsuarioPerfilNavbar } from '../components/UsuarioPerfilNavbar';
import {
  Search,
  Plus,
  Trash2
} from 'lucide-react';
import { Blobatar } from '@blobatar/react';

export const ConfiguracionUsuariosView: React.FC = () => {
  const {
    users,
    currentUser,
    mostrarAddUserModal,
    mostrarConfirmBajaModal
  } = useApp();

  const [search, setSearch] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const filasPorPagina = 5;

  const activosCount = users.filter(u => u.status === 'ACTIVO').length;

  const filteredUsers = users.filter(user => {
    return (
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalPaginas = Math.ceil(filteredUsers.length / filasPorPagina) || 1;
  const elementosPaginados = filteredUsers.slice(
    (paginaActual - 1) * filasPorPagina,
    paginaActual * filasPorPagina
  );

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
            <AdminNotificacionesBell />
            <UsuarioPerfilNavbar />
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
                Administra las cuentas del personal y asigna sus credenciales para ingresar al sistema.
              </p>
            </div>

            {/* Metrics Box */}
            <div className="inline-flex items-center bg-white border border-[#E5DCD3] rounded-2xl overflow-hidden self-start md:self-auto shadow-2xs divide-x divide-[#E5DCD3]">
              <div className="px-5 py-3 text-center min-w-[120px]">
                <span className="block text-[11px] font-semibold text-[#8C7D73]">Usuarios activos</span>
                <span className="text-xl sm:text-2xl font-black text-[#1E110A] leading-tight">{activosCount}</span>
              </div>
              <div className="px-5 py-3 text-center min-w-[120px]">
                <span className="block text-[11px] font-semibold text-[#8C7D73]">Total de usuarios</span>
                <span className="text-xl sm:text-2xl font-black text-[#1E110A] leading-tight">{users.length}</span>
              </div>
            </div>
          </div>

          {/* Search Bar and Add User button */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5DCD3] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7D73]" />
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPaginaActual(1); }}
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#D5C7BA] rounded-xl text-xs font-semibold text-[#1E110A] focus:outline-none"
              />
            </div>

            {/* Añadir usuario */}
            <button
              onClick={mostrarAddUserModal}
              className="w-full md:w-auto px-5 py-2.5 bg-[#DF7B1B] hover:bg-[#C96910] text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir usuario</span>
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-[#E5DCD3] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#F5EFEB] flex items-center justify-between">
              <h2 className="text-base font-black text-[#1E110A]">Usuarios registrados</h2>
              <span className="text-xs font-bold text-[#8C7D73] bg-[#FAF8F5] border border-[#E5DCD3] px-3 py-1 rounded-lg">
                {filteredUsers.length} usuarios
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-[#8C7D73] font-bold border-b border-[#E5DCD3] uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-6">USUARIO</th>
                    <th className="py-3.5 px-6">CORREO ELECTRÓNICO</th>
                    <th className="py-3.5 px-6">CONTRASEÑA</th>
                    <th className="py-3.5 px-6">ÚLTIMO ACCESO</th>
                    <th className="py-3.5 px-6">ESTADO</th>
                    <th className="py-3.5 px-6 text-right">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5EFEB] font-medium text-[#1E110A]">
                  {elementosPaginados.map(user => (
                    <tr key={user.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <Blobatar
                          name={user.username || user.name}
                          size={34}
                          className="w-8 h-8 rounded-full border border-[#D5C7BA] shrink-0"
                        />
                        <div>
                          <p className="font-bold text-[#1E110A] text-xs">{user.name}</p>
                          <span className="text-[10px] text-[#8C7D73] font-semibold">{user.role}</span>
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
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${user.status === 'ACTIVO'
                            ? 'bg-[#E6F7F0] text-[#059669]'
                            : 'bg-[#FFF1F1] text-[#DC2626]'
                          }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {currentUser?.id === user.id || currentUser?.username === user.username ? (
                          <span
                            className="inline-flex items-center px-3 py-1.5 bg-[#FAF8F5] border border-[#E5DCD3] text-[#8C7D73] rounded-xl text-[11px] font-semibold"
                            title="No puedes eliminar tu propia cuenta activa"
                          >
                            Sesión actual
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => mostrarConfirmBajaModal(user)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF5F5] border border-[#FECACA] hover:bg-[#FEE2E2] text-[#DC2626] rounded-xl text-xs font-semibold shadow-2xs transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar cuenta</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-[#FAF8F5] border-t border-[#E5DCD3] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#8C7D73]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#DF7B1B]" />
                <span>Eliminar una cuenta la remueve permanentemente del sistema. Tu propia cuenta activa está protegida.</span>
              </div>
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
