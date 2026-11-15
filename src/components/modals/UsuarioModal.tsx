import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Key } from 'lucide-react';

export const UsuarioModal: React.FC = () => {
  const { isUsuarioModalOpen, closeAddUserModal, saveUser } = useApp();

  const [name, setName] = useState('Fernanda Ruiz');
  const [shift, setShift] = useState<'Turno matutino' | 'Turno vespertino' | 'Turno completo'>('Turno vespertino');
  const [username, setUsername] = useState('fruiz');
  const [role, setRole] = useState<'Mesero' | 'Administrador' | 'Cocinero'>('Mesero');
  const [password, setPassword] = useState('Cafe2026!');
  const [confirmPassword, setConfirmPassword] = useState('Cafe2026!');
  const [forceChange, setForceChange] = useState(true);

  if (!isUsuarioModalOpen) return null;

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
    setConfirmPassword(res);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    saveUser({
      name,
      shift,
      username,
      role
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-stone-900 text-base">Alta de mesero</h3>
            <p className="text-xs text-stone-500">Registra al mesero y asigna sus credenciales de acceso</p>
          </div>
          <button
            onClick={closeAddUserModal}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          
          {/* Section 1 */}
          <div>
            <h4 className="font-extrabold text-[10px] text-stone-400 uppercase tracking-wider mb-2">
              Datos del mesero
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nombre completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    const parts = e.target.value.toLowerCase().split(' ');
                    if (parts.length >= 2) {
                      setUsername(`${parts[0][0]}${parts[1]}`);
                    }
                  }}
                  required
                  placeholder="Fernanda Ruiz"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Turno</label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none font-medium text-stone-800"
                >
                  <option value="Turno matutino">Turno matutino</option>
                  <option value="Turno vespertino">Turno vespertino</option>
                  <option value="Turno completo">Turno completo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="pt-2 border-t border-stone-100">
            <h4 className="font-extrabold text-[10px] text-stone-400 uppercase tracking-wider mb-2">
              Credenciales de acceso
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Usuario</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="fruiz"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium font-mono"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  Con este usuario inicia sesión. Debe ser único.
                </span>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Rol</label>
                <input
                  type="text"
                  value={role}
                  disabled
                  className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-stone-600 font-bold cursor-not-allowed"
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-stone-700">Contraseña</label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-800"
                  >
                    Generar
                  </button>
                </div>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-mono text-stone-800"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">Mínimo 8 caracteres.</span>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Confirmar contraseña</label>
                <input
                  type="text"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-mono text-stone-800"
                />
              </div>
            </div>
          </div>

          {/* Toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={forceChange}
                onChange={(e) => setForceChange(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <span className="text-xs font-semibold text-stone-700">
                Pedir cambio de contraseña en el primer inicio de sesión
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeAddUserModal}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#D97706] hover:bg-[#B45309] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-98"
            >
              Dar de alta
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
