import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Radio, Info } from 'lucide-react';
import { validarRequerido } from '../../utils/validaciones';

export const BotonModal: React.FC = () => {
  const { isBotonModalOpen, botonEditando, cerrarAddBotonModal, guardarBoton, tables } = useApp();

  const [id, setId] = useState('BOT-M17');
  const [idError, setIdError] = useState('');
  const [name, setName] = useState('Botón de terraza');
  const [nameError, setNameError] = useState('');
  const [tableId, setTableId] = useState('M01');

  useEffect(() => {
    if (botonEditando) {
      setId(botonEditando.id);
      setName(botonEditando.name);
      setTableId(botonEditando.tableId || 'M01');
    } else {
      setId('BOT-M17');
      setName('Botón de terraza');
      setTableId('M01');
    }
    setIdError('');
    setNameError('');
  }, [botonEditando, isBotonModalOpen]);

  if (!isBotonModalOpen) return null;

  const validarIdBoton = (val: string) => {
    if (!val.trim()) return 'El identificador del dispositivo es obligatorio.';
    if (!/^BOT-[A-Z0-9]+$/i.test(val.trim())) {
      return 'El formato debe iniciar con BOT- (ej. BOT-M17).';
    }
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errId = validarIdBoton(id);
    const errName = validarRequerido(name, 'nombre del botón');
    setIdError(errId);
    setNameError(errName);
    if (errId || errName) return;

    guardarBoton({
      id,
      name,
      tableId
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-stone-900 text-base">
              {botonEditando ? 'Editar botón de aviso' : 'Agregar botón'}
            </h3>
            <p className="text-xs text-stone-500">
              {botonEditando
                ? 'Modifica el dispositivo y la mesa asignada.'
                : 'Registra un dispositivo y asígnalo a una mesa.'}
            </p>
          </div>
          <button
            onClick={cerrarAddBotonModal}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          
          {!botonEditando && (
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
              <Radio className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 text-xs">Ten el botón físico a la mano</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Encontrarás su identificador en la etiqueta del dispositivo.
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Dispositivo (ID) *
            </label>
            <input
              type="text"
              value={id}
              disabled={Boolean(botonEditando)}
              onChange={(e) => {
                const val = e.target.value;
                setId(val);
                setIdError(validarIdBoton(val));
              }}
              required
              placeholder="Ej. BOT-M17"
              className={`w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-mono font-medium ${
                botonEditando ? 'opacity-65 cursor-not-allowed bg-stone-100' : ''
              }`}
            />
            {idError ? (
              <span className="text-xs text-red-600 font-semibold mt-1 block">
                {idError}
              </span>
            ) : (
              <span className="text-[10px] text-stone-400 mt-0.5 block">
                Introduce el ID único tal como aparece en la etiqueta.
              </span>
            )}
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Nombre del dispositivo *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                const val = e.target.value;
                setName(val);
                setNameError(validarRequerido(val, 'nombre del botón'));
              }}
              required
              placeholder="Ej. Botón de terraza"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium"
            />
            {nameError ? (
              <span className="text-xs text-red-600 font-semibold mt-1 block">
                {nameError}
              </span>
            ) : (
              <span className="text-[10px] text-stone-400 mt-0.5 block">
                Usa un nombre fácil de reconocer para el personal.
              </span>
            )}
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Mesa asignada *
            </label>
            <select
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none font-medium text-stone-800"
            >
              {tables.map(t => (
                <option key={t.id} value={t.id}>
                  Mesa {t.number < 10 ? `0${t.number}` : t.number} ({t.id})
                </option>
              ))}
            </select>
            <span className="text-[10px] text-stone-400 mt-0.5 block">
              Cada mesa puede tener un solo botón de aviso asignado.
            </span>
          </div>

          {!botonEditando && (
            <div className="flex items-start gap-2 text-stone-500 text-[11px] pt-1">
              <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
              <span>La batería y el estado de conexión se mostrarán al recibir la primera señal del botón.</span>
            </div>
          )}

          <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[11px] text-stone-400">* Campos obligatorios</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cerrarAddBotonModal}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#D97706] hover:bg-[#B45309] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-98"
              >
                {botonEditando ? 'Guardar cambios' : 'Agregar botón'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
