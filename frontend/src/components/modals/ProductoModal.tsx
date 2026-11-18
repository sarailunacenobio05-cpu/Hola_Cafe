import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Plus } from 'lucide-react';
import { MenuItem } from '../../types';

export const ProductoModal: React.FC = () => {
  const { isProductoModalOpen, closeProductModal, editingProduct, saveProduct } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Bebidas frías');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('70.00');
  const [status, setStatus] = useState<'DISPONIBLE' | 'AGOTADO' | 'OCULTO'>('DISPONIBLE');
  const [options, setOptions] = useState<string[]>(['Natural', 'Vainilla']);
  const [newOptionInput, setNewOptionInput] = useState('');
  const [allowKitchenNotes, setAllowKitchenNotes] = useState(true);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setCategory(editingProduct.category);
      setDescription(editingProduct.description);
      setPrice(editingProduct.price.toString());
      setStatus(editingProduct.status);
      setOptions(editingProduct.options || []);
      setAllowKitchenNotes(editingProduct.allowKitchenNotes ?? true);
    } else {
      setName('Cold Brew');
      setCategory('Bebidas frías');
      setDescription('Café de extracción en frío, servido con hielo. Suave, refrescante y con bajo amargor.');
      setPrice('70.00');
      setStatus('DISPONIBLE');
      setOptions(['Natural', 'Vainilla']);
      setAllowKitchenNotes(true);
    }
  }, [editingProduct, isProductoModalOpen]);

  if (!isProductoModalOpen) return null;

  const handleAddOption = () => {
    if (newOptionInput.trim() && !options.includes(newOptionInput.trim())) {
      setOptions([...options, newOptionInput.trim()]);
      setNewOptionInput('');
    }
  };

  const handleRemoveOption = (opt: string) => {
    setOptions(options.filter(o => o !== opt));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProduct({
      name,
      category,
      description,
      price: parseFloat(price) || 0,
      status,
      options,
      allowKitchenNotes
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-stone-900 text-base">
              {editingProduct ? 'Editar producto' : 'Nuevo producto'}
            </h3>
            <p className="text-xs text-stone-500">
              {editingProduct ? 'Modifica los datos del platillo o bebida' : 'Agrega un producto al menú'}
            </p>
          </div>
          <button
            onClick={closeProductModal}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          
          {/* Row 1: Name and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Nombre del producto</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ej. Cold Brew"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none font-medium text-stone-800"
              >
                <option value="Bebidas frías">Bebidas frías</option>
                <option value="Bebidas calientes">Bebidas calientes</option>
                <option value="Cafetería Especialidad">Cafetería Especialidad</option>
                <option value="Alimentos salados">Alimentos salados</option>
                <option value="Desayunos">Desayunos</option>
                <option value="Repostería y Pan">Repostería y Pan</option>
                <option value="Opciones frescas">Opciones frescas</option>
                <option value="Dulces">Dulces</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">Descripción</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de ingredientes y sabor..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium resize-none"
            />
          </div>

          {/* Price & Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Precio (MXN)</label>
              <input
                type="number"
                step="0.5"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                placeholder="70.00"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-bold text-stone-900"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Disponibilidad</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none font-medium text-stone-800"
              >
                <option value="DISPONIBLE">Disponible</option>
                <option value="AGOTADO">Agotado</option>
                <option value="OCULTO">Oculto</option>
              </select>
            </div>
          </div>

          {/* Variants tags */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Opciones o variantes (opcional)
            </label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {options.map((opt) => (
                <span
                  key={opt}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 font-semibold text-xs border border-stone-200"
                >
                  {opt}
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(opt)}
                    className="text-stone-400 hover:text-stone-700 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}

              <div className="inline-flex items-center gap-1">
                <input
                  type="text"
                  value={newOptionInput}
                  onChange={(e) => setNewOptionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                  placeholder="Nueva opción..."
                  className="px-2 py-1 bg-stone-50 border border-dashed border-stone-300 rounded-lg text-xs w-28 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-200 text-xs"
                >
                  + Agregar
                </button>
              </div>
            </div>
            <p className="text-[11px] text-stone-400">
              Ej. Vainilla / Caramelo o Natural / de frutos.
            </p>
          </div>

          {/* Kitchen specs switch */}
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowKitchenNotes}
                onChange={(e) => setAllowKitchenNotes(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <span className="text-xs font-semibold text-stone-700">
                Permitir especificaciones para cocina (sin cebolla, término, etc.)
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeProductModal}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#D97706] hover:bg-[#B45309] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-98"
            >
              Guardar producto
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
