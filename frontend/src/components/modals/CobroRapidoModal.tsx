import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../Logo';
import { AlertaBarraPopover } from '../AlertaBarraPopover';
import { UsuarioPerfilNavbar } from '../UsuarioPerfilNavbar';
import { ReceiptPrinter, type ReceiptPrinterStage } from '../ui/ReceiptPrinter';
import logoImg from '../../img/logo.png';
import {
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
  ChevronDown,
  Pencil,
  DoorOpen,
  Send,
} from 'lucide-react';

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.15 1.59 5.95L0 24l6.33-1.66a11.86 11.86 0 0 0 5.73 1.46h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.45-8.42Zm-8.46 18.3h-.01a9.87 9.87 0 0 1-5.04-1.38l-.36-.21-3.76.99 1-3.66-.24-.38a9.88 9.88 0 0 1-1.51-5.24c0-5.45 4.44-9.89 9.9-9.89 2.64 0 5.13 1.03 7 2.9a9.84 9.84 0 0 1 2.9 7c0 5.45-4.44 9.87-9.88 9.87Zm5.42-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35Z" />
  </svg>
);

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/* ---------- Configuración ---------- */
const IVA = 0.16;
const DESCUENTOS = [0, 5, 10, 15, 20];
const PROPINAS = [0, 10, 15, 20];
const PROCESSING_MS = 1400;
const PRINTING_MS = 2000;

const MESES_TICKET = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

