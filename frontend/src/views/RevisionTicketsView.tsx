import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Info,
  Printer,
  ReceiptText,
  Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminNotificacionesBell } from '../components/AdminNotificacionesBell';
import { UsuarioPerfilNavbar } from '../components/UsuarioPerfilNavbar';

/* ---------------------------------------------------------------------------
   Tipos y datos
   ------------------------------------------------------------------------ */

type MetodoPago = 'Efectivo' | 'Tarjeta' | 'Transferencia';
type EstadoTicket = 'Pagado' | 'Cancelado';
type FiltroTickets = 'todos' | 'pendientes' | 'revisados' | MetodoPago | 'cancelados';

interface TicketLinea {
  cantidad: number;
  nombre: string;
  detalle: string;
  precioUnitario: number;
}

interface TicketDia {
  id: string;
  folio: string;
  hora: string;
  pago: MetodoPago;
  estado: EstadoTicket;
  mesa: string;
  mesero: string;
  personas: number;
  lineas: TicketLinea[];
  total: number;
}

interface RevisionDia {
  revisados: string[];
  efectivoContado: string;
  finalizado: boolean;
}

const FONDO_CAJA = 500;
const MAX_EFECTIVO_CONTADO = 100_000_000;
const IVA = 0.16;
const STORAGE_KEY = 'hc-revision-tickets';

const mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const fmt = (n: number) => mxn.format(n);

