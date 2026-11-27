import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useApp } from '../context/AppContext';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminNotificacionesBell } from '../components/AdminNotificacionesBell';
import { UsuarioPerfilNavbar } from '../components/UsuarioPerfilNavbar';
import {
  Search,
  Plus,
  Trash2,
  Pencil,
  Mail,
  CalendarDays
} from 'lucide-react';
import { Blobatar } from '@blobatar/react';
import { User } from '../types';

export const ConfiguracionUsuariosView: React.FC = () => {
  const {
    users,
    currentUser,
    mostrarAddUserModal,
    mostrarConfirmBajaModal,
    actualizarRolUsuario
  } = useApp();

  const [search, setSearch] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const filasPorPagina = 5;

  const activosCount = users.filter(u => u.status === 'ACTIVO').length;

  const filteredUsers = users.filter(user => {
    const q = search.toLowerCase();
    return (
      user.name.toLowerCase().includes(q) ||
      user.username.toLowerCase().includes(q) ||
      user.role.toLowerCase().includes(q)
    );
  });

  const handleEditarRol = async (user: User) => {
    const res = await Swal.fire({
      title: 'Cambiar rol de usuario',
      html: `<p style="font-size:13px;color:#5C4E45;margin-bottom:8px;">Selecciona el nuevo rol para <strong>${user.name}</strong> (${user.username}).</p>`,
      input: 'select',
      inputOptions: {
        Administrador: 'Administrador',
        Mesero: 'Mesero',
        Cocinero: 'Cocinero',
      },
      inputValue: user.role,
      showCancelButton: true,
      confirmButtonText: 'Guardar rol',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#DF7B1B',
      cancelButtonColor: '#786B63',
      reverseButtons: true,
      background: '#FFFFFF',
      color: '#1E110A',
      customClass: {
        popup: 'rounded-2xl shadow-xl border border-[#EFE6DA]',
        title: 'text-[#1E110A] font-extrabold text-xl',
        confirmButton: 'rounded-xl px-5 py-2.5 font-bold',
        cancelButton: 'rounded-xl px-5 py-2.5 font-bold',
      },
    });

    if (res.isConfirmed && res.value && res.value !== user.role) {
      await actualizarRolUsuario(user.id, res.value as User['role']);
    }
  };

  const getRoleBadgeClass = (role: User['role']) => {
    if (role === 'Administrador') return 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]';
    if (role === 'Cocinero') return 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]';
    return 'bg-[#E6F7F0] text-[#059669] border-[#A7F3D0]';
  };

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
                    <th className="py-3.5 px-6">MÉTODO DE ACCESO</th>
                    <th className="py-3.5 px-6">FECHA DE REGISTRO</th>
                    <th className="py-3.5 px-6">ROL EN EL SISTEMA</th>
                    <th className="py-3.5 px-6 text-right">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5EFEB] font-medium text-[#1E110A]">
                  {elementosPaginados.map(user => {
                    const esSesionActual =
                      currentUser?.id === user.id || currentUser?.username === user.username;
                    const esGoogle = user.authMethod === 'Google';
                    return (
                      <tr key={user.id} className="hover:bg-amber-50/20 transition-colors">
                        <td className="py-4 px-6 flex items-center gap-3">
                          <Blobatar
                            name={user.username || user.name}
                            size={34}
                            className="w-8 h-8 rounded-full border border-[#D5C7BA] shrink-0"
                          />
                          <p className="font-bold text-[#1E110A] text-xs">{user.name}</p>
                        </td>
                        <td className="py-4 px-6 font-mono text-[#6E5A4E]">
                          {user.username}
                        </td>
                        <td className="py-4 px-6">
                          {esGoogle ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#D5C7BA] text-[11px] font-bold text-[#1E110A] shadow-2xs">
                              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                              </svg>
                              <span>Google</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E5DCD3] text-[11px] font-bold text-[#6E5A4E]">
                              <Mail className="w-3.5 h-3.5 text-[#8B4513]" />
                              <span>Correo</span>
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-[#6E5A4E]">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                            <CalendarDays className="w-3.5 h-3.5 text-[#A8988D]" />
                            <span>{user.registeredAt || '—'}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="inline-flex items-center gap-2">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-lg border text-[11px] font-extrabold tracking-wide ${getRoleBadgeClass(user.role)}`}
                            >
                              {user.role}
                            </span>
                            {!esSesionActual && (
                              <button
                                type="button"
                                onClick={() => handleEditarRol(user)}
                                title={`Cambiar rol de ${user.name}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-amber-50 border border-[#D5C7BA] hover:border-[#DF7B1B] text-[#6E5A4E] hover:text-[#B45309] text-[11px] font-bold transition-colors"
                              >
                                <Pencil className="w-3 h-3" />
                                <span>Editar</span>
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {esSesionActual ? (
                            <span
                              className="inline-flex items-center px-3 py-1.5 bg-[#FAF8F5] border border-[#E5DCD3] text-[#8C7D73] rounded-xl text-[11px] font-semibold"
                              title="No puedes eliminar ni cambiar el rol de tu propia cuenta activa"
                            >
                              Actual
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => mostrarConfirmBajaModal(user)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF5F5] border border-[#FECACA] hover:bg-[#FEE2E2] text-[#DC2626] rounded-xl text-xs font-semibold shadow-2xs transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Eliminar</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
