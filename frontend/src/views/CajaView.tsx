import React, { useState } from 'react';
import { useApp, CorteCajaItem } from '../context/AppContext';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminNotificacionesBell } from '../components/AdminNotificacionesBell';
import { UsuarioPerfilNavbar } from '../components/UsuarioPerfilNavbar';
import { 
  Printer,
  Plus
} from 'lucide-react';
import Swal from 'sweetalert2';
import logoImg from '../img/logo.png';

export const CajaView: React.FC = () => {
  const {
    cortesCaja: cortes,
    ventasPendientesCorte,
    ticketsPendientesCorte,
    realizarCorteCaja,
    tables,
  } = useApp();
  const [paginaActual, setPaginaActual] = useState(1);
  const filasPorPagina = 5;

  const cuentasAbiertas = tables.filter(
    t => t.status !== 'Limpia / Disponible' && t.status !== 'Reservada'
  ).length;
  const hayIngresosPendientes = ventasPendientesCorte > 0;

  const handleNuevoCorte = () => {
    if (!hayIngresosPendientes) {
      Swal.fire({
        icon: 'info',
        title: 'Sin ingresos pendientes',
        text: 'Ya se realizó el corte con los ingresos acumulados. Registra nuevos cobros para realizar el siguiente corte de caja.',
        confirmButtonColor: '#DF7B1B',
        background: '#FAF8F5',
        color: '#1E110A',
      });
      return;
    }

    const nuevoCorte = realizarCorteCaja();
    if (!nuevoCorte) return;

    setPaginaActual(1);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `Corte ${nuevoCorte.id} registrado ($${nuevoCorte.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })})`,
      showConfirmButton: false,
      timer: 2500,
      background: '#FAF8F5',
      color: '#1E110A',
    });
  };

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const handleImprimirCorte = (corte: CorteCajaItem) => {
    const formatoMoneda = (monto: number) =>
      monto.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const subtotal = corte.total / 1.16;
    const iva = corte.total - subtotal;
    const logoAbsoluteUrl = new URL(logoImg, window.location.origin).href;
    const fechaImpresion = new Date().toLocaleString('es-MX', {
      dateStyle: 'short',
      timeStyle: 'short',
    });

    const html = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Corte de Caja ${escapeHtml(corte.id)} - ¡Hola, Café!</title>
    <style>
      @page {
        size: auto;
        margin: 12mm;
      }
      * {
        box-sizing: border-box;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #1E110A;
        margin: 0;
        padding: 16px;
        background: #ffffff;
      }
      .ticket {
        max-width: 360px;
        margin: 0 auto;
        border: 1px solid #D5C7BA;
        border-radius: 12px;
        padding: 20px;
      }
      .header {
        text-align: center;
        padding-bottom: 12px;
        border-bottom: 1px dashed #B8A99A;
      }
      .header h1 {
        margin: 0;
        font-size: 20px;
        font-weight: 900;
      }
      .header p {
        margin: 2px 0;
        font-size: 11px;
        color: #6E5A4E;
      }
      .badge {
        display: inline-block;
        margin-top: 8px;
        padding: 3px 10px;
        border-radius: 999px;
        background: #FAF8F5;
        border: 1px solid #D5C7BA;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .section {
        padding: 12px 0;
        border-bottom: 1px dashed #B8A99A;
        font-size: 12px;
      }
      .row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        margin: 5px 0;
      }
      .label {
        color: #6E5A4E;
      }
      .value {
        font-weight: 700;
        text-align: right;
      }
      .total-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-top: 10px;
        padding-top: 8px;
        border-top: 1px solid #E5DCD3;
        font-size: 16px;
        font-weight: 900;
      }
      .total-amount {
        color: #7B3F00;
        font-size: 18px;
      }
      .signatures {
        margin-top: 28px;
        display: flex;
        justify-content: space-between;
        gap: 16px;
        font-size: 10px;
        color: #6E5A4E;
      }
      .sig-box {
        flex: 1;
        text-align: center;
      }
      .sig-line {
        border-top: 1px solid #8C7D73;
        margin-bottom: 4px;
      }
      .footer {
        margin-top: 16px;
        text-align: center;
        font-size: 10px;
        color: #8C7D73;
      }
    </style>
  </head>
  <body>
    <div class="ticket">
      <div class="header">
        <img src="${logoAbsoluteUrl}" alt="¡Hola, Café!" style="width:112px;height:112px;object-fit:contain;margin:0 auto 10px;display:block;border-radius:14px;" />
        <h1>¡Hola, Café!</h1>
        <p><strong>Café Central</strong></p>
        <p>Av. Principal 123, Col. Centro Cuilapam</p>
        <p>RFC: XAXX010101000</p>
        <div class="badge">Comprobante de Corte de Caja</div>
      </div>

      <div class="section">
        <div class="row">
          <span class="label">Folio de corte:</span>
          <span class="value">${escapeHtml(corte.id)}</span>
        </div>
        <div class="row">
          <span class="label">Fecha y hora:</span>
          <span class="value">${escapeHtml(corte.fecha)}</span>
        </div>
        <div class="row">
          <span class="label">Responsable / Mesero:</span>
          <span class="value">${escapeHtml(corte.mesero)}</span>
        </div>
        ${corte.tickets !== undefined ? `<div class="row">
          <span class="label">Tickets incluidos:</span>
          <span class="value">${corte.tickets}</span>
        </div>` : ''}
        <div class="row">
          <span class="label">Impreso el:</span>
          <span class="value">${escapeHtml(fechaImpresion)}</span>
        </div>
      </div>

      <div class="section">
        <div class="row">
          <span class="label">Subtotal (sin IVA)</span>
          <span class="value">$${formatoMoneda(subtotal)}</span>
        </div>
        <div class="row">
          <span class="label">IVA (16%)</span>
          <span class="value">$${formatoMoneda(iva)}</span>
        </div>
        <div class="total-row">
          <span>TOTAL CORTE</span>
          <span class="total-amount">$${formatoMoneda(corte.total)}</span>
        </div>
      </div>

      <div class="signatures">
        <div class="sig-box">
          <div class="sig-line"></div>
          <span>Entrega (${escapeHtml(corte.mesero)})</span>
        </div>
        <div class="sig-box">
          <div class="sig-line"></div>
          <span>Recibe (Administrador)</span>
        </div>
      </div>

      <div class="footer">
        Documento interno de control de caja · ¡Hola, Café!
      </div>
    </div>
  </body>
