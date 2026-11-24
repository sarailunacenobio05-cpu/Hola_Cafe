import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  Mail,
  ShieldCheck,
  Clock,
  CheckCircle2,
  LogOut,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import adminAvatarImg from '../img/admin-avatar.jpg';

interface UsuarioPerfilNavbarProps {
  variante?: 'clara' | 'oscura';
}

export const UsuarioPerfilNavbar: React.FC<UsuarioPerfilNavbarProps> = ({ variante = 'clara' }) => {
  const { currentUser, logout } = useApp();
  const [abierto, setAbierto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const nombre = currentUser?.name || 'Usuario';
  const correo = currentUser?.username
    ? currentUser.username.includes('@')
      ? currentUser.username
      : `${currentUser.username}@holacafe.com`
    : 'usuario@holacafe.com';
  const rol = currentUser?.role || 'Mesero';
  const turno = currentUser?.shift || 'Turno completo';
  const estado = currentUser?.status || 'ACTIVO';
  const iniciales =
    currentUser?.initials ||
    nombre
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  const avatarUrl =
    currentUser?.avatar || (rol === 'Administrador' ? adminAvatarImg : undefined);

  const rolBadgeColor =
    rol === 'Administrador'
      ? 'bg-[#DF7B1B]/20 text-[#FFB86C] border-[#DF7B1B]/40'
      : rol === 'Cocinero'
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
        : 'bg-amber-400/20 text-amber-200 border-amber-300/30';

  const descripcionAcceso =
    rol === 'Administrador'
      ? 'Acceso total · Caja, menú, usuarios y dispositivos'
      : rol === 'Cocinero'
        ? 'Pantalla de producción KDS'
        : 'Comandero, mesas y atención de alertas';

  useEffect(() => {
    if (!abierto) return;

    const handleClickFuera = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setAbierto(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAbierto(false);
      }
    };

    document.addEventListener('mousedown', handleClickFuera);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickFuera);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [abierto]);

  const panelPerfil = abierto && (
    <div className="absolute right-0 mt-2.5 w-80 bg-white rounded-2xl border border-[#E5DCD3] shadow-2xl z-50 overflow-hidden text-left text-[#1E110A]">
      {/* Encabezado oscuro estilo ¡Hola, Café! */}
      <div className="relative px-5 py-4 bg-gradient-to-br from-[#231815] to-[#3B251B] text-white">
        <button
          type="button"
          onClick={() => setAbierto(false)}
          aria-label="Cerrar panel de perfil"
          className="absolute top-3 right-3 p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 pr-6">
          <div className="relative shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={nombre}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#DF7B1B]/70 shadow-sm"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#523323] text-amber-200 font-black text-sm flex items-center justify-center border-2 border-[#DF7B1B]/70">
                {iniciales}
              </div>
            )}
            <span
              className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#231815]"
              title="En línea"
            />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-black text-white truncate">{nombre}</p>
            <span
              className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${rolBadgeColor}`}
            >
              <ShieldCheck className="w-3 h-3" />
              {rol}
            </span>
          </div>
        </div>
      </div>

      {/* Datos del perfil */}
      <div className="p-4 space-y-2.5 bg-[#FAF8F5]">
        <div className="bg-white rounded-xl border border-[#EAE0D7] p-3 space-y-2.5 text-xs">
          <div className="flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-[#DF7B1B] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#8C7D73]">
                Correo electrónico
              </span>
              <span className="font-semibold text-[#1E110A] break-all">{correo}</span>
            </div>
          </div>

          <div className="border-t border-[#F5EFEB] pt-2.5 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#DF7B1B] shrink-0 mt-0.5" />
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#8C7D73]">
                Permisos
              </span>
              <span className="font-medium text-[#5C4E45]">{descripcionAcceso}</span>
            </div>
          </div>

          <div className="border-t border-[#F5EFEB] pt-2.5 grid grid-cols-2 gap-2">
            <div className="flex items-start gap-2">
              <Clock className="w-3.5 h-3.5 text-[#8C7D73] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#8C7D73]">
                  Turno
                </span>
                <span className="font-semibold text-[#1E110A] text-[11px]">{turno}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#8C7D73]">
                  Estado
                </span>
                <span className="font-bold text-emerald-700 text-[11px]">{estado}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <button
          type="button"
          onClick={() => {
            setAbierto(false);
            logout();
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-red-50 border border-[#E5DCD3] hover:border-red-200 text-red-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );

  if (variante === 'oscura') {
    return (
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          className="kds-profile hover:opacity-85 transition-opacity text-left"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={nombre}
              className="w-8 h-8 rounded-full object-cover border border-amber-400/30"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#523323] text-amber-300 font-bold text-xs flex items-center justify-center border border-amber-400/30">
              {iniciales}
            </div>
          )}
          <span className="kds-profile-copy">
            <strong>{nombre}</strong>
            <small>{correo}</small>
          </span>
          <ChevronDown
            className={`w-3 h-3 text-white/70 transition-transform ${abierto ? 'rotate-180' : ''}`}
          />
        </button>
        {panelPerfil}
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="flex items-center gap-2.5 text-left hover:opacity-80 transition-opacity"
      >
        {avatarUrl ? (
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#D5C7BA] bg-[#231815] shrink-0">
            <img src={avatarUrl} alt={nombre} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#EFE6DC] border border-[#D5C7BA] flex items-center justify-center text-[11px] font-black text-[#6E4F32] shrink-0">
            {iniciales}
          </div>
        )}
        <div className="hidden sm:block">
          <p className="text-xs font-bold text-[#1E110A] leading-tight">{nombre}</p>
          <p className="text-[10px] text-[#8C7D73] leading-tight">{correo}</p>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#8C7D73] hidden sm:block transition-transform ${abierto ? 'rotate-180' : ''}`}
        />
      </button>
      {panelPerfil}
    </div>
  );
};
