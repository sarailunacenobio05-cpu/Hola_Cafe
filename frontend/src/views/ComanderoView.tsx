import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from '../components/Logo';
import { AlertaBarraPopover } from '../components/AlertaBarraPopover';
import { UsuarioPerfilNavbar } from '../components/UsuarioPerfilNavbar';
import {
  LogOut,
  Search,
  Plus,
  Minus,
  Trash2,
  Coffee,
  Layers,
  CupSoda,
  Utensils,
  Receipt,
  RefreshCw,
  ArrowLeft,
  CreditCard,
  MessageSquarePlus,
  CheckCircle2,
  X,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { MenuItem, OrderItem } from '../types';

const normalizeText = (value: string) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

export const ComanderoView: React.FC = () => {
  const {
    tables,
    menuItems,
    currentUser,
    activeTableId,
    selectTable,
    setActiveView,
    logout,
    agregarItemToOrder,
    actualizarItemQuantity,
    actualizarNotaItemOrder,
    eliminarItemFromOrder,
    enviarOrdenACocina,
    mostrarCobroModal,
    mostrarTicketModal,
    liberarMesaDirectamente,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notaItemEditando, setNotaItemEditando] = useState<OrderItem | null>(null);
  const [notaTexto, setNotaTexto] = useState<string>('');
  const [selectedOptionsByProduct, setSelectedOptionsByProduct] = useState<Record<string, string>>({});

  // Mesa actualmente seleccionada (nunca fija en M02)
  const activeTable = useMemo(() => {
    return tables.find((t) => t.id === activeTableId) || tables[0];
  }, [tables, activeTableId]);

  const currentTableId = activeTable?.id || 'M01';
  const numeroMesaFormateado = activeTable
    ? String(activeTable.number).padStart(2, '0')
    : currentTableId.replace('M', '');
  const meseroActual = currentUser?.name || activeTable?.currentOrder?.waiterName || activeTable?.waiterName || 'Mesero';
  const folioActual = useMemo(() => {
    if (activeTable?.currentOrder?.folio) return activeTable.currentOrder.folio;
    const maxEnMesas = tables.reduce((max, t) => {
      const f = t.currentOrder?.folio;
      return typeof f === 'number' && f >= 1000 && f < 2000 ? Math.max(max, f) : max;
    }, 1043);
    let ultimoGuardado = 1043;
    try {
      const raw = localStorage.getItem('holacafe_last_ticket_folio_v1');
      if (raw) {
        const parsed = parseInt(raw, 10);
        if (Number.isFinite(parsed) && parsed >= 1000) {
          ultimoGuardado = parsed;
        }
      }
    } catch { }
    return Math.max(ultimoGuardado, maxEnMesas) + 1;
  }, [activeTable, tables]);

  // Productos disponibles del menú real (sincronizados con lo que crea/edita el Administrador)
  const productosDisponibles = useMemo(() => {
    return menuItems.filter((item) => item.status === 'DISPONIBLE');
  }, [menuItems]);

  // Categorías dinámicas obtenidas de los productos disponibles
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of productosDisponibles) {
      const cat = (item.category || 'General').trim();
      const key = normalizeText(cat);
      if (key && !map.has(key)) {
        map.set(key, cat);
      }
    }
    return Array.from(map.entries()).map(([key, label]) => ({
      key,
      label,
    }));
  }, [productosDisponibles]);

  const getCategoryIcon = (catKey: string) => {
    if (catKey.includes('fria')) return <CupSoda className="w-3.5 h-3.5" />;
    if (catKey.includes('caliente') || catKey.includes('cafe')) return <Coffee className="w-3.5 h-3.5" />;
    if (catKey.includes('fresca')) return <Layers className="w-3.5 h-3.5" />;
    return <Utensils className="w-3.5 h-3.5" />;
  };

  // Filtrado por categoría (insensible a mayúsculas/acentos) y búsqueda
  const filteredCatalog = useMemo(() => {
    const q = normalizeText(searchQuery);
    return productosDisponibles.filter((p) => {
      const matchCat =
        selectedCategory === 'TODOS' || normalizeText(p.category) === selectedCategory;
      const matchSearch =
        !q ||
        normalizeText(p.name).includes(q) ||
        normalizeText(p.description).includes(q) ||
        normalizeText(p.category).includes(q);
      return matchCat && matchSearch;
    });
  }, [productosDisponibles, selectedCategory, searchQuery]);

  const orderItems: OrderItem[] = activeTable?.currentOrder?.items || [];
  const itemsPendientes = orderItems.filter((i) => !i.enviadoACocina);
  const itemsEnviados = orderItems.filter((i) => Boolean(i.enviadoACocina));

  const handleAddToCart = (product: MenuItem) => {
    const chosenOption =
      product.options && product.options.length > 0
        ? selectedOptionsByProduct[product.id] || product.options[0]
        : undefined;
    agregarItemToOrder(currentTableId, product, chosenOption);
  };

  // Totales de la mesa seleccionada
  const subtotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal;
  const totalArticulos = orderItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#1E110A] flex flex-col justify-between font-sans selection:bg-amber-100">
      {/* 1. TOP HEADER */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[#E7DDD3] bg-[#F5EFEB] shrink-0">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          <Logo size="md" variant="badge-only" />
          <span className="font-extrabold text-[#1E110A] text-xl tracking-tight leading-none">
            ¡Hola, Café!
          </span>
        </div>

        {/* Center: Volver a Mesas button */}
        <button
          type="button"
          onClick={() => setActiveView('mapa-mesas')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#D5C7BA] hover:border-[#DF7B1B] hover:bg-amber-50/50 text-[#1E110A] rounded-xl text-xs font-bold transition-all shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#DF7B1B]" />
          <span>Volver a Salón de Mesas</span>
        </button>

        {/* Right: Alerta Barra + User + Logout */}
        <div className="flex items-center gap-4">
          <AlertaBarraPopover />
          <UsuarioPerfilNavbar />
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#6E5A4E] hover:text-[#1E110A] transition-colors ml-1"
          >
            <LogOut className="w-3.5 h-3.5 text-[#6E5A4E]" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </header>

      {/* 2. SPLIT LAYOUT */}
      <div className="flex-1 px-6 py-4 max-w-[1600px] w-full mx-auto flex flex-col lg:flex-row gap-6 items-stretch">
        {/* LEFT MAIN AREA: Catálogo completo y filtrado */}
        <div className="flex-1 flex flex-col justify-between space-y-4 min-w-0">
          <div className="space-y-4">
            {/* Category pills + Back button */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setActiveView('mapa-mesas')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 bg-white border border-[#D5C7BA] text-[#1E110A] hover:border-[#DF7B1B] hover:text-[#DF7B1B] transition-all shadow-2xs"
                title="Volver a Salón de Mesas"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#DF7B1B]" />
                <span>Mesas</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('TODOS')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${selectedCategory === 'TODOS'
                  ? 'bg-[#7B3F00] text-white shadow-xs'
                  : 'bg-white/80 border border-[#D5C7BA] text-[#1E110A] hover:bg-white'
                  }`}
              >
                <span className={selectedCategory === 'TODOS' ? 'text-amber-400' : 'text-[#8C7D73]'}>
                  <Coffee className="w-3.5 h-3.5" />
                </span>
                <span>Todos ({productosDisponibles.length})</span>
              </button>

              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${selectedCategory === cat.key
                    ? 'bg-[#7B3F00] text-white shadow-xs'
                    : 'bg-white/80 border border-[#D5C7BA] text-[#1E110A] hover:bg-white'
                    }`}
                >
                  <span className={selectedCategory === cat.key ? 'text-amber-400' : 'text-[#8C7D73]'}>
                    {getCategoryIcon(cat.key)}
                  </span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Search input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7D73]" />
              <input
                type="text"
                placeholder="Buscar producto por nombre, ingrediente o categoría..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D5C7BA] rounded-xl text-xs sm:text-sm font-medium text-[#1E110A] focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            {/* Product Cards Grid */}
            {filteredCatalog.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E5DCD3] p-8 text-center space-y-2">
                <p className="text-sm font-bold text-[#1E110A]">
                  No se encontraron productos en esta categoría
                </p>
                <p className="text-xs text-[#8C7D73]">
                  Prueba seleccionando &ldquo;Todos&rdquo; o cambiando el término de búsqueda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[calc(100vh-310px)] overflow-y-auto pr-1">
                {filteredCatalog.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-[#E5DCD3] p-4 flex flex-col justify-between shadow-2xs hover:border-[#D5C7BA] transition-all"
                  >
                    <div>
                      {/* Title + Price (con soporte de descuento por producto) */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-extrabold text-[#1E110A] text-sm leading-snug">
                            {product.name}
                          </h3>
                          {(product.discountPercent || 0) > 0 && (
                            <span className="bg-[#E6F7F0] text-[#059669] border border-[#A7F3D0] text-[10px] font-black px-1.5 py-0.5 rounded-md">
                              -{product.discountPercent}%
                            </span>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          {(product.discountPercent || 0) > 0 ? (
                            <>
                              <span className="block text-[10px] line-through text-[#A8988D] font-bold">
                                ${product.price.toFixed(2)}
                              </span>
                              <span className="font-black text-[#059669] text-sm">
                                ${(product.price * (1 - (product.discountPercent || 0) / 100)).toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="font-black text-[#8B4513] text-sm">
                              ${product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-[#8C7D73] mt-1.5 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Variantes / Opciones si el producto tiene */}
                      {product.options && product.options.length > 0 && (
                        <div className="mt-2.5">
                          <select
                            value={selectedOptionsByProduct[product.id] || product.options[0]}
                            onChange={(e) =>
                              setSelectedOptionsByProduct((prev) => ({
                                ...prev,
                                [product.id]: e.target.value,
                              }))
                            }
                            className="w-full px-2.5 py-1 bg-[#FAF8F5] border border-[#E5DCD3] rounded-lg text-[11px] font-semibold text-[#1E110A] focus:outline-none"
                          >
                            {product.options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Bottom: Category badge + "+ Agregar" button */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#F5EFEB] gap-2">
                      <span className="text-[10px] font-semibold text-[#8C7D73] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#E5DCD3] truncate">
                        {product.category}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className="px-3.5 py-1.5 bg-[#8B4513] hover:bg-[#72380F] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 active:scale-95 shrink-0"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Agregar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Toolbar: Mesa activa + selector rápido de las 9 mesas */}
          <div className="bg-white/80 border border-[#D5C7BA] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E5DCD3] rounded-xl px-3 py-1.5 text-xs font-bold text-[#1E110A]">
                <Utensils className="w-3.5 h-3.5 text-[#8B4513]" />
                <span>Mesa {numeroMesaFormateado}</span>
              </div>

              <div className="flex items-center gap-1 flex-wrap">
                {tables.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => selectTable(t.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${t.id === currentTableId
                      ? 'bg-[#7B3F00] text-white shadow-2xs'
                      : 'bg-white border border-[#E5DCD3] text-[#6E5A4E] hover:text-[#1E110A]'
                      }`}
                  >
                    {t.id}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveView('mapa-mesas')}
                className="px-3.5 py-1.5 bg-[#7B3F00] hover:bg-[#683500] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Ver Mapa de Mesas</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: Comanda Activa de la mesa seleccionada */}
        <aside className="w-full lg:w-[380px] bg-white rounded-2xl border border-[#E5DCD3] shadow-sm flex flex-col justify-between overflow-hidden shrink-0">
          <div>
            {/* Dark brown Header */}
            <div className="bg-[#7B3F00] text-white p-4">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest bg-[#5E2F00] px-2 py-0.5 rounded">
                  MESA {numeroMesaFormateado}
                </span>
                <span className="text-[10px] font-medium text-stone-300">
                  #{folioActual}-KDS
                </span>
              </div>

              <h2 className="text-base font-black text-white tracking-tight mt-1">
                Comanda Activa
              </h2>
              <p className="text-xs text-stone-300 mt-0.5">
                Mesero: {meseroActual}
              </p>
            </div>

            {/* Items List: separados en "Por enviar a cocina" y "Ya enviados a cocina" */}
            <div className="p-4 space-y-4 max-h-[calc(100vh-420px)] overflow-y-auto">
              {orderItems.length === 0 ? (
                <div className="py-10 text-center space-y-1.5">
                  <p className="text-xs font-bold text-[#1E110A]">
                    Sin productos en Mesa {numeroMesaFormateado}
                  </p>
                  <p className="text-[11px] text-[#8C7D73]">
                    Selecciona platillos o bebidas del menú para armar la comanda.
                  </p>
                </div>
              ) : (
                <>
                  {/* 1. Sección de productos nuevos / por enviar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#8B4513]">
                        Por enviar a cocina
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-[#8B4513] border border-amber-200">
                        {itemsPendientes.reduce((acc, i) => acc + i.quantity, 0)} pend.
                      </span>
                    </div>

                    {itemsPendientes.length === 0 ? (
                      <div className="py-3 px-3 rounded-xl bg-[#FAF8F5] border border-dashed border-[#D5C7BA] text-center text-[11px] text-[#8C7D73]">
                        Sin productos pendientes. Agrega nuevos platillos del menú para enviar otra orden.
                      </div>
                    ) : (
                      <div className="divide-y divide-[#F5EFEB]">
                        {itemsPendientes.map((item) => (
                          <div key={item.id} className="py-3 first:pt-1 last:pb-0 space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded bg-[#7B3F00] text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                                  {item.quantity}
                                </span>
                                <div>
                                  <h4 className="text-xs font-bold text-[#1E110A] leading-tight">
                                    {item.name}
                                  </h4>
                                  {item.selectedOption && (
                                    <p className="text-[11px] font-semibold text-[#8B4513] mt-0.5">
                                      Opción: {item.selectedOption}
                                    </p>
                                  )}
                                  {item.notes && (
                                    <p className="text-[11px] text-[#8C7D73] mt-0.5">
                                      Nota: {item.notes}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <span className="font-extrabold text-[#1E110A] text-xs shrink-0">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>

                            {/* Controls: - qty + | Nota | Quitar */}
                            <div className="flex items-center justify-between pl-7">
                              <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E5DCD3] rounded-lg px-1.5 py-0.5">
                                <button
                                  type="button"
                                  onClick={() => actualizarItemQuantity(currentTableId, item.id, -1)}
                                  className="text-[#8C7D73] hover:text-[#1E110A]"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-bold text-[#1E110A] w-4 text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => actualizarItemQuantity(currentTableId, item.id, 1)}
                                  className="text-[#8C7D73] hover:text-[#1E110A]"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNotaItemEditando(item);
                                    setNotaTexto(item.notes || '');
                                  }}
                                  className="flex items-center gap-1 text-[11px] font-bold text-[#8B4513] hover:text-[#DF7B1B]"
                                >
                                  <MessageSquarePlus className="w-3 h-3" />
                                  <span>{item.notes ? 'Editar nota' : '+ Nota'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => eliminarItemFromOrder(currentTableId, item.id)}
                                  className="flex items-center gap-1 text-[11px] font-bold text-[#DC2626] hover:text-[#B91C1C]"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Quitar</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2. Apartado de órdenes ya enviadas a cocina (bloqueadas para no duplicar) */}
                  {itemsEnviados.length > 0 && (
                    <div className="pt-3 border-t border-dashed border-[#D5C7BA] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#059669] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Enviados a cocina</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F7F0] text-[#059669] border border-[#A7F3D0]">
                          {itemsEnviados.reduce((acc, i) => acc + i.quantity, 0)} en cuenta
                        </span>
                      </div>

                      <div className="rounded-xl bg-[#FAF8F5] border border-[#E5DCD3] divide-y divide-[#EDE4DC] px-3 py-1 opacity-85">
                        {itemsEnviados.map((item) => (
                          <div key={item.id} className="py-2 flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              <span className="w-5 h-5 rounded bg-[#059669]/15 text-[#059669] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                                {item.quantity}
                              </span>
                              <div>
                                <h4 className="text-xs font-semibold text-[#5C4E45] leading-tight">
                                  {item.name}
                                </h4>
                                {item.selectedOption && (
                                  <p className="text-[10px] text-[#8C7D73] mt-0.5">
                                    Opción: {item.selectedOption}
                                  </p>
                                )}
                                {item.notes && (
                                  <p className="text-[10px] text-[#8C7D73] mt-0.5">
                                    Nota: {item.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            <span className="font-bold text-[#5C4E45] text-xs shrink-0">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Pricing & Dispatch Buttons */}
          <div className="p-4 bg-[#FAF8F5] border-t border-[#E5DCD3] space-y-3">
            <div className="space-y-1 text-xs text-[#786B63]">
              <div className="flex justify-between">
                <span>Artículos en cuenta ({totalArticulos}):</span>
                <span className="font-semibold text-[#1E110A]">${subtotal.toFixed(2)} MXN</span>
              </div>
              <div className="flex justify-between text-base font-black text-[#1E110A] pt-2 border-t border-[#E5DCD3]">
                <span>Total a Pagar:</span>
                <span className="text-xl text-[#7B3F00]">
                  ${total.toFixed(2)} <span className="text-xs font-bold text-[#786B63]">MXN</span>
                </span>
              </div>
            </div>

            {/* Primary actions: Enviar a Cocina + Cobrar */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={itemsPendientes.length === 0}
                onClick={() => {
                  const enviados = itemsPendientes.reduce((acc, i) => acc + i.quantity, 0);
                  enviarOrdenACocina(currentTableId);
                  Swal.fire({
                    title: 'Enviado a Cocina',
                    text: `Se enviaron ${enviados} producto(s) nuevos de Mesa ${numeroMesaFormateado} a cocina (KDS).`,
                    icon: 'success',
                    confirmButtonColor: '#7B3F00',
                  });
                }}
                className={`py-3 rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98 ${itemsPendientes.length === 0 && itemsEnviados.length > 0
                  ? 'bg-[#E6F7F0] text-[#059669] border border-[#A7F3D0] cursor-not-allowed shadow-none'
                  : 'bg-[#9E5416] hover:bg-[#86440E] disabled:opacity-50 text-white'
                  }`}
              >
                {itemsPendientes.length === 0 && itemsEnviados.length > 0 ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Todo enviado</span>
                  </>
                ) : (
                  <span>▷ Enviar a Cocina</span>
                )}
              </button>

              <button
                type="button"
                disabled={orderItems.length === 0}
                onClick={() => mostrarCobroModal(currentTableId)}
                className="py-3 bg-[#8B4513] hover:bg-[#72380F] disabled:opacity-50 text-white rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98"
              >
                <CreditCard className="w-4 h-4" />
                <span>Cobrar</span>
              </button>
            </div>

            {/* Secondary actions: Pre-cuenta + Cancelar Mesa */}
            <div className="pt-1 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={orderItems.length === 0}
                onClick={() => mostrarTicketModal(currentTableId)}
                className="py-2 px-3 bg-white hover:bg-stone-50 disabled:opacity-50 border border-[#D5C7BA] rounded-xl text-xs font-bold text-[#1E110A] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Receipt className="w-3.5 h-3.5 text-[#8C7D73]" />
                <span>Pre-cuenta</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  const res = await Swal.fire({
                    icon: 'warning',
                    title: `¿Cancelar Mesa ${numeroMesaFormateado}?`,
                    text: 'Esta acción liberará la mesa y cancelará su comanda activa.',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, liberar mesa',
                    cancelButtonText: 'Volver',
                    confirmButtonColor: '#DC2626',
                    cancelButtonColor: '#786B63',
                  });
                  if (res.isConfirmed) {
                    liberarMesaDirectamente(currentTableId);
                    setActiveView('mapa-mesas');
                  }
                }}
                className="py-2 px-3 bg-[#FFF5F5] hover:bg-[#FEE2E2] border border-[#FECACA] rounded-xl text-xs font-bold text-[#DC2626] flex items-center justify-center gap-1.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancelar mesa</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {notaItemEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E5DCD3] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#F5EFEB] flex items-center justify-between bg-[#FAF8F5]">
              <div>
                <h3 className="font-extrabold text-[#1E110A] text-base">Nota para cocina</h3>
                <p className="text-xs text-[#786B63] mt-0.5">{notaItemEditando.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setNotaItemEditando(null)}
                className="p-1 rounded-lg text-[#8C7D73] hover:text-[#1E110A] hover:bg-stone-200/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                actualizarNotaItemOrder(currentTableId, notaItemEditando.id, notaTexto);
                setNotaItemEditando(null);
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-[#1E110A] mb-1.5">
                  Especificaciones del producto
                </label>
                <textarea
                  rows={3}
                  value={notaTexto}
                  onChange={(e) => setNotaTexto(e.target.value)}
                  placeholder="Ej. Sin azúcar, leche deslactosada, alergia a frutos secos..."
                  className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#D5C7BA] rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium resize-none"
                />
              </div>

              <div className="pt-2 border-t border-[#F5EFEB] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNotaItemEditando(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#6E5A4E] hover:text-[#1E110A] rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#8B4513] hover:bg-[#72380F] text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  Guardar nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