</html>`;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const frameDoc = iframe.contentWindow?.document;
    if (!frameDoc || !iframe.contentWindow) {
      document.body.removeChild(iframe);
      Swal.fire({
        title: 'Error de impresión',
        text: 'No se pudo preparar el comprobante para imprimir.',
        icon: 'error',
        confirmButtonColor: '#7B3F00',
      });
      return;
    }

    frameDoc.open();
    frameDoc.write(html);
    frameDoc.close();

    const frameWindow = iframe.contentWindow;
    const limpiar = () => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    };

    frameWindow.onafterprint = limpiar;
    setTimeout(() => {
      frameWindow.focus();
      frameWindow.print();
      setTimeout(limpiar, 1500);
    }, 150);
  };

  const totalPaginas = Math.ceil(cortes.length / filasPorPagina) || 1;
  const elementosPaginados = cortes.slice(
    (paginaActual - 1) * filasPorPagina,
    paginaActual * filasPorPagina
  );

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#1E110A] flex flex-row font-sans selection:bg-amber-100">
      
      {/* 1. LEFT ADMIN SIDEBAR */}
      <AdminSidebar currentSubTitle="CAJA" />

      {/* 2. MAIN ADMINISTRATIVE WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header */}
        <header className="bg-white border-b border-[#E7DDD3] px-8 py-3.5 flex items-center justify-between shrink-0">
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#8C7D73] font-medium">Panel Principal</span>
              <span className="text-[#A8988D] font-bold">›</span>
              <span className="text-[#1E110A] font-bold">Caja</span>
            </div>
          </div>

          {/* User profile & notifications */}
          <div className="flex items-center gap-4">
            <AdminNotificacionesBell />
            <UsuarioPerfilNavbar />
          </div>

        </header>

        {/* Content Area */}
        <main className="p-8 max-w-6xl w-full mx-auto space-y-6 flex-1">
          
          {/* Header Title + 3 Metrics Cards (Ventas del día | Cuentas abiertas | Tickets impresos) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-[#1E110A] tracking-tight">
                Caja
              </h1>
              <p className="text-xs sm:text-sm text-[#786B63] mt-1 font-medium">
                Cuentas abiertas por mesa, cobro y emisión de tickets.
              </p>
            </div>

            {/* 3 Metrics Grouped Box matching Figma UI_Caja.pdf */}
            <div className="inline-flex items-center bg-white border border-[#E5DCD3] rounded-2xl overflow-hidden self-start md:self-auto shadow-2xs divide-x divide-[#E5DCD3]">
              <div className="px-5 py-3 text-left min-w-[130px]">
                <span className="block text-[11px] font-semibold text-[#8C7D73]">Ventas por cortar</span>
                <span className="text-xl sm:text-2xl font-black text-[#1E110A] leading-tight">
                  ${ventasPendientesCorte.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="px-5 py-3 text-left min-w-[110px]">
                <span className="block text-[11px] font-semibold text-[#8C7D73]">Cuentas abiertas</span>
                <span className="text-xl sm:text-2xl font-black text-[#DF7B1B] leading-tight">{cuentasAbiertas}</span>
              </div>
              <div className="px-5 py-3 text-left min-w-[110px]">
                <span className="block text-[11px] font-semibold text-[#8C7D73]">Tickets impresos</span>
                <span className="text-xl sm:text-2xl font-black text-[#1E110A] leading-tight">{ticketsPendientesCorte}</span>
              </div>
            </div>
          </div>

          {/* Historial de cortes card and table */}
          <div className="bg-white rounded-2xl border border-[#E5DCD3] shadow-sm overflow-hidden">
            
            <div className="p-6 border-b border-[#F5EFEB] flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-[#1E110A]">
                  Historial de cortes
                </h2>
                <p className="text-xs text-[#8C7D73] mt-0.5">
                  Últimos {cortes.length} cortes realizados en la caja.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-[#8C7D73] bg-[#FAF8F5] border border-[#E5DCD3] px-3 py-1.5 rounded-lg">
                  {cortes.length} REGISTROS
                </span>
                <button
                  type="button"
                  onClick={handleNuevoCorte}
                  title={hayIngresosPendientes ? 'Realizar corte de caja con los ingresos acumulados' : 'No hay ingresos pendientes por cortar'}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm flex items-center gap-1.5 ${
                    hayIngresosPendientes
                      ? 'bg-[#DF7B1B] hover:bg-[#C96910] text-white'
                      : 'bg-[#E5DCD3] text-[#8C7D73] cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{hayIngresosPendientes ? 'Realizar corte' : 'Sin ingresos nuevos'}</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-[#8C7D73] font-bold border-b border-[#E5DCD3] uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-6">ID</th>
                    <th className="py-3.5 px-6">FECHA</th>
                    <th className="py-3.5 px-6 text-right">MESERO</th>
                    <th className="py-3.5 px-6 text-right">TOTAL</th>
                    <th className="py-3.5 px-6 text-right">IMPRIMIR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5EFEB] font-medium text-[#1E110A]">
                  {elementosPaginados.map(corte => (
                    <tr key={corte.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-[#1E110A]">{corte.id}</td>
                      <td className="py-4 px-6 text-[#786B63]">{corte.fecha}</td>
                      <td className="py-4 px-6 text-right text-[#786B63] font-medium">{corte.mesero}</td>
                      <td className="py-4 px-6 text-right font-black text-[#1E110A]">
                        ${corte.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => handleImprimirCorte(corte)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D5C7BA] hover:bg-stone-50 rounded-xl text-xs font-bold text-[#1E110A] transition-colors shadow-2xs"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#8C7D73]" />
                          <span>Imprimir</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-[#FAF8F5] border-t border-[#E5DCD3] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8C7D73]">
              <span>Mostrando {elementosPaginados.length} de {cortes.length} cortes registrados</span>

              <div className="flex items-center gap-3">
                <span>Filas por página: {filasPorPagina}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                    disabled={paginaActual === 1}
                    className="w-7 h-7 rounded border border-[#E5DCD3] flex items-center justify-center bg-white text-[#1E110A] disabled:text-[#A8988D] disabled:cursor-not-allowed hover:bg-stone-50"
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPaginas }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPaginaActual(idx + 1)}
                      className={`w-7 h-7 rounded font-bold flex items-center justify-center ${
                        paginaActual === idx + 1
                          ? 'bg-[#DF7B1B] text-white shadow-xs'
                          : 'border border-[#E5DCD3] bg-white text-[#1E110A] hover:bg-stone-50'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                    disabled={paginaActual === totalPaginas}
                    className="w-7 h-7 rounded border border-[#E5DCD3] flex items-center justify-center bg-white text-[#1E110A] disabled:text-[#A8988D] disabled:cursor-not-allowed hover:bg-stone-50"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>

    </div>
  );
};
