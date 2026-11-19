import React from 'react';
import { useApp } from '../../context/AppContext';

export const ConfirmarEliminarModal: React.FC = () => {
  const { isConfirmEliminarModalOpen, cerrarConfirmEliminarModal, confirmarBorrarProducto, productoAEliminar } = useApp();

  if (!isConfirmEliminarModalOpen || !productoAEliminar) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-md p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <span className="font-extrabold text-2xl leading-none">!</span>
          </div>

          <div>
            <h3 className="font-extrabold text-stone-900 text-lg leading-tight">
              Eliminar producto
            </h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              El producto <strong>{productoAEliminar.name}</strong> se quitará del menú, del comandero y de la cocina. Las comandas y tickets anteriores no cambian. Si solo quieres dejar de venderlo por ahora, márcalo como Agotado u Oculto.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={cerrarConfirmEliminarModal}
            className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmarBorrarProducto}
            className="px-5 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-98"
          >
            Eliminar
          </button>
        </div>

      </div>
    </div>
  );
};
