import React from 'react';
import Swal from 'sweetalert2';
import { ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import adminAvatarImg from '../img/admin-avatar.jpg';

interface UsuarioPerfilNavbarProps {
  variante?: 'clara' | 'oscura';
}

export const UsuarioPerfilNavbar: React.FC<UsuarioPerfilNavbarProps> = ({ variante = 'clara' }) => {
  const { currentUser } = useApp();

  const nombre = currentUser?.name || 'Usuario';
  const correo = currentUser?.username
    ? currentUser.username.includes('@')
      ? currentUser.username
      : `${currentUser.username}@holacafe.com`
    : 'usuario@holacafe.com';
  const rol = currentUser?.role || 'Mesero';
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

  const abrirPerfil = () => {
    Swal.fire({
      title: 'Mi Perfil',
      html: `<p><b>Nombre:</b> ${nombre}</p><p><b>Correo:</b> ${correo}</p><p><b>Rol:</b> ${rol}</p>`,
      icon: 'info',
      confirmButtonColor: '#7B3F00',
    });
  };

  if (variante === 'oscura') {
    return (
      <button
        type="button"
        onClick={abrirPerfil}
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
        <ChevronDown className="w-3 h-3 text-white/70" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={abrirPerfil}
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
      <ChevronDown className="w-3.5 h-3.5 text-[#8C7D73] hidden sm:block" />
    </button>
  );
};
