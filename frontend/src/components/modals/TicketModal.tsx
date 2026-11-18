import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Printer, Plus, Minus } from 'lucide-react';

export const TicketModal: React.FC = () => {
  const { isTicketModalOpen, closeTicketModal, activeTableId } = useApp();
  const [copies, setCopies] = useState(1);

  if (!isTicketModalOpen) return null;

  // Exact items from Figma Modal_Ticket.pdf
  const ticketItems = [
    { qty: 2, name: 'Hamburguesa Clásica', price: 330.00 },
    { qty: 1, name: 'Hamburguesa Hawaiana', price: 175.00 },
    { qty: 1, name: 'Club Sandwich Clásico', price: 150.00 },
    { qty: 1, name: 'Papas Gajo', price: 95.00 },
    { qty: 2, name: 'Crepa Nutella & Frutos Rojos', price: 240.00 },
    { qty: 2, name: 'Latte (Vainilla)', price: 150.00 },
    { qty: 2, name: 'Limonada Natural', price: 100.00 },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#E5DCD3] w-full max-w-lg max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-[#F5EFEB] flex items-center justify-between">
          <div>
            <h3 className="font-black text-[#1E110A] text-base">Ticket de cuenta</h3>
            <p className="text-xs text-[#8C7D73]">
              Vista previa · Mesa 04 · Folio #1039
            </p>
          </div>
          <button
            onClick={closeTicketModal}
            className="p-1 rounded-lg text-[#8C7D73] hover:text-[#1E110A] hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Paper Preview (Exact Figma Layout) */}
        <div className="p-6 overflow-y-auto bg-[#FAF8F5] flex justify-center">
          <div 
            id="printable-ticket" 
            className="w-full max-w-[340px] bg-white p-6 shadow-xs border border-[#E5DCD3] rounded-2xl text-[#1E110A] font-sans text-xs leading-relaxed"
          >
            {/* Header */}
            <div className="text-center pb-4 border-b border-dashed border-[#D5C7BA] space-y-0.5">
              <h2 className="text-lg font-black text-[#1E110A] tracking-tight">¡Hola, Café!</h2>
              <p className="text-xs font-bold text-[#6E5A4E]">Café Central</p>
              <p className="text-[11px] text-[#8C7D73]">Av. Principal 123, Col. Centro Cuilapam</p>
              <p className="text-[11px] text-[#8C7D73]">RFC: XAXX010101000</p>
            </div>

            {/* Ticket Info */}
            <div className="py-3 border-b border-dashed border-[#D5C7BA] space-y-1 text-[11px] text-[#6E5A4E]">
              <div className="flex justify-between font-bold">
                <span>Ticket #1039</span>
                <span>Mesa 04</span>
              </div>
              <div className="flex justify-between">
                <span>22/10/2026</span>
                <span>14:32</span>
              </div>
              <div className="flex justify-between">
                <span>Mesero: <strong>Gael O.</strong></span>
                <span>Personas: 4</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="py-3 border-b border-dashed border-[#D5C7BA]">
              <div className="flex justify-between font-bold text-[10px] text-[#8C7D73] uppercase tracking-wider mb-2">
                <span>CANT · DESCRIPCIÓN</span>
                <span>IMPORTE</span>
              </div>

              <div className="space-y-1.5 text-xs">
                {ticketItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <span className="pr-2 font-medium">
                      <strong className="mr-1.5 font-bold">{item.qty}</strong>
                      {item.name}
                    </span>
                    <span className="font-bold text-[#1E110A] shrink-0">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtotal, IVA, TOTAL */}
            <div className="py-3 border-b border-dashed border-[#D5C7BA] space-y-1 text-xs">
              <div className="flex justify-between text-[#6E5A4E]">
                <span>Subtotal</span>
                <span className="font-semibold text-[#1E110A]">$1,068.97</span>
              </div>
              <div className="flex justify-between text-[#6E5A4E]">
                <span>IVA (16%)</span>
                <span className="font-semibold text-[#1E110A]">$171.03</span>
              </div>
              <div className="flex justify-between text-base font-black text-[#1E110A] pt-1">
                <span>TOTAL</span>
                <span className="text-lg font-black text-[#7B3F00]">$1,240.00</span>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="pt-4 text-center space-y-1">
              <p className="font-bold text-xs text-[#1E110A]">¡Gracias por tu visita!</p>
              <p className="text-[10px] text-[#8C7D73] leading-relaxed">
                Este ticket no es un comprobante fiscal. Solicita tu factura en caja.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Controls */}
        <div className="p-4 px-6 bg-white border-t border-[#E5DCD3] flex items-center justify-between gap-3">
          {/* Copias Stepper */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6E5A4E]">Copias:</span>
            <div className="flex items-center border border-[#D5C7BA] rounded-xl p-0.5 bg-[#FAF8F5]">
              <button
                type="button"
                onClick={() => setCopies(Math.max(1, copies - 1))}
                className="w-6 h-6 rounded flex items-center justify-center hover:bg-stone-200 text-[#1E110A]"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center text-xs font-black">{copies}</span>
              <button
                type="button"
                onClick={() => setCopies(copies + 1)}
                className="w-6 h-6 rounded flex items-center justify-center hover:bg-stone-200 text-[#1E110A]"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={closeTicketModal}
              className="px-4 py-2 text-xs font-semibold text-[#6E5A4E] hover:text-[#1E110A] rounded-xl"
            >
              Cancelar
            </button>

            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-[#DF7B1B] hover:bg-[#C96910] text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir ticket</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