const aClaveFecha = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const desdeClaveFecha = (clave: string) => {
  const [y, m, d] = clave.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const cargarRevisiones = (): Record<string, RevisionDia> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const escapeHtml = (v: string) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ---------------------------------------------------------------------------
   Vista
   ------------------------------------------------------------------------ */

export const RevisionTicketsView: React.FC = () => {
  const { agregarAdminNotificacion, ticketsRegistrados, cortesCaja } = useApp();

  const [fecha, setFecha] = useState(() => aClaveFecha(new Date()));
  const [corteSeleccionadoId, setCorteSeleccionadoId] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<FiltroTickets>('todos');
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(null);
  const [revisiones, setRevisiones] = useState<Record<string, RevisionDia>>(cargarRevisiones);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(revisiones));
  }, [revisiones]);

  const cortesDelDia = useMemo(
    () => cortesCaja.filter((c) => c.fechaClave === fecha),
    [cortesCaja, fecha]
  );

  const tickets: TicketDia[] = useMemo(() => {
    return ticketsRegistrados
      .filter(
        (t) =>
          t.fechaClave === fecha &&
          Boolean(t.corteId) &&
          (corteSeleccionadoId === 'todos' || t.corteId === corteSeleccionadoId)
      )
      .map((t) => ({
        id: t.id,
        folio: t.folio,
        hora: t.hora,
        pago: t.pago,
        estado: t.estado,
        mesa: t.mesa,
        mesero: t.mesero,
        personas: t.personas,
        lineas: t.lineas,
        total: t.total,
      }));
  }, [ticketsRegistrados, fecha, corteSeleccionadoId]);

  const revisionDia: RevisionDia = revisiones[fecha] ?? { revisados: [], efectivoContado: '', finalizado: false };
  const revisados = useMemo(() => new Set(revisionDia.revisados), [revisionDia.revisados]);

  useEffect(() => {
    setCorteSeleccionadoId('todos');
    setBusqueda('');
    setFiltro('todos');
  }, [fecha]);

  useEffect(() => {
    if (!tickets.some((t) => t.id === seleccionadoId)) {
      setSeleccionadoId(tickets[0]?.id ?? null);
    }
  }, [tickets, seleccionadoId]);

  const actualizarRevision = (cambios: Partial<RevisionDia>) => {
    setRevisiones((prev) => ({
      ...prev,
      [fecha]: { ...(prev[fecha] ?? { revisados: [], efectivoContado: '', finalizado: false }), ...cambios },
    }));
  };

  const alternarRevisado = (id: string) => {
    if (revisionDia.finalizado) return;
    const nuevo = new Set(revisados);
    if (nuevo.has(id)) nuevo.delete(id);
    else nuevo.add(id);
    actualizarRevision({ revisados: Array.from(nuevo) });
  };

  /* ---- Métricas ---- */
  const pagados = tickets.filter((t) => t.estado === 'Pagado');
  const ventaNeta = pagados.reduce((s, t) => s + t.total, 0);
  const porMetodo = (m: MetodoPago) => pagados.filter((t) => t.pago === m).reduce((s, t) => s + t.total, 0);
  const totalEfectivo = porMetodo('Efectivo');
  const totalTarjeta = porMetodo('Tarjeta');
  const totalTransferencia = porMetodo('Transferencia');
  const cuentaEfectivo = pagados.filter((t) => t.pago === 'Efectivo').length;
  const numRevisados = tickets.filter((t) => revisados.has(t.id)).length;
  const pendientes = tickets.length - numRevisados;

  const hayCorteRegistrado = cortesDelDia.length > 0 && tickets.length > 0;
  const efectivoEsperado = hayCorteRegistrado ? FONDO_CAJA + totalEfectivo : 0;
  const contadoNum = parseFloat(revisionDia.efectivoContado.replace(/[^0-9.]/g, ''));
  const hayContado = hayCorteRegistrado && !Number.isNaN(contadoNum);
  const diferencia = hayContado ? contadoNum - efectivoEsperado : 0;

  const handleEfectivoContadoChange = (raw: string) => {
    const limpio = raw.replace(/[^0-9.]/g, '');
    // Permitir solo un punto decimal y máximo 2 decimales
    const partes = limpio.split('.');
    const normalizado =
      partes.length > 1 ? `${partes[0]}.${partes.slice(1).join('').slice(0, 2)}` : partes[0];
    if (normalizado === '' || normalizado === '.') {
      actualizarRevision({ efectivoContado: normalizado });
      return;
    }
    const valorNum = parseFloat(normalizado);
    if (!Number.isNaN(valorNum) && valorNum > MAX_EFECTIVO_CONTADO) {
      actualizarRevision({ efectivoContado: String(MAX_EFECTIVO_CONTADO) });
      return;
    }
    actualizarRevision({ efectivoContado: normalizado });
  };

  /* ---- Filtro de tabla ---- */
  const ticketsFiltrados = tickets.filter((t) => {
    const q = busqueda.trim().toLowerCase();
    if (q && !t.folio.toLowerCase().includes(q) && !t.mesero.toLowerCase().includes(q)) return false;
    switch (filtro) {
      case 'pendientes': return !revisados.has(t.id);
      case 'revisados': return revisados.has(t.id);
      case 'cancelados': return t.estado === 'Cancelado';
      case 'Efectivo':
      case 'Tarjeta':
      case 'Transferencia': return t.pago === filtro;
      default: return true;
    }
  });

  const seleccionado = tickets.find((t) => t.id === seleccionadoId) ?? null;

  /* ---- Fecha ---- */
  const fechaObj = desdeClaveFecha(fecha);
  const esHoy = fecha === aClaveFecha(new Date());
  const diaSemana = fechaObj.toLocaleDateString('es-MX', { weekday: 'long' });
  const diaSemanaCap = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
  const fechaCorta = fechaObj.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const numCorte = `#${String(fechaObj.getDate()).padStart(2, '0')}`;

  const moverDia = (delta: number) => {
    const d = desdeClaveFecha(fecha);
    d.setDate(d.getDate() + delta);
    const nueva = aClaveFecha(d);
    if (nueva > aClaveFecha(new Date())) return;
    setFecha(nueva);
  };

  /* ---- Acciones ---- */
  const exportarCorte = () => {
    const filas = [
      ['Folio', 'Hora', 'Mesa', 'Mesero', 'Pago', 'Estado', 'Total', 'Revisado'],
      ...tickets.map((t) => [
        t.folio, t.hora, t.mesa, t.mesero, t.pago, t.estado, t.total.toFixed(2), revisados.has(t.id) ? 'Sí' : 'No',
      ]),
      [],
      ['Efectivo', '', '', '', '', '', totalEfectivo.toFixed(2)],
      ['Tarjeta', '', '', '', '', '', totalTarjeta.toFixed(2)],
      ['Transferencia', '', '', '', '', '', totalTransferencia.toFixed(2)],
      ['Venta neta', '', '', '', '', '', ventaNeta.toFixed(2)],
    ];
    const csv = '\uFEFF' + filas.map((f) => f.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `corte-${fecha}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const imprimirTicket = (t: TicketDia) => {
    const iframe = document.createElement('iframe');
    Object.assign(iframe.style, { position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0' });
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument;
    if (!doc) return;
    const filas = t.lineas
      .map((l) => `<tr><td>${l.cantidad} × ${escapeHtml(l.nombre)}</td><td class="r">${fmt(l.cantidad * l.precioUnitario)}</td></tr>`)
      .join('');
    doc.open();
    doc.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Ticket ${t.folio}</title>
      <style>@page{size:80mm auto;margin:4mm}body{font-family:ui-monospace,Consolas,monospace;font-size:12px;margin:0;color:#111}
      .t{width:72mm;margin:0 auto}.c{text-align:center}table{width:100%;border-collapse:collapse}td{padding:2px 0}.r{text-align:right;white-space:nowrap}
      hr{border:0;border-top:1px dashed #777;margin:8px 0}.b{font-weight:700;font-size:14px}</style></head><body><div class="t">
      <p class="c b">¡HOLA, CAFÉ!</p><p class="c">Ticket ${t.folio} · ${escapeHtml(t.estado)}</p><hr/>
      <table><tr><td>Fecha</td><td class="r">${fechaCorta} · ${t.hora}</td></tr><tr><td>Mesa / Mesero</td><td class="r">${t.mesa} · ${escapeHtml(t.mesero)}</td></tr>
      <tr><td>Forma de pago</td><td class="r">${t.pago}</td></tr></table><hr/><table>${filas}</table><hr/>
      <table><tr class="b"><td>Total</td><td class="r">${fmt(t.total)}</td></tr></table><hr/><p class="c">Copia de revisión de corte</p></div></body></html>`);
    doc.close();
    setTimeout(() => {
      const w = iframe.contentWindow;
      if (!w) return;
      w.onafterprint = () => iframe.remove();
      w.focus();
      w.print();
      setTimeout(() => iframe.remove(), 60000);
    }, 120);
  };

  const finalizarRevision = () => {
    actualizarRevision({ finalizado: true });
    agregarAdminNotificacion({
      tipo: 'corte',
      titulo: `Corte ${numCorte} verificado`,
      mensaje: `${tickets.length} tickets revisados · Venta neta ${fmt(ventaNeta)}${
        diferencia !== 0 ? ` · Diferencia ${diferencia > 0 ? '+' : ''}${fmt(diferencia)}` : ''
      }`,
      vistaDestino: 'revision-tickets',
    });
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `Corte ${numCorte} verificado`,
      showConfirmButton: false,
      timer: 2500,
      background: '#FAF8F5',
      color: '#1E110A',
    });
  };

  const puedeFinalizar = tickets.length > 0 && pendientes === 0 && hayContado && !revisionDia.finalizado;

  const mensajeFinal = revisionDia.finalizado
    ? 'La revisión de este corte ya fue finalizada.'
    : tickets.length === 0
      ? 'No hay tickets registrados para este día.'
      : pendientes > 0
        ? `Revisa los ${pendientes} ticket${pendientes === 1 ? '' : 's'} pendiente${pendientes === 1 ? '' : 's'} y aclara el faltante antes de finalizar.`
        : !hayContado
          ? 'Captura el efectivo contado en caja para finalizar.'
          : 'Todo listo. Puedes finalizar la revisión del corte.';

  const badgeEstado = (t: TicketDia) =>
    t.estado === 'Pagado'
      ? 'bg-[#E3F4EA] text-[#16794A]'
      : 'bg-[#FDE8E8] text-[#C62828]';

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#1E110A] flex flex-row font-sans selection:bg-amber-100">
      <AdminSidebar currentSubTitle="REVISIÓN DE TICKETS" />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-[#E7DDD3] px-8 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#1E110A] font-bold">Revisión de tickets</span>
          </div>
          <div className="flex items-center gap-4">
            <AdminNotificacionesBell />
            <UsuarioPerfilNavbar />
          </div>
        </header>

        <main className="p-8 max-w-6xl w-full mx-auto space-y-5 flex-1">
          {/* Título */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-[#1E110A] tracking-tight">Corte de caja detallado</h1>
              <p className="text-xs sm:text-sm text-[#786B63] mt-1 font-medium">
                Revisa las ventas del día y corrobora cada ticket antes de cerrar.
              </p>
            </div>
            <button
              type="button"
              onClick={exportarCorte}
              disabled={tickets.length === 0}
              className="self-start px-4 py-2.5 bg-white border border-[#D5C7BA] hover:bg-stone-50 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar corte
            </button>
          </div>

          {/* Selector de día */}
          <section className="bg-white border border-[#E5DCD3] rounded-2xl px-5 py-4 shadow-2xs flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap items-end gap-6">
              <div>
                <label className="block text-[11px] font-semibold text-[#8C7D73] mb-1.5">Día a consultar</label>
                <div className="flex items-center gap-2">
                  <label className="relative flex items-center gap-2 px-3 py-2 border border-[#D5C7BA] rounded-xl bg-[#FAF8F5] text-xs font-bold cursor-pointer focus-within:border-[#DF7B1B]">
                    <CalendarDays className="w-4 h-4 text-[#DF7B1B]" />
                    <input
                      type="date"
                      value={fecha}
                      max={aClaveFecha(new Date())}
                      onChange={(e) => e.target.value && setFecha(e.target.value)}
                      className="bg-transparent outline-none text-[#1E110A] font-bold cursor-pointer"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => moverDia(-1)}
                    className="w-8 h-8 rounded-lg border border-[#E5DCD3] bg-white hover:bg-stone-50 flex items-center justify-center"
                    title="Día anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moverDia(1)}
                    disabled={esHoy}
                    className="w-8 h-8 rounded-lg border border-[#E5DCD3] bg-white hover:bg-stone-50 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Día siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="pb-0.5">
                {cortesDelDia.length > 0 ? (
                  <>
                    <p className="text-sm font-black">
                      {diaSemanaCap} · Corte realizado a las{' '}
                      {(corteSeleccionadoId === 'todos'
                        ? cortesDelDia[0]?.horaCorte
                        : cortesDelDia.find((c) => c.id === corteSeleccionadoId)?.horaCorte) ||
                        cortesDelDia[0]?.fecha}{' '}
                      h
                    </p>
                    <p className="text-[11px] text-[#8C7D73]">
                      {corteSeleccionadoId === 'todos'
                        ? `${cortesDelDia.length === 1 ? `Corte ${cortesDelDia[0].id}` : `${cortesDelDia.length} cortes en el día`} · Encargado: ${cortesDelDia[0].mesero}`
                        : (() => {
                            const c = cortesDelDia.find((x) => x.id === corteSeleccionadoId);
                            return c ? `Corte ${c.id} · Encargado: ${c.mesero}` : `Corte ${numCorte}`;
                          })()}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-black">{diaSemanaCap}</p>
                    <p className="text-[11px] text-[#8C7D73]">
                      Sin cortes realizados aún en esta fecha · Realiza un corte desde Caja
                    </p>
                  </>
                )}
              </div>
              {cortesDelDia.length > 1 && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#8C7D73] mb-1.5">Corte del día</label>
                  <select
                    value={corteSeleccionadoId}
                    onChange={(e) => setCorteSeleccionadoId(e.target.value)}
                    className="px-3 py-2 border border-[#D5C7BA] rounded-xl bg-[#FAF8F5] text-xs font-bold text-[#1E110A] outline-none"
                  >
                    <option value="todos">Todos los cortes ({cortesDelDia.length})</option>
                    {cortesDelDia.map((c) => (
                      <option key={c.id} value={c.id}>
                        Corte {c.id} · {c.horaCorte || c.fecha} ({c.mesero})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <span
              className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border ${
                revisionDia.finalizado
                  ? 'bg-[#E3F4EA] border-[#B7E1C8] text-[#16794A]'
                  : 'bg-[#FFF4E5] border-[#F6D3A6] text-[#B45309]'
              }`}
            >
              {revisionDia.finalizado ? 'Corte verificado' : 'Corte por verificar'}
            </span>
          </section>

          {/* Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#E5DCD3] rounded-2xl px-5 py-4 shadow-2xs">
              <span className="block text-[11px] font-semibold text-[#8C7D73]">Venta neta del día</span>
              <span className="block text-2xl font-black leading-tight mt-1">{fmt(ventaNeta)}</span>
              <span className="text-[11px] text-[#8C7D73]">{pagados.length} tickets pagados</span>
            </div>
            <div className="bg-white border border-[#E5DCD3] rounded-2xl px-5 py-4 shadow-2xs">
              <span className="block text-[11px] font-semibold text-[#8C7D73]">Tickets generados</span>
              <span className="block text-3xl font-black leading-tight mt-1">{tickets.length}</span>
              <span className="text-[11px] text-[#8C7D73]">
                {tickets.length - pagados.length > 0 ? `${tickets.length - pagados.length} cancelado(s)` : 'Sin cancelaciones'}
              </span>
            </div>
            <div className="bg-white border border-[#E5DCD3] rounded-2xl px-5 py-4 shadow-2xs">
              <span className="block text-[11px] font-semibold text-[#8C7D73]">Tickets revisados</span>
              <span className="block text-2xl font-black leading-tight mt-1">
                {numRevisados} de {tickets.length}
              </span>
              <span className={`text-[11px] ${pendientes > 0 ? 'text-[#B45309]' : 'text-[#16794A]'}`}>
                {pendientes > 0 ? `${pendientes} pendientes de revisión` : 'Todos revisados'}
              </span>
            </div>
          </div>

          {/* Tabla + detalle */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-5 items-start">
            {/* Tabla */}
            <section className="bg-white border border-[#E5DCD3] rounded-2xl shadow-2xs overflow-hidden">
              <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-black">Tickets del día</h2>
                  <p className="text-[11px] text-[#8C7D73]">Todos los tickets del {fechaCorta}</p>
                </div>
                <span className="text-[11px] font-bold text-[#8C7D73] bg-[#FAF8F5] border border-[#E5DCD3] px-2.5 py-1 rounded-lg">
                  {tickets.length} tickets
                </span>
              </div>

              <div className="px-5 pb-3 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-[180px] border border-[#D5C7BA] rounded-xl px-3 py-2 bg-[#FAF8F5] focus-within:border-[#DF7B1B] focus-within:bg-white">
                  <Search className="w-3.5 h-3.5 text-[#8C7D73]" />
                  <input
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por folio o mesero"
                    className="w-full bg-transparent outline-none text-xs placeholder:text-[#A8988D]"
                  />
                </div>
                <select
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value as FiltroTickets)}
                  className="border border-[#D5C7BA] rounded-xl px-3 py-2 bg-white text-xs font-semibold outline-none focus:border-[#DF7B1B] cursor-pointer"
                >
                  <option value="todos">Todos los tickets</option>
                  <option value="pendientes">Pendientes</option>
                  <option value="revisados">Revisados</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="cancelados">Cancelados</option>
                </select>
                <span className="text-[11px] text-[#8C7D73] font-semibold px-1">{numRevisados} revisados</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-[#8C7D73] font-bold border-y border-[#E5DCD3] uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 pl-5 pr-2">Rev.</th>
                      <th className="py-3 px-2">Ticket</th>
                      <th className="py-3 px-2">Hora</th>
                      <th className="py-3 px-2">Pago</th>
                      <th className="py-3 px-2 text-right">Total</th>
                      <th className="py-3 px-3">Estado</th>
                      <th className="py-3 pr-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5EFEB] font-medium">
                    {ticketsFiltrados.map((t) => {
                      const activo = t.id === seleccionadoId;
                      const revisado = revisados.has(t.id);
                      return (
                        <tr
                          key={t.id}
                          onClick={() => setSeleccionadoId(t.id)}
                          className={`cursor-pointer transition-colors ${
                            activo ? 'bg-[#FFF4E5]' : 'hover:bg-amber-50/30'
                          }`}
                        >
                          <td className={`py-3 pl-5 pr-2 ${activo ? 'border-l-[3px] border-[#DF7B1B] pl-[17px]' : ''}`}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                alternarRevisado(t.id);
                              }}
                              disabled={revisionDia.finalizado}
                              aria-label={revisado ? 'Marcar como pendiente' : 'Marcar como revisado'}
                              className={`w-4 h-4 rounded flex items-center justify-center border transition-colors disabled:cursor-not-allowed ${
                                revisado ? 'bg-[#7B3F00] border-[#7B3F00] text-white' : 'bg-white border-[#BFAF9F] hover:border-[#7B3F00]'
                              }`}
                            >
                              {revisado && <Check className="w-3 h-3" strokeWidth={3} />}
                            </button>
                          </td>
                          <td className="py-3 px-2 font-bold">{t.folio}</td>
                          <td className="py-3 px-2 text-[#786B63]">{t.hora}</td>
                          <td className="py-3 px-2 text-[#786B63]">{t.pago}</td>
                          <td className={`py-3 px-2 text-right font-black ${t.estado === 'Cancelado' ? 'line-through text-[#A8988D]' : ''}`}>
                            {fmt(t.total)}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${badgeEstado(t)}`}>{t.estado}</span>
                          </td>
                          <td className="py-3 pr-4 text-right">
                            <ChevronRight className={`w-4 h-4 inline ${activo ? 'text-[#DF7B1B]' : 'text-[#A8988D]'}`} />
                          </td>
                        </tr>
                      );
                    })}
                    {ticketsFiltrados.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-[#8C7D73]">
                          {tickets.length === 0 ? 'No se generaron tickets este día.' : 'Ningún ticket coincide con el filtro.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-4 border-t border-[#E5DCD3] bg-[#FAF8F5] flex items-center justify-between">
                <span className="text-[11px] text-[#8C7D73]">
                  {ticketsFiltrados.length} de {tickets.length} tickets · Total pagado
                </span>
                <span className="text-lg font-black">{fmt(ventaNeta)}</span>
              </div>
            </section>

            {/* Detalle */}
            <section className="bg-white border border-[#E5DCD3] rounded-2xl shadow-2xs p-5 lg:sticky lg:top-6">
              {seleccionado ? (
                <DetalleTicket
                  ticket={seleccionado}
                  fechaCorta={fechaCorta}
                  revisado={revisados.has(seleccionado.id)}
                  bloqueado={revisionDia.finalizado}
                  onAlternar={() => alternarRevisado(seleccionado.id)}
                  onImprimir={() => imprimirTicket(seleccionado)}
                  badgeClase={badgeEstado(seleccionado)}
                />
              ) : (
                <div className="py-16 text-center text-[#8C7D73] text-xs flex flex-col items-center gap-2">
                  <ReceiptText className="w-8 h-8 text-[#D5C7BA]" />
                  Selecciona un ticket para ver su detalle.
                </div>
              )}
            </section>
          </div>

          {/* Conciliación */}
          <section className="bg-white border border-[#E5DCD3] rounded-2xl shadow-2xs overflow-hidden">
            <div className="px-5 pt-5">
              <h2 className="text-base font-black">Conciliación del corte</h2>
              <p className="text-[11px] text-[#8C7D73]">Importes en MXN. El ticket cancelado no se suma a la venta.</p>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr] gap-4 items-stretch">
              <div className="space-y-2 text-xs self-center">
                <div className="flex justify-between">
                  <span className="text-[#786B63]">Efectivo</span>
                  <span className="font-bold">{fmt(totalEfectivo)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#786B63]">Tarjeta</span>
                  <span className="font-bold">{fmt(totalTarjeta)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#786B63]">Transferencia</span>
                  <span className="font-bold">{fmt(totalTransferencia)}</span>
                </div>
              </div>

              <div className="border border-[#E5DCD3] rounded-xl p-3.5 min-w-0">
                <span className="block text-[11px] font-semibold text-[#8C7D73]">Efectivo esperado</span>
                <span className="block text-xl font-black mt-1 truncate">{fmt(efectivoEsperado)}</span>
                <span className="text-[10px] text-[#8C7D73]">
                  {hayCorteRegistrado
                    ? `Fondo ${fmt(FONDO_CAJA)} + ${cuentaEfectivo} ventas`
                    : 'Sin corte registrado'}
                </span>
              </div>

              <div className={`border border-[#E5DCD3] rounded-xl p-3.5 min-w-0 ${!hayCorteRegistrado ? 'opacity-65' : ''}`}>
                <label className="block text-[11px] font-semibold text-[#8C7D73]">Efectivo contado</label>
                <div
                  className={`mt-1 flex items-center border rounded-lg px-2.5 ${
                    !hayCorteRegistrado || revisionDia.finalizado
                      ? 'border-[#E5DCD3] bg-[#F3EFEA]'
                      : 'border-[#D5C7BA] bg-[#FAF8F5] focus-within:border-[#DF7B1B] focus-within:bg-white'
                  }`}
                >
                  <span className="text-sm font-black text-[#8C7D73]">$</span>
                  <input
                    inputMode="decimal"
                    value={hayCorteRegistrado ? revisionDia.efectivoContado : ''}
                    disabled={revisionDia.finalizado || !hayCorteRegistrado}
                    onChange={(e) => handleEfectivoContadoChange(e.target.value)}
                    placeholder="0.00"
                    maxLength={12}
                    title={
                      !hayCorteRegistrado
                        ? 'Disponible cuando se registre un corte de caja'
                        : 'Máximo $100,000,000.00'
                    }
                    className="w-full min-w-0 bg-transparent outline-none text-lg font-black py-1 pl-1 disabled:cursor-not-allowed"
                  />
                </div>
                <span className="text-[10px] text-[#8C7D73]">
                  {!hayCorteRegistrado
                    ? 'Disponible al registrar un corte'
                    : 'Máx. $100,000,000.00'}
                </span>
              </div>

              <div
                className={`rounded-xl p-3.5 border min-w-0 ${
                  !hayContado
                    ? 'border-[#E5DCD3]'
                    : diferencia === 0
                      ? 'border-[#B7E1C8] bg-[#F1FAF4]'
                      : diferencia < 0
                        ? 'border-[#F5C2C2] bg-[#FDF3F3]'
                        : 'border-[#F6D3A6] bg-[#FFF8EE]'
                }`}
              >
                <span className="block text-[11px] font-semibold text-[#8C7D73]">Diferencia</span>
                <span
                  className={`block text-xl font-black mt-1 truncate ${
                    !hayContado
                      ? 'text-[#A8988D]'
                      : diferencia === 0
                        ? 'text-[#16794A]'
                        : diferencia < 0
                          ? 'text-[#C2410C]'
                          : 'text-[#B45309]'
                  }`}
                  title={!hayContado ? undefined : `${diferencia > 0 ? '+' : diferencia < 0 ? '−' : ''}${fmt(Math.abs(diferencia))}`}
                >
                  {!hayContado ? '—' : `${diferencia > 0 ? '+' : diferencia < 0 ? '−' : ''}${fmt(Math.abs(diferencia))}`}
                </span>
                <span className="text-[10px] text-[#8C7D73]">
                  {!hayCorteRegistrado
                    ? 'Sin corte por conciliar'
                    : !hayContado
                      ? 'Captura el conteo'
                      : diferencia === 0
                        ? 'La caja cuadra'
                        : diferencia < 0
                          ? 'Faltante de efectivo'
                          : 'Sobrante de efectivo'}
                </span>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-[#E5DCD3] bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-[#786B63] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#DF7B1B]" />
                {mensajeFinal}
              </span>
              <button
                type="button"
                onClick={finalizarRevision}
                disabled={!puedeFinalizar}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  revisionDia.finalizado
                    ? 'bg-[#E3F4EA] text-[#16794A] cursor-default'
                    : 'bg-[#7B3F00] hover:bg-[#683500] text-white shadow-sm disabled:bg-[#E7DDD3] disabled:text-[#A8988D] disabled:shadow-none disabled:cursor-not-allowed'
                }`}
              >
                {revisionDia.finalizado && <CheckCircle2 className="w-4 h-4" />}
                {revisionDia.finalizado ? 'Revisión finalizada' : 'Finalizar revisión'}
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------------------
   Panel de detalle
   ------------------------------------------------------------------------ */

interface DetalleTicketProps {
  ticket: TicketDia;
  fechaCorta: string;
  revisado: boolean;
  bloqueado: boolean;
  badgeClase: string;
  onAlternar: () => void;
  onImprimir: () => void;
}

const DetalleTicket: React.FC<DetalleTicketProps> = ({
  ticket,
  fechaCorta,
  revisado,
  bloqueado,
  badgeClase,
  onAlternar,
  onImprimir,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7D73]">Detalle del ticket</span>
        <button
          type="button"
          onClick={onImprimir}
          title="Imprimir copia"
          className="w-8 h-8 rounded-lg border border-[#E5DCD3] hover:bg-stone-50 flex items-center justify-center"
        >
          <Printer className="w-4 h-4 text-[#6E5A4E]" />
        </button>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl font-black flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-[#DF7B1B]" />
            {ticket.folio}
          </h3>
          <p className="text-[11px] text-[#8C7D73] mt-0.5">{fechaCorta} · {ticket.hora} h</p>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${badgeClase}`}>{ticket.estado}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="block text-[10px] text-[#8C7D73] font-semibold">Mesa</span>
          <span className="font-black">{ticket.mesa}</span>
        </div>
        <div>
          <span className="block text-[10px] text-[#8C7D73] font-semibold">Atendió</span>
          <span className="font-black">{ticket.mesero}</span>
        </div>
      </div>

      <div className="flex items-center justify-between bg-[#FAF8F5] border border-[#E5DCD3] rounded-xl px-3.5 py-2.5 text-xs">
        <span className="text-[#786B63]">Forma de pago</span>
        <span className="font-black">{ticket.pago}</span>
      </div>

      <div>
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-[#8C7D73] pb-2 border-b border-[#F0E8E0]">
          <span>Cant. / Concepto</span>
          <span>Importe</span>
        </div>
        <ul className="divide-y divide-[#F5EFEB]">
          {ticket.lineas.map((l, i) => (
            <li key={i} className="py-2.5 flex justify-between gap-3 text-xs">
              <div className="min-w-0">
                <p className="font-bold truncate">{l.cantidad} × {l.nombre}</p>
                <p className="text-[10px] text-[#A8988D]">{fmt(l.precioUnitario)} c/u</p>
              </div>
              <span className="font-black shrink-0">{fmt(l.cantidad * l.precioUnitario)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-dashed border-[#D5C7BA] pt-3 space-y-1.5 text-xs">
        <div className="flex justify-between items-end pt-1">
          <span className="text-base font-black">Total</span>
          <span className={`text-2xl font-black ${ticket.estado === 'Cancelado' ? 'line-through text-[#A8988D]' : ''}`}>
            {fmt(ticket.total)}
          </span>
        </div>
        {ticket.estado === 'Cancelado' && (
          <p className="text-[10px] text-[#C62828] font-semibold">Ticket cancelado: no se suma a la venta del día.</p>
        )}
      </div>

      <button
        type="button"
        onClick={onAlternar}
        disabled={bloqueado}
        className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-colors disabled:cursor-not-allowed ${
          revisado
            ? 'bg-[#E3F4EA] border-[#B7E1C8] text-[#16794A] hover:bg-[#D6EFE0]'
            : 'bg-[#7B3F00] border-[#7B3F00] text-white hover:bg-[#683500]'
        }`}
      >
        <Check className="w-4 h-4" />
        {revisado ? 'Ticket revisado' : 'Marcar como revisado'}
      </button>
    </div>
  );
};
