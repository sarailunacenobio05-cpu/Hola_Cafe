import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertCircle } from 'lucide-react';

export const ConfirmarBajaModal: React.FC = () => {
  const { isConfirmBajaModalOpen, closeConfirmBajaModal, confirmBajaUser, userToBaja } = useApp();

  if (!isConfirmBajaModalOpen || !userToBaja) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-md p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <span className="font-extrabold text-2xl leading-none">!</span>
          </div>

          <div>
            <h3 className="font-extrabold text-stone-900 text-lg leading-tight">
              Dar de baja al mesero
            </h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              El usuario <strong>{userToBaja.name}</strong> perderá el acceso al sistema de inmediato. Sus comandas y tickets se conservan en el historial y podrás reactivarlo cuando quieras.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={closeConfirmBajaModal}
            className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmBajaUser}
            className="px-5 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-98"
          >
            Dar de baja
          </button>
        </div>

      </div>
    </div>
  );
};
