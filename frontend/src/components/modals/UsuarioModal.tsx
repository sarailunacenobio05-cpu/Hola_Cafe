import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, AlertCircle } from 'lucide-react';
import { validarCorreo, validarPassword } from '../../utils/validaciones';

export const UsuarioModal: React.FC = () => {
  const { isUsuarioModalOpen, cerrarAddUserModal, guardarUser } = useApp();

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [role, setRole] = useState<'Mesero' | 'Administrador' | 'Cocinero'>('Mesero');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isUsuarioModalOpen) {
      setName('');
      setUsername('');
      setRole('Mesero');
      setPassword('');
      setConfirmPassword('');
      setNameError('');
      setUsernameError('');
      setPasswordError('');
      setConfirmError('');
      setFormError('');
      setIsSubmitting(false);
    }
  }, [isUsuarioModalOpen]);

  if (!isUsuarioModalOpen) return null;

  const validarNombreCompleto = (val: string) => {
    const limpio = val.trim();
    if (!limpio) return 'El nombre completo es obligatorio.';
    if (limpio.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
    if (limpio.length > 120) return 'El nombre no puede superar los 120 caracteres.';
    return '';
  };

  const handleGeneratePassword = () => {
    const res = 'Cafe' + Math.floor(1000 + Math.random() * 9000) + '!';
    setPassword(res);
    setConfirmPassword(res);
    setPasswordError('');
    setConfirmError('');
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errName = validarNombreCompleto(name);
    const errUser = validarCorreo(username);
    const errPass = validarPassword(password);
    const errConfirm =
      !confirmPassword
        ? 'Confirma la contraseña.'
        : password !== confirmPassword
          ? 'Las contraseñas no coinciden.'
          : '';

    setNameError(errName);
    setUsernameError(errUser);
    setPasswordError(errPass);
    setConfirmError(errConfirm);

    const errores = [errName, errUser, errPass, errConfirm].filter(Boolean);
    if (errores.length > 0) {
      setFormError(`Revisa los campos marcados (${errores.length} error${errores.length > 1 ? 'es' : ''}).`);
      return;
    }

    setFormError('');
    setIsSubmitting(true);
    try {
      await guardarUser({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        role,
        password,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-stone-900 text-base">Alta de usuario</h3>
            <p className="text-xs text-stone-500">Registra al personal y asigna sus credenciales de acceso</p>
          </div>
          <button
            type="button"
            onClick={cerrarAddUserModal}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-semibold">{formError}</span>
            </div>
          )}

          <div>
            <h4 className="font-extrabold text-[10px] text-stone-400 uppercase tracking-wider mb-2">
              Datos del usuario
            </h4>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Nombre completo *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  const val = e.target.value;
                  setName(val);
                  setNameError(validarNombreCompleto(val));
                  const parts = val
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .toLowerCase()
                    .trim()
                    .split(/\s+/);
                  if (parts.length >= 2 && parts[0] && parts[1]) {
                    const sugerido = `${parts[0][0]}${parts[1].replace(/[^a-z0-9]/g, '')}@holacafe.com`;
                    setUsername(sugerido);
                    setUsernameError(validarCorreo(sugerido));
                  }
                }}
                placeholder="Ej. Fernanda Ruiz"
                className={`w-full px-3 py-2 bg-stone-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium ${
                  nameError ? 'border-red-400 bg-red-50/40' : 'border-stone-200'
                }`}
              />
              {nameError ? (
                <span className="text-xs text-red-600 font-semibold mt-1 block">
                  {nameError}
                </span>
              ) : (
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  Mínimo 3 caracteres.
                </span>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100">
            <h4 className="font-extrabold text-[10px] text-stone-400 uppercase tracking-wider mb-2">
              Credenciales de acceso
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Correo electrónico *</label>
                <input
                  type="email"
                  value={username}
                  onChange={(e) => {
                    const val = e.target.value;
                    setUsername(val);
                    setUsernameError(validarCorreo(val));
                  }}
                  placeholder="fruiz@holacafe.com"
                  className={`w-full px-3 py-2 bg-stone-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium font-mono ${
                    usernameError ? 'border-red-400 bg-red-50/40' : 'border-stone-200'
                  }`}
                />
                {usernameError ? (
                  <span className="text-xs text-red-600 font-semibold mt-1 block">
                    {usernameError}
                  </span>
                ) : (
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    Debe ser un correo válido y único.
                  </span>
                )}
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Rol *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'Mesero' | 'Administrador' | 'Cocinero')}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  <option value="Mesero">Mesero</option>
                  <option value="Cocinero">Cocinero</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-stone-700">Contraseña *</label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-800"
                  >
                    Generar segura
                  </button>
                </div>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPassword(val);
                    setPasswordError(validarPassword(val));
                    if (confirmPassword) {
                      setConfirmError(val !== confirmPassword ? 'Las contraseñas no coinciden.' : '');
                    }
                  }}
                  placeholder="Ej. Cafe2026!"
                  className={`w-full px-3 py-2 bg-stone-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-mono text-stone-800 ${
                    passwordError ? 'border-red-400 bg-red-50/40' : 'border-stone-200'
                  }`}
                />
                {passwordError ? (
                  <span className="text-xs text-red-600 font-semibold mt-1 block">
                    {passwordError}
                  </span>
                ) : (
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    Mín. 8 caracteres, 1 mayúscula, 1 número y 1 símbolo (!@#$).
                  </span>
                )}
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Confirmar contraseña *</label>
                <input
                  type="text"
                  value={confirmPassword}
                  onChange={(e) => {
                    const val = e.target.value;
                    setConfirmPassword(val);
                    setConfirmError(password !== val ? 'Las contraseñas no coinciden.' : '');
                  }}
                  placeholder="Repite la contraseña"
                  className={`w-full px-3 py-2 bg-stone-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-mono text-stone-800 ${
                    confirmError ? 'border-red-400 bg-red-50/40' : 'border-stone-200'
                  }`}
                />
                {confirmError && (
                  <span className="text-xs text-red-600 font-semibold mt-1 block">
                    {confirmError}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={cerrarAddUserModal}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#D97706] hover:bg-[#B45309] disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-98"
            >
              {isSubmitting ? 'Guardando...' : 'Dar de alta'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
