import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../Logo';
import {
  Bell,
  LogOut,
  ArrowLeft,
  Receipt,
  User,
  CreditCard,
  Banknote,
  QrCode,
  Printer,
  Check,
  CheckCircle2,
  Percent,
  FileText,
  Pencil,
  Wallet,
  Split,
  DoorOpen,
} from 'lucide-react';

/* ---------- Configuración ---------- */
const IVA = 0.16;
const DESCUENTO_PCT = 10;
const PROPINAS = [0, 10, 15, 20];

type MetodoId = 'terminal' | 'efectivo' | 'qr';

const METODOS: {
  id: MetodoId;
  titulo: string;
  detalle: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { id: 'terminal', titulo: 'Terminal Bancaria', detalle: 'Tarjeta de débito o crédito', icon: CreditCard, color: 'text-[#8B4513]' },
  { id: 'efectivo', titulo: 'Efectivo en Mesa', detalle: 'Caja / Monedero', icon: Banknote, color: 'text-[#059669]' },
  { id: 'qr', titulo: 'Transferencia QR / CoDi', detalle: 'Instantáneo', icon: QrCode, color: 'text-[#0284C7]' },
];

/* Comanda de ejemplo (precios en centavos para evitar errores de redondeo) */
const COMANDA_DEFAULT = {
  mesa: '04',
  comensales: 2,
  ticket: 1039,
  mesero: 'Carlos R.',
  boton: { id: 'BOT-1', bateria: 88, estado: 'En espera' },
  items: [
    { id: 1, cantidad: 2, nombre: 'Cappuccino Artesanal', precioCents: 6500, modificadores: ['Leche deslactosada', 'Taza caliente'], categoria: 'Cafetería' },
    { id: 2, cantidad: 1, nombre: 'Croissant Almendras', precioCents: 5800, modificadores: ['Tibio'], categoria: 'Panadería artesanal' },
    { id: 3, cantidad: 1, nombre: 'Tostada de Aguacate', precioCents: 11000, modificadores: ['Huevo término medio'], categoria: 'Cocina Salada' },
  ],
};

const mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const fmt = (cents: number) => mxn.format(cents / 100);

