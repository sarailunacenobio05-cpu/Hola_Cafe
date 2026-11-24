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
  const [descriptionError, setDescriptionError] = useState('');
  const [price, setPrice] = useState('70.00');
  const [priceError, setPriceError] = useState('');
  const [status, setStatus] = useState<'DISPONIBLE' | 'AGOTADO' | 'OCULTO'>('DISPONIBLE');
  const [options, setOptions] = useState<string[]>([]);
  const [newOptionInput, setNewOptionInput] = useState('');
  const [allowKitchenNotes, setAllowKitchenNotes] = useState(true);

  useEffect(() => {
    if (productoEditando) {
      setName(productoEditando.name);
      setCategory(productoEditando.category || 'Bebidas Frías');
      setDescription(productoEditando.description);
      setPrice(productoEditando.price.toString());
      setStatus(productoEditando.status);
      setOptions(productoEditando.options || []);
      setAllowKitchenNotes(productoEditando.allowKitchenNotes ?? true);
    } else {
      setName('');
      setCategory('Bebidas Frías');
      setDescription('');
      setPrice('');
      setStatus('DISPONIBLE');
      setOptions([]);
      setAllowKitchenNotes(true);
    }
    setNewOptionInput('');
    setNameError('');
    setDescriptionError('');
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
    const errDesc = validarRequerido(description, 'descripción');
    const errPrice = validarPrecio(price);
    setNameError(errName);
    setDescriptionError(errDesc);
    setPriceError(errPrice);
    if (errName || errDesc || errPrice) return;

    guardarProducto({
      name: name.trim(),
      category,
      description: description.trim(),
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

        <form onSubmit={handleSubmit} noValidate className="p-5 overflow-y-auto space-y-4 text-xs flex-1">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Nombre del producto <span className="text-red-500">*</span>
              </label>
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
                className={`w-full px-3 py-2 bg-stone-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium ${
                  nameError ? 'border-red-400 bg-red-50/40' : 'border-stone-200'
                }`}
              />
              {nameError && (
                <span className="text-xs text-red-600 font-semibold mt-1 block">
                  {nameError}
                </span>
              )}
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Categoría <span className="text-red-500">*</span>
              </label>
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
            <label className="block font-bold text-stone-700 mb-1">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => {
                const val = e.target.value;
                setDescription(val);
                setDescriptionError(validarRequerido(val, 'descripción'));
              }}
              required
              placeholder="Descripción de ingredientes y sabor..."
              className={`w-full px-3 py-2 bg-stone-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium resize-none ${
                descriptionError ? 'border-red-400 bg-red-50/40' : 'border-stone-200'
              }`}
            />
            {descriptionError && (
              <span className="text-xs text-red-600 font-semibold mt-1 block">
                {descriptionError}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Precio (MXN) <span className="text-red-500">*</span>
              </label>
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
                className={`w-full px-3 py-2 bg-stone-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-bold text-stone-900 ${
                  priceError ? 'border-red-400 bg-red-50/40' : 'border-stone-200'
                }`}
              />
              {priceError && (
                <span className="text-xs text-red-600 font-semibold mt-1 block">
                  {priceError}
                </span>
              )}
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Disponibilidad <span className="text-red-500">*</span>
              </label>
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
            <div className="flex flex-wrap items-center gap-1.5">
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
                  placeholder="Ej. Vainilla, Natural..."
                  className="px-2.5 py-1 bg-stone-50 border border-dashed border-stone-300 rounded-lg text-xs w-44 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-200 text-xs"
                >
                  + Agregar
                </button>
              </div>
            </div>
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

          <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[11px] text-stone-400">
              <span className="text-red-500 font-bold">*</span> Campos obligatorios
            </span>
            <div className="flex items-center gap-2">
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
          </div>

        </form>

      </div>
    </div>
  );
};