const formatFechaTicket = () => {
  const now = new Date();
  const dia = now.getDate().toString().padStart(2, '0');
  const mes = MESES_TICKET[now.getMonth()];
  const anio = now.getFullYear();
  const hora = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${dia} ${mes} ${anio} · ${hora}`;
};

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
    cerrarCobroModal,
    procesarPagoYLiberar,
    liberarMesaDirectamente,
    activeTableId,
    tables,
    currentUser,
    logout,
  } = useApp();

  const [propinaPct, setPropinaPct] = useState(10);
  const [descuentoPct, setDescuentoPct] = useState(0);
  const [menuDescuentoAbierto, setMenuDescuentoAbierto] = useState(false);
  const [metodo, setMetodo] = useState<MetodoId>('terminal');
  const [pagado, setPagado] = useState(false);
  const [pagoActivo, setPagoActivo] = useState(false);
  const [printerStage, setPrinterStage] = useState<ReceiptPrinterStage>('processing');
  const [printRun, setPrintRun] = useState(0);
  const [fechaPago, setFechaPago] = useState('');
  const [mostrarWhatsApp, setMostrarWhatsApp] = useState(false);
  const [telefonoWhatsApp, setTelefonoWhatsApp] = useState('');

  const bloqueado = pagoActivo || pagado;
  const metodoActual = METODOS.find((m) => m.id === metodo) ?? METODOS[0];

  useEffect(() => {
    if (!pagoActivo) return;
    setPrinterStage('processing');
    const toPrinting = setTimeout(() => setPrinterStage('printing'), PROCESSING_MS);
    const toComplete = setTimeout(() => {
      setPrinterStage('complete');
      setPagado(true);
    }, PROCESSING_MS + PRINTING_MS);

    return () => {
      clearTimeout(toPrinting);
      clearTimeout(toComplete);
    };
  }, [pagoActivo, printRun]);

  useEffect(() => {
    if (!isCobroModalOpen) {
      setPagoActivo(false);
      setPagado(false);
      setPrinterStage('processing');
      setMostrarWhatsApp(false);
      setTelefonoWhatsApp('');
    }
  }, [isCobroModalOpen]);

  const activeTable = tables.find((t) => t.id === activeTableId);

  const comandaItems =
    activeTable?.currentOrder && activeTable.currentOrder.items.length > 0
      ? activeTable.currentOrder.items.map((it, idx) => ({
          id: idx + 1,
          cantidad: it.quantity,
          nombre: it.name,
          precioCents: Math.round(it.price * 100),
          modificadores: [it.selectedOption, it.notes].filter(Boolean) as string[],
          categoria: 'Menú ¡Hola, Café!',
        }))
      : COMANDA_DEFAULT.items;

  const comanda = {
    ...COMANDA_DEFAULT,
    mesa: activeTable ? activeTable.number.toString().padStart(2, '0') : COMANDA_DEFAULT.mesa,
    ticket: activeTable?.currentOrder?.folio || COMANDA_DEFAULT.ticket,
    mesero: activeTable?.waiterName || currentUser?.name || COMANDA_DEFAULT.mesero,
    items: comandaItems,
  };

  const totales = useMemo(() => {
    const subtotal = comanda.items.reduce((s, it) => s + it.cantidad * it.precioCents, 0);
    const descuento = Math.round((subtotal * descuentoPct) / 100);
    const base = subtotal - descuento;
    const propina = Math.round((base * propinaPct) / 100);
    const iva = Math.round(base * IVA);
    return { subtotal, descuento, base, propina, iva, total: base + iva + propina };
  }, [comanda.items, descuentoPct, propinaPct]);

  const lineas = comanda.items.length;
  const articulos = comanda.items.reduce((s, it) => s + it.cantidad, 0);

  const handleProcesarPago = () => {
    setMenuDescuentoAbierto(false);
    setFechaPago(formatFechaTicket());
    setPagoActivo(true);
    setPrintRun((n) => n + 1);
  };

  const handleCerrar = () => {
    setPagoActivo(false);
    setPagado(false);
    setPrinterStage('processing');
    setMostrarWhatsApp(false);
    setTelefonoWhatsApp('');
    cerrarCobroModal();
  };

  const handleImprimirFisico = () => {
    const fecha = fechaPago || formatFechaTicket();
    const logoAbsoluteUrl = new URL(logoImg, window.location.origin).href;
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }

    const itemsRows = comanda.items
      .map(
        (it) => `
          <tr>
            <td class="desc">${it.cantidad}x ${escapeHtml(it.nombre)}</td>
            <td class="amt">${escapeHtml(fmt(it.cantidad * it.precioCents))}</td>
          </tr>`,
      )
      .join('');

    const descuentoRow =
      descuentoPct > 0
        ? `<tr class="muted"><td>Descuento (${descuentoPct}%)</td><td class="amt">-${escapeHtml(fmt(totales.descuento))}</td></tr>`
        : '';

    const propinaRow =
      propinaPct > 0
        ? `<tr class="muted"><td>Propina (${propinaPct}%)</td><td class="amt">${escapeHtml(fmt(totales.propina))}</td></tr>`
        : '';

    const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Ticket #${comanda.ticket} - ¡Hola, Café!</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 4mm;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      color: #111;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace;
      font-size: 12px;
      line-height: 1.45;
    }
    .ticket {
      width: 72mm;
      margin: 0 auto;
      padding: 6px 2px;
    }
    .center { text-align: center; }
    .brand {
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.12em;
      margin: 0;
    }
    .sub {
      font-size: 11px;
      color: #555;
      margin: 2px 0 0;
    }
    hr {
      border: 0;
      border-top: 1px dashed #777;
      margin: 10px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    td {
      padding: 2px 0;
      vertical-align: top;
    }
    .desc {
      padding-right: 8px;
    }
    .amt {
      text-align: right;
      white-space: nowrap;
    }
    .muted {
      color: #444;
    }
    .total td {
      font-weight: 700;
      font-size: 13px;
      padding-top: 6px;
    }
    .meta {
      font-size: 11px;
      color: #444;
    }
    .code {
      margin-top: 14px;
      font-size: 10px;
      letter-spacing: 0.28em;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="center">
      <img src="${logoAbsoluteUrl}" alt="¡Hola, Café!" style="width:110px;height:110px;object-fit:contain;margin:0 auto 10px;display:block;border-radius:14px;" />
      <p class="brand">¡HOLA, CAFÉ!</p>
      <p class="sub">Café Central · Gracias por tu visita</p>
    </div>
    <hr />
    <table>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>
    <hr />
    <table>
      <tbody>
        <tr class="muted"><td>Subtotal</td><td class="amt">${escapeHtml(fmt(totales.subtotal))}</td></tr>
        ${descuentoRow}
        <tr class="muted"><td>IVA (16%)</td><td class="amt">${escapeHtml(fmt(totales.iva))}</td></tr>
        ${propinaRow}
        <tr class="total"><td>Total pagado</td><td class="amt">${escapeHtml(fmt(totales.total))}</td></tr>
      </tbody>
    </table>
    <hr />
    <table class="meta">
      <tbody>
        <tr><td>Folio</td><td class="amt">#${comanda.ticket}</td></tr>
        <tr><td>Mesa / Mesero</td><td class="amt">M${escapeHtml(comanda.mesa)} · ${escapeHtml(comanda.mesero)}</td></tr>
        <tr><td>Pagado con</td><td class="amt">${escapeHtml(metodoActual.titulo)}</td></tr>
        <tr><td>Fecha</td><td class="amt">${escapeHtml(fecha)}</td></tr>
      </tbody>
    </table>
    <div class="center">
      <p class="code">HC ${comanda.ticket}</p>
      <p class="sub">Este ticket no es un comprobante fiscal.</p>
    </div>
  </div>
</body>
</html>`;

    doc.open();
    doc.write(html);
    doc.close();

    const cleanup = () => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };

    const triggerPrint = () => {
      const win = iframe.contentWindow;
      if (!win) {
        cleanup();
        return;
      }
      win.onafterprint = cleanup;
      win.focus();
      win.print();
      setTimeout(cleanup, 60000);
    };

    setTimeout(triggerPrint, 120);
  };

  const handleEnviarWhatsApp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fecha = fechaPago || formatFechaTicket();
    const lineasItems = comanda.items
      .map((it) => `• ${it.cantidad}x ${it.nombre} — ${fmt(it.cantidad * it.precioCents)}`)
      .join('\n');

    const lineasMensaje = [
      '*¡Hola, Café!* ☕',
      '_Ticket de compra_',
      '──────────────────',
      `*Folio:* #${comanda.ticket}`,
      `*Mesa:* ${comanda.mesa}`,
      `*Mesero:* ${comanda.mesero}`,
      `*Fecha:* ${fecha}`,
      '──────────────────',
      lineasItems,
      '──────────────────',
      `Subtotal: ${fmt(totales.subtotal)}`,
      ...(descuentoPct > 0 ? [`Descuento (${descuentoPct}%): -${fmt(totales.descuento)}`] : []),
      `IVA (16%): ${fmt(totales.iva)}`,
      ...(propinaPct > 0 ? [`Propina (${propinaPct}%): ${fmt(totales.propina)}`] : []),
      `*Total pagado: ${fmt(totales.total)} MXN*`,
      `*Pagado con:* ${metodoActual.titulo}`,
      '──────────────────',
      '¡Gracias por tu visita!',
    ];

    const soloDigitos = telefonoWhatsApp.replace(/\D/g, '');
    const numeroDestino =
      soloDigitos.length === 10 ? `52${soloDigitos}` : soloDigitos;
    const baseUrl = numeroDestino ? `https://wa.me/${numeroDestino}` : 'https://wa.me/';
    const url = `${baseUrl}?text=${encodeURIComponent(lineasMensaje.join('\n'))}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleLiberarMesa = () => {
    if (activeTableId) {
      if (activeTable?.currentOrder && activeTable.currentOrder.items.length > 0) {
        procesarPagoYLiberar(
          activeTableId,
          descuentoPct,
          propinaPct,
          metodoActual.titulo as 'Terminal Bancaria' | 'Efectivo en Mesa' | 'Transferencia QR / CoDi'
        );
      } else {
        liberarMesaDirectamente(activeTableId);
      }
    }
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
          <AlertaBarraPopover />

          <UsuarioPerfilNavbar />

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
                      disabled={bloqueado}
                      className="flex items-center gap-1 text-[11px] font-bold text-[#8B4513] hover:text-[#DF7B1B] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Pencil className="w-3 h-3" />
                      Modificar
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="px-4 pb-4 relative">
              <button
                type="button"
                onClick={() => setMenuDescuentoAbierto((v) => !v)}
                disabled={bloqueado}
                className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-between transition-colors disabled:opacity-50 ${
                  descuentoPct > 0
                    ? 'bg-[#7B3F00] text-white border-[#7B3F00]'
                    : 'bg-white border-[#D5C7BA] text-[#1E110A] hover:bg-stone-50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-amber-500" />
                  <span>{descuentoPct > 0 ? `Descuento aplicado: ${descuentoPct}%` : 'Aplicar Descuento (0%)'}</span>
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${menuDescuentoAbierto ? 'rotate-180' : ''}`} />
              </button>

              {menuDescuentoAbierto && !bloqueado && (
                <div className="mt-2 bg-white border border-[#D5C7BA] rounded-xl shadow-lg p-1.5 grid grid-cols-5 gap-1.5 animate-in fade-in duration-100">
                  {DESCUENTOS.map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        setDescuentoPct(pct);
                        setMenuDescuentoAbierto(false);
                      }}
                      className={`py-2 rounded-lg text-xs font-black transition-all ${
                        descuentoPct === pct
                          ? 'bg-[#8B4513] text-white shadow-xs'
                          : 'bg-[#FAF8F5] text-[#1E110A] hover:bg-[#EFE6DC]'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              )}
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
              {descuentoPct > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#786B63]">Descuento ({descuentoPct}%)</span>
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
                    disabled={bloqueado}
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

        {/* ===== DERECHA: Método / Impresora de Ticket y Acciones ===== */}
        <div className="space-y-5 lg:sticky lg:top-24">

          <AnimatePresence mode="wait">
            {!pagoActivo ? (
              <motion.section
                key="selector-metodo"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="bg-white border border-[#E5DCD3] rounded-2xl p-5 space-y-3 shadow-2xs"
              >
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
                        disabled={bloqueado}
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
              </motion.section>
            ) : (
              <motion.section
                key="impresora-ticket"
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
                className="bg-white/75 border border-[#E5DCD3] rounded-2xl px-4 pt-6 pb-2 shadow-2xs flex flex-col items-center"
              >
                <ReceiptPrinter.Root stage={printerStage}>
                  <ReceiptPrinter.Machine>
                    <ReceiptPrinter.Header>
                      <span className="font-mono text-[11px] font-medium tracking-[0.12em] text-grayscale-1/80">
                        HOLA CAFÉ·POS
                      </span>
                    </ReceiptPrinter.Header>

                    <ReceiptPrinter.Screen>
                      <div className="space-y-4">
                        <div className="flex justify-between gap-4 text-sm">
                          <div className="min-w-0">
                            <p className="font-medium truncate">Mesa {comanda.mesa} · Ticket #{comanda.ticket}</p>
                            <p className="text-grayscale-8 text-xs truncate">{metodoActual.titulo}</p>
                          </div>
                          <strong className="font-medium shrink-0">{fmt(totales.total)}</strong>
                        </div>
                        <ReceiptPrinter.Status>
                          {printerStage === 'processing'
                            ? 'Generando ticket...'
                            : printerStage === 'printing'
                              ? 'Imprimiendo tu ticket...'
                              : 'Ticket generado'}
                        </ReceiptPrinter.Status>
                      </div>
                    </ReceiptPrinter.Screen>
                  </ReceiptPrinter.Machine>

                  <ReceiptPrinter.Output>
                    <ReceiptPrinter.Paper id="printable-ticket" className="text-[12px] leading-relaxed">
                      <img
                        src={logoImg}
                        alt="¡Hola, Café!"
                        className="w-28 h-28 mx-auto mb-3 object-contain rounded-xl"
                      />
                      <p className="text-center text-[11px] font-semibold tracking-[0.2em]">¡HOLA, CAFÉ!</p>
                      <p className="mt-1 text-center text-[11px] text-grayscale-11">Gracias por tu visita</p>
                      <hr className="my-4 border-dashed border-grayscale-8" />
                      <dl className="space-y-1.5">
                        {comanda.items.map((it) => (
                          <div key={it.id} className="flex justify-between gap-4">
                            <dt className="truncate">{it.cantidad}x {it.nombre}</dt>
                            <dd className="shrink-0">{fmt(it.cantidad * it.precioCents)}</dd>
                          </div>
                        ))}
                      </dl>
                      <hr className="my-4 border-dashed border-grayscale-8" />
                      <dl className="space-y-1.5">
                        <div className="flex justify-between gap-4 text-grayscale-11">
                          <dt>Subtotal</dt>
                          <dd>{fmt(totales.subtotal)}</dd>
                        </div>
                        {descuentoPct > 0 && (
                          <div className="flex justify-between gap-4 text-grayscale-11">
                            <dt>Descuento ({descuentoPct}%)</dt>
                            <dd>-{fmt(totales.descuento)}</dd>
                          </div>
                        )}
                        <div className="flex justify-between gap-4 text-grayscale-11">
                          <dt>IVA (16%)</dt>
                          <dd>{fmt(totales.iva)}</dd>
                        </div>
                        {propinaPct > 0 && (
                          <div className="flex justify-between gap-4 text-grayscale-11">
                            <dt>Propina ({propinaPct}%)</dt>
                            <dd>{fmt(totales.propina)}</dd>
                          </div>
                        )}
                        <div className="flex justify-between gap-4 font-semibold pt-1">
                          <dt>Total pagado</dt>
                          <dd>{fmt(totales.total)}</dd>
                        </div>
                      </dl>
                      <hr className="my-4 border-dashed border-grayscale-8" />
                      <dl className="space-y-1 text-[11px] text-grayscale-11">
                        <div className="flex justify-between gap-4">
                          <dt>Folio</dt>
                          <dd>#{comanda.ticket}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt>Mesa / Mesero</dt>
                          <dd>M{comanda.mesa} · {comanda.mesero}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt>Pagado con</dt>
                          <dd className="truncate">{metodoActual.titulo}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt>Fecha</dt>
                          <dd>{fechaPago}</dd>
                        </div>
                      </dl>
                      <p className="mt-6 text-center text-[10px] tracking-[0.3em] text-grayscale-8">
                        HC {comanda.ticket}
                      </p>
                    </ReceiptPrinter.Paper>
                  </ReceiptPrinter.Output>
                </ReceiptPrinter.Root>
              </motion.section>
            )}
          </AnimatePresence>

          <section className="space-y-3">
            <button
              onClick={handleProcesarPago}
              disabled={bloqueado}
              className={`w-full py-4 rounded-2xl font-black text-base shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
                pagado
                  ? 'bg-[#059669] text-white cursor-default'
                  : pagoActivo
                    ? 'bg-[#8B4513] text-white cursor-wait opacity-90'
                    : 'bg-[#7B3F00] hover:bg-[#683500] text-white'
              }`}
            >
              {pagado ? <CheckCircle2 className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
              <span>
                {pagado
                  ? 'Ticket generado ✓'
                  : pagoActivo
                    ? printerStage === 'processing'
                      ? 'Generando ticket...'
                      : 'Imprimiendo ticket...'
                    : `Generar ticket (${fmt(totales.total)} MXN)`}
              </span>
            </button>

            {pagoActivo && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleImprimirFisico}
                    disabled={printerStage !== 'complete'}
                    className="py-2.5 px-3 bg-white border border-[#D5C7BA] hover:bg-stone-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Printer className="w-4 h-4 text-[#8C7D73]" />
                    Imprimir físico
                  </button>
                  <button
                    type="button"
                    onClick={() => setMostrarWhatsApp((v) => !v)}
                    disabled={printerStage !== 'complete'}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border ${
                      mostrarWhatsApp
                        ? 'bg-[#16A34A] border-[#16A34A] text-white'
                        : 'bg-[#ECFDF5] border-[#86EFAC] text-[#15803D] hover:bg-[#DCFCE7]'
                    }`}
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    Enviar por WhatsApp
                  </button>
                </div>

                {mostrarWhatsApp && printerStage === 'complete' && (
                  <form
                    onSubmit={handleEnviarWhatsApp}
                    className="bg-white border border-[#BBF7D0] rounded-xl p-3 space-y-2 shadow-2xs"
                  >
                    <label className="block text-[11px] font-bold text-[#15803D]">
                      Número de WhatsApp del cliente (opcional)
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center flex-1 border border-[#D5C7BA] rounded-lg overflow-hidden bg-[#FAF8F5] focus-within:border-[#16A34A] focus-within:bg-white">
                        <span className="px-2.5 text-xs font-bold text-[#6E5A4E] border-r border-[#E5DCD3] select-none">
                          +52
                        </span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          placeholder="10 dígitos (o dejar vacío)"
                          value={telefonoWhatsApp}
                          onChange={(e) => setTelefonoWhatsApp(e.target.value)}
                          className="w-full px-2.5 py-2 text-xs bg-transparent outline-none text-[#1E110A] placeholder:text-[#A8988D]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-3.5 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Enviar
                      </button>
                    </div>
                  </form>
                )}

                <button
                  type="button"
                  onClick={handleLiberarMesa}
                  disabled={!pagado}
                  title={pagado ? '' : 'Primero genera el ticket'}
                  className="w-full py-2.5 px-3 bg-[#EDE3D8] hover:bg-[#E3D5C6] rounded-xl text-xs font-bold text-[#7B3F00] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <DoorOpen className="w-4 h-4" />
                  Liberar Mesa {comanda.mesa}
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};
