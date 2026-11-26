import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useApp } from '../context/AppContext';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminNotificacionesBell } from '../components/AdminNotificacionesBell';
import { UsuarioPerfilNavbar } from '../components/UsuarioPerfilNavbar';
import { Search, BadgePercent, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

const DESCUENTOS_RAPIDOS = [0, 10, 15, 20, 30, 50];
const ITEMS_PER_PAGE = 10;

export const ConfiguracionDescuentosView: React.FC = () => {
  const { menuItems, actualizarDescuentoProducto } = useApp();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [onlyWithDiscount, setOnlyWithDiscount] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const categories = [
    'Todas',
    ...Array.from(new Set(menuItems.map((m) => (m.category || '').trim()).filter(Boolean))),
  ];

  const productosConDescuento = menuItems.filter((i) => (i.discountPercent || 0) > 0).length;

  const filtered = menuItems.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      categoryFilter === 'Todas' ||
      (item.category || '').trim().toLowerCase() === categoryFilter.trim().toLowerCase();
    const matchDiscount = !onlyWithDiscount || (item.discountPercent || 0) > 0;
    return matchSearch && matchCat && matchDiscount;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, onlyWithDiscount]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const showingFrom = filtered.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + ITEMS_PER_PAGE, filtered.length);

  const handleSetDiscount = (productId: string, productName: string, pct: number) => {
    actualizarDescuentoProducto(productId, pct);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: pct > 0 ? `Descuento de ${pct}% aplicado a ${productName}` : `Descuento retirado de ${productName}`,
      showConfirmButton: false,
      timer: 2000,
      background: '#FAF8F5',
      color: '#1E110A',
    });
  };

  const handleLimpiarTodos = async () => {
    if (productosConDescuento === 0) return;
    const res = await Swal.fire({
      icon: 'question',
      title: '¿Retirar todos los descuentos?',
      text: 'Todos los productos volverán a su precio original de carta.',
      showCancelButton: true,
      confirmButtonText: 'Sí, retirar todos',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#7B3F00',
    });
    if (res.isConfirmed) {
      menuItems.forEach((p) => {
        if ((p.discountPercent || 0) > 0) {
          actualizarDescuentoProducto(p.id, 0);
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#1E110A] flex flex-row font-sans selection:bg-amber-100">
      <AdminSidebar currentSubTitle="DESCUENTOS" />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-[#E7DDD3] px-8 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#8C7D73] font-medium">Panel Principal</span>
            <span className="text-[#A8988D] font-bold">›</span>
            <span className="text-[#1E110A] font-bold">Descuentos por producto</span>
          </div>
          <div className="flex items-center gap-4">
            <AdminNotificacionesBell />
            <UsuarioPerfilNavbar />
          </div>
        </header>

        <main className="p-8 max-w-6xl w-full mx-auto space-y-6 flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-[#1E110A] tracking-tight">
                Descuentos por producto
              </h1>
              <p className="text-xs sm:text-sm text-[#786B63] mt-1 font-medium">
                Configura promociones o descuentos individuales en platillos y bebidas específicos sin afectar el resto de la comanda.
              </p>
            </div>
            <div className="inline-flex items-center bg-white border border-[#E5DCD3] rounded-2xl overflow-hidden self-start md:self-auto shadow-2xs divide-x divide-[#E5DCD3]">
              <div className="px-5 py-3 text-center min-w-[110px]">
                <span className="block text-[11px] font-semibold text-[#8C7D73]">Total productos</span>
                <span className="text-xl sm:text-2xl font-black text-[#1E110A] leading-tight">{menuItems.length}</span>
              </div>
              <div className="px-5 py-3 text-center min-w-[130px]">
                <span className="block text-[11px] font-semibold text-[#8C7D73]">Con descuento activo</span>
                <span className="text-xl sm:text-2xl font-black text-[#059669] leading-tight">{productosConDescuento}</span>
              </div>
            </div>
          </div>

          {/* Barra de búsqueda y filtros */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5DCD3] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7D73]" />
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#D5C7BA] rounded-xl text-xs font-semibold text-[#1E110A] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[#8C7D73] font-semibold">Categoría:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-white border border-[#D5C7BA] rounded-xl px-3 py-2 text-xs font-bold text-[#1E110A] focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setOnlyWithDiscount((v) => !v)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  onlyWithDiscount
                    ? 'bg-[#7B3F00] text-white border-[#7B3F00]'
                    : 'bg-[#FAF8F5] text-[#6E5A4E] border-[#D5C7BA] hover:text-[#1E110A]'
                }`}
              >
                <BadgePercent className="w-3.5 h-3.5" />
                <span>Solo con descuento ({productosConDescuento})</span>
              </button>
            </div>

            {productosConDescuento > 0 && (
              <button
                type="button"
                onClick={handleLimpiarTodos}
                className="w-full md:w-auto px-4 py-2 bg-[#FFF5F5] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Quitar todos los descuentos</span>
              </button>
            )}
          </div>

          {/* Tabla de productos y descuentos */}
          <div className="bg-white rounded-2xl border border-[#E5DCD3] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-[#8C7D73] font-bold border-b border-[#E5DCD3] uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-6">PRODUCTO</th>
                    <th className="py-3.5 px-4">CATEGORÍA</th>
                    <th className="py-3.5 px-4">PRECIO NORMAL</th>
                    <th className="py-3.5 px-4">PRECIO FINAL</th>
                    <th className="py-3.5 px-6 text-right">DESCUENTO INDIVIDUAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5EFEB] font-medium text-[#1E110A]">
                  {paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 px-6 text-center text-[#8C7D73] text-xs font-semibold">
                        No se encontraron productos con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((item) => {
                      const pct = item.discountPercent || 0;
                      const finalPrice = Number((item.price * (1 - pct / 100)).toFixed(2));
                      return (
                        <tr key={item.id} className="hover:bg-amber-50/20 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-[#1E110A] text-xs">{item.name}</p>
                              {pct > 0 && (
                                <span className="bg-[#E6F7F0] text-[#059669] border border-[#A7F3D0] text-[10px] font-black px-2 py-0.5 rounded-full">
                                  -{pct}%
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#8C7D73] mt-0.5">{item.description}</p>
                          </td>
                          <td className="py-4 px-4 text-[#6E5A4E] font-semibold">{item.category}</td>
                          <td className="py-4 px-4">
                            <span className={pct > 0 ? 'line-through text-[#A8988D] font-semibold' : 'font-black text-[#1E110A]'}>
                              ${item.price.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`font-black text-sm ${pct > 0 ? 'text-[#059669]' : 'text-[#1E110A]'}`}>
                              ${finalPrice.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#F7F3EE] border border-[#E7DDD3] shadow-inner">
                              {DESCUENTOS_RAPIDOS.map((d) => {
                                const isActive = pct === d;
                                return (
                                  <button
                                    key={d}
                                    type="button"
                                    onClick={() => handleSetDiscount(item.id, item.name, d)}
                                    title={d === 0 ? 'Sin descuento' : `Aplicar ${d}% de descuento`}
                                    className={`min-w-[44px] px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold tracking-tight transition-all duration-150 active:scale-95 ${
                                      isActive
                                        ? d === 0
                                          ? 'bg-[#3A1F13] text-white shadow-sm ring-1 ring-[#3A1F13]/20'
                                          : 'bg-gradient-to-b from-[#10B981] to-[#059669] text-white shadow-sm shadow-emerald-700/20 ring-1 ring-emerald-500/30'
                                        : 'bg-white/80 text-[#6E5A4E] border border-transparent hover:bg-white hover:text-[#059669] hover:border-[#A7F3D0] hover:shadow-2xs'
                                    }`}
                                  >
                                    {d === 0 ? '0%' : `-${d}%`}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación (máximo 10 productos por página) */}
            {filtered.length > 0 && (
              <div className="px-6 py-3.5 bg-[#FAF8F5] border-t border-[#E5DCD3] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-[#786B63] font-medium">
                  Mostrando <strong className="text-[#1E110A]">{showingFrom}–{showingTo}</strong> de{' '}
                  <strong className="text-[#1E110A]">{filtered.length}</strong> productos
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[#D5C7BA] text-[#1E110A] font-bold hover:bg-[#F5EFEB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Anterior</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                          page === safePage
                            ? 'bg-[#7B3F00] text-white shadow-xs'
                            : 'bg-white border border-[#E5DCD3] text-[#6E5A4E] hover:border-[#D5C7BA] hover:text-[#1E110A]'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[#D5C7BA] text-[#1E110A] font-bold hover:bg-[#F5EFEB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <span>Siguiente</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