export const CobroRapidoModal: React.FC = () => {
  const {
    isCobroModalOpen,
    closeCobroModal,
    openTicketModal,
    releaseTableDirectly,
    activeTableId,
    tables,
    currentUser,
    logout,
  } = useApp();

  const [propinaPct, setPropinaPct] = useState(10);
  const [conDescuento, setConDescuento] = useState(false);
  const [modalidad, setModalidad] = useState<'completo' | 'dividir'>('completo');
  const [metodo, setMetodo] = useState<MetodoId>('terminal');
  const [pagado, setPagado] = useState(false);

  const activeTable = tables.find((t) => t.id === activeTableId);

  const comanda = {
    ...COMANDA_DEFAULT,
    mesa: activeTable ? activeTable.number.toString().padStart(2, '0') : COMANDA_DEFAULT.mesa,
    comensales: activeTable?.guests || COMANDA_DEFAULT.comensales,
    mesero: activeTable?.waiterName || currentUser?.name || COMANDA_DEFAULT.mesero,
  };

  const nombreUsuario = currentUser?.name || 'Carlos R.';
  const iniciales = nombreUsuario
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const totales = useMemo(() => {
    const subtotal = comanda.items.reduce((s, it) => s + it.cantidad * it.precioCents, 0);
    const descuento = conDescuento ? Math.round((subtotal * DESCUENTO_PCT) / 100) : 0;
    const base = subtotal - descuento;
    const propina = Math.round((base * propinaPct) / 100);
    const iva = Math.round(base * IVA);
    return { subtotal, descuento, base, propina, iva, total: base + iva + propina };
  }, [comanda.items, conDescuento, propinaPct]);

  const lineas = comanda.items.length;
  const articulos = comanda.items.reduce((s, it) => s + it.cantidad, 0);
  const porPersona = Math.round(totales.total / comanda.comensales);

  const handleCerrar = () => {
    setPagado(false);
    closeCobroModal();
  };

  const handleLiberarMesa = () => {
    if (activeTableId) releaseTableDirectly(activeTableId);
    handleCerrar();
  };

  if (!isCobroModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#F5EFEB] text-[#1E110A] flex flex-col font-sans overflow-y-auto animate-in fade-in duration-150">

      {/* 1. HEADER (igual al de Mesas) */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[#E7DDD3] bg-[#F5EFEB] shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Logo size="md" variant="badge-only" />
          <span className="font-extrabold text-[#1E110A] text-xl tracking-tight leading-none">¡Hola, Café!</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => alert('Alerta de Barra atendida.')}
            className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Bell className="w-3.5 h-3.5 fill-current" />
            <span>Alerta Barra</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1E110A]">{nombreUsuario}</span>
            <div className="w-7 h-7 rounded-full bg-[#EFE6DC] border border-[#D5C7BA] flex items-center justify-center text-[11px] font-black text-[#6E4F32]">
              {iniciales}
            </div>
          </div>

          <button
            onClick={() => { handleCerrar(); logout(); }}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#6E5A4E] hover:text-[#1E110A] transition-colors ml-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </header>

      {/* 2. BARRA DE CONTEXTO */}
      <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 max-w-[1600px] w-full mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCerrar}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#D5C7BA] hover:border-[#DF7B1B] hover:text-[#DF7B1B] text-xs font-bold text-[#1E110A] transition-all shadow-2xs"
            title="Volver al mapa de mesas"
          >
            <ArrowLeft className="w-4 h-4 text-[#DF7B1B]" />
            <span>Mesas</span>
          </button>

          <span className="bg-[#7B3F00] text-white text-sm font-black px-3 py-1 rounded-lg">Mesa {comanda.mesa}</span>
          <span className="text-xs font-semibold text-[#8C7D73]">({comanda.comensales} Comensales)</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="flex items-center gap-1.5 bg-white border border-[#E5DCD3] px-3 py-1.5 rounded-xl">
            <Receipt className="w-3.5 h-3.5 text-[#DF7B1B]" />
            <span>Ticket #{comanda.ticket}</span>
          </span>
          <span className="flex items-center gap-1.5 bg-white border border-[#E5DCD3] px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>{comanda.boton.id}: <strong>{comanda.boton.bateria}%</strong> <span className="text-[#8C7D73]">({comanda.boton.estado})</span></span>
          </span>
          <span className="flex items-center gap-1.5 bg-white border border-[#E5DCD3] px-3 py-1.5 rounded-xl">
            <User className="w-3.5 h-3.5 text-[#8B4513]" />
            <span>Mesero: <strong>{comanda.mesero}</strong></span>
          </span>
        </div>
      </div>

      {/* 3. CONTENIDO */}
      <main className="flex-1 px-6 pb-8 max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-6 items-start">

        {/* ===== IZQUIERDA: Comanda + Desglose ===== */}
        <div className="space-y-5">

          {/* Comanda Activa (cabecera café como en Comandero) */}
          <section className="bg-white border border-[#E5DCD3] rounded-2xl overflow-hidden shadow-2xs">
            <div className="bg-[#7B3F00] text-white px-5 py-3.5 flex items-center justify-between">
              <h2 className="text-base font-black flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-300" />
                Comanda Activa
              </h2>
              <span className="text-[11px] font-bold bg-[#5E2F00] text-amber-200 px-2.5 py-1 rounded-md">
                {lineas} Líneas • {articulos} Artículos
              </span>
            </div>

            <ul className="p-4 space-y-2.5">
              {comanda.items.map((it) => (
                <li key={it.id} className="border border-[#E5DCD3] rounded-xl p-3.5 hover:border-[#D5C7BA] transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#7B3F00] text-white text-xs font-black px-1.5 py-0.5 rounded">{it.cantidad}x</span>
                      <h3 className="text-sm font-bold">{it.nombre}</h3>
                    </div>
                    <span className="font-black text-sm">{fmt(it.cantidad * it.precioCents)}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2 pl-8">
                    {it.modificadores.map((m) => (
                      <span key={m} className="text-[11px] font-semibold text-[#6E5A4E] bg-[#FAF8F5] border border-[#E5DCD3] px-2 py-0.5 rounded-md">
                        {m}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-2 pl-8">
                    <span className="text-[11px] text-[#A8988D]">
                      {it.cantidad > 1 ? `Sub: ${fmt(it.precioCents)} c/u` : it.categoria}
                    </span>
                    <button
                      onClick={() => alert(`Modificar producto: ${it.nombre}`)}
                      disabled={pagado}
                      className="flex items-center gap-1 text-[11px] font-bold text-[#8B4513] hover:text-[#DF7B1B] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Pencil className="w-3 h-3" />
                      Modificar
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-2 gap-3 px-4 pb-4">
              <button
                onClick={() => setConDescuento((v) => !v)}
                disabled={pagado}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 ${
                  conDescuento
                    ? 'bg-[#7B3F00] text-white border-[#7B3F00]'
                    : 'bg-white border-[#D5C7BA] text-[#1E110A] hover:bg-stone-50'
                }`}
              >
                <Percent className="w-3.5 h-3.5 text-amber-500" />
                Descuento {DESCUENTO_PCT}%
              </button>
              <button
                onClick={() => alert('Nota agregada al ticket: Factura solicitada.')}
                disabled={pagado}
                className="py-2.5 px-3 bg-white border border-[#D5C7BA] hover:bg-stone-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5 text-[#8C7D73]" />
                Nota Ticket
              </button>
            </div>
          </section>

          {/* Desglose */}
          <section className="bg-white border border-[#E5DCD3] rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5EFEB]">
              <h3 className="text-sm font-black">Desglose de Comanda</h3>
              <span className="text-[10px] font-bold text-[#8C7D73] bg-[#FAF8F5] border border-[#E5DCD3] px-2 py-0.5 rounded-md">
                Moneda: MXN ($)
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#786B63]">Subtotal Alimentos &amp; Bebidas</span>
                <span className="font-bold">{fmt(totales.subtotal)}</span>
              </div>
              {conDescuento && (
                <div className="flex justify-between">
                  <span className="text-[#786B63]">Descuento ({DESCUENTO_PCT}%)</span>
                  <span className="font-bold text-[#D32F2F]">−{fmt(totales.descuento)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#786B63]">IVA (16%)</span>
                <span className="font-bold">{fmt(totales.iva)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#786B63]">Propina ({propinaPct}%)</span>
                <span className="font-bold">{fmt(totales.propina)}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold">Seleccionar Propina:</span>
                <span className="text-[11px] font-semibold text-[#8C7D73]">100% para servicio de sala</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {PROPINAS.map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setPropinaPct(pct)}
                    disabled={pagado}
                    className={`py-2.5 px-1 rounded-xl text-center border transition-all disabled:opacity-60 ${
                      propinaPct === pct
                        ? 'bg-[#8B4513] text-white border-[#8B4513] shadow-xs'
                        : 'bg-[#FAF8F5] border-[#E5DCD3] hover:bg-white hover:border-[#D5C7BA]'
                    }`}
                  >
                    <span className="block text-sm font-black">{pct}%</span>
                    <span className={`block text-[10px] font-semibold ${propinaPct === pct ? 'text-amber-200' : 'text-[#8C7D73]'}`}>
                      {fmt(Math.round((totales.base * pct) / 100))}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#FAF8F5] border border-[#E5DCD3] rounded-2xl p-4 flex items-center justify-between" aria-live="polite">
              <div>
                <span className="text-xs font-black block uppercase tracking-wide">Total a cobrar</span>
                <span className="text-[11px] text-[#8C7D73] font-medium">Incluye IVA y Propina</span>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-[#7B3F00] leading-none block">{fmt(totales.total)}</span>
                <span className="text-[10px] text-[#8C7D73] font-bold uppercase tracking-wider">Pesos Mexicanos</span>
              </div>
            </div>
          </section>
        </div>

        {/* ===== DERECHA: Modalidad, Método, Acciones ===== */}
        <div className="space-y-5 lg:sticky lg:top-24">

          <section className="bg-white border border-[#E5DCD3] rounded-2xl p-5 space-y-3 shadow-2xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider">Modalidad de Cobro</h3>
            <div className="grid grid-cols-2 gap-2 bg-[#EDE3D8] p-1 rounded-xl">
              {([
                { id: 'completo', label: 'Cobro Completo (1 Pago)', icon: Wallet },
                { id: 'dividir', label: `Dividir Cuenta (${comanda.comensales} Pax)`, icon: Split },
              ] as const).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setModalidad(id)}
                  disabled={pagado}
                  className={`py-2.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    modalidad === id ? 'bg-white text-[#7B3F00] shadow-xs' : 'text-[#6E5A4E] hover:text-[#1E110A]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
            {modalidad === 'dividir' && (
              <p className="text-xs text-[#6E5A4E] bg-[#FFF7ED] border border-[#FED7AA] rounded-lg px-3 py-2">
                Cada comensal paga <strong className="text-[#7B3F00]">{fmt(porPersona)}</strong> ({comanda.comensales} pagos)
              </p>
            )}
          </section>

          <section className="bg-white border border-[#E5DCD3] rounded-2xl p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider">Método de Pago</h3>
              <span className="text-[11px] text-[#8C7D73]">Toque para seleccionar</span>
            </div>

            <div className="space-y-2">
              {METODOS.map(({ id, titulo, detalle, icon: Icon, color }) => {
                const activo = metodo === id;
                return (
                  <button
                    key={id}
                    onClick={() => setMetodo(id)}
                    disabled={pagado}
                    className={`w-full p-3.5 rounded-xl flex items-center justify-between transition-all text-left ${
                      activo
                        ? 'bg-[#FFF7ED] border-2 border-[#8B4513] shadow-xs'
                        : 'bg-white border-2 border-[#E5DCD3] hover:border-[#D5C7BA]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-white border border-[#E5DCD3] flex items-center justify-center ${color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{titulo}</p>
                        <p className="text-[11px] text-[#8C7D73]">{detalle}</p>
                      </div>
                    </div>
                    {activo && (
                      <span className="bg-[#8B4513] text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Seleccionado
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <button
              onClick={() => setPagado(true)}
              disabled={pagado}
              className={`w-full py-4 rounded-2xl font-black text-base shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
                pagado ? 'bg-[#059669] text-white cursor-default' : 'bg-[#7B3F00] hover:bg-[#683500] text-white'
              }`}
            >
              {pagado ? <CheckCircle2 className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
              <span>{pagado ? 'Pago registrado ✓' : `Procesar Pago (${fmt(totales.total)} MXN)`}</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => openTicketModal(activeTableId || 'M04')}
                className="py-2.5 px-3 bg-white border border-[#D5C7BA] hover:bg-stone-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4 text-[#8C7D73]" />
                Imprimir Ticket
              </button>
              <button
                onClick={handleLiberarMesa}
                disabled={!pagado}
                title={pagado ? '' : 'Primero procesa el pago'}
                className="py-2.5 px-3 bg-[#EDE3D8] hover:bg-[#E3D5C6] rounded-xl text-xs font-bold text-[#7B3F00] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DoorOpen className="w-4 h-4" />
                Liberar Mesa {comanda.mesa}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
