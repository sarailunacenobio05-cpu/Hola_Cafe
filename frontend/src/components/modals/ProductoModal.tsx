import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X } from 'lucide-react';
import { validarRequerido, validarPrecio } from '../../utils/validaciones';

export const ProductoModal: React.FC = () => {
  const { isProductoModalOpen, cerrarProductModal, productoEditando, guardarProducto } = useApp();

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [category, setCategory] = useState('Bebidas Frías');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('70.00');
  const [priceError, setPriceError] = useState('');
  const [status, setStatus] = useState<'DISPONIBLE' | 'AGOTADO' | 'OCULTO'>('DISPONIBLE');
  const [options, setOptions] = useState<string[]>(['Natural', 'Vainilla']);
  const [newOptionInput, setNewOptionInput] = useState('');
  const [allowKitchenNotes, setAllowKitchenNotes] = useState(true);

  useEffect(() => {
    if (productoEditando) {
      setName(productoEditando.name);
      setCategory(productoEditando.category);
      setDescription(productoEditando.description);
      setPrice(productoEditando.price.toString());
      setStatus(productoEditando.status);
      setOptions(productoEditando.options || []);
      setAllowKitchenNotes(productoEditando.allowKitchenNotes ?? true);
    } else {
      setName('Cold Brew');
      setCategory('Bebidas frías');
      setDescription('Café de extracción en frío, servido con hielo. Suave, refrescante y con bajo amargor.');
      setPrice('70.00');
      setStatus('DISPONIBLE');
      setOptions(['Natural', 'Vainilla']);
      setAllowKitchenNotes(true);
    }
    setNameError('');
    setPriceError('');
  }, [productoEditando, isProductoModalOpen]);

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
    const errName = validarRequerido(name, 'nombre del producto');
    const errPrice = validarPrecio(price);
    setNameError(errName);
    setPriceError(errPrice);
    if (errName || errPrice) return;

    guardarProducto({
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

        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-stone-900 text-base">
              {productoEditando ? 'Editar producto' : 'Nuevo producto'}
            </h3>
            <p className="text-xs text-stone-500">
              {productoEditando ? 'Modifica los datos del platillo o bebida' : 'Agrega un producto al menú'}
            </p>
          </div>
          <button
            onClick={cerrarProductModal}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Nombre del producto</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  const val = e.target.value;
                  setName(val);
                  setNameError(validarRequerido(val, 'nombre del producto'));
                }}
                required
                placeholder="Ej. Cold Brew"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium"
              />
              {nameError && (
                <span className="text-xs text-red-600 font-semibold mt-1 block">
                  {nameError}
                </span>
              )}
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none font-medium text-stone-800"
              >
                <option value="Alimentos Salados">Alimentos Salados</option>
                <option value="Dulces">Dulces</option>
                <option value="Mini Hotcakes">Mini Hotcakes</option>
                <option value="Opciones Frescas">Opciones Frescas</option>
                <option value="Bebidas Calientes (Café)">Bebidas Calientes (Café)</option>
                <option value="Opciones Sin Café">Opciones Sin Café</option>
                <option value="Bebidas Frías">Bebidas Frías</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Descripción</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Descripción de ingredientes y sabor..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Precio (MXN)</label>
              <input
                type="number"
                step="0.5"
                value={price}
                onChange={(e) => {
                  const val = e.target.value;
                  setPrice(val);
                  setPriceError(validarPrecio(val));
                }}
                required
                placeholder="70.00"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-bold text-stone-900"
              />
              {priceError && (
                <span className="text-xs text-red-600 font-semibold mt-1 block">
                  {priceError}
                </span>
              )}
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

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={cerrarProductModal}
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
