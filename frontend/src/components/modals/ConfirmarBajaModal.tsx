import React from 'react';
import { useApp } from '../../context/AppContext';

export const ConfirmarBajaModal: React.FC = () => {
  const { isConfirmBajaModalOpen, cerrarConfirmBajaModal, confirmarBajaUser, usuarioBaja } = useApp();

  if (!isConfirmBajaModalOpen || !usuarioBaja) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-md p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <span className="font-extrabold text-2xl leading-none">!</span>
          </div>

          <div>
            <h3 className="font-extrabold text-stone-900 text-lg leading-tight">
              Eliminar cuenta definitivamente
            </h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Se eliminará permanentemente la cuenta de <strong>{usuarioBaja.name}</strong> ({usuarioBaja.username}) del sistema. Esta acción <strong>no se puede deshacer</strong>.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={cerrarConfirmBajaModal}
            className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmarBajaUser}
            className="px-5 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-98"
          >
            Eliminar cuenta
          </button>
        </div>

      </div>
    </div>
  );
};
