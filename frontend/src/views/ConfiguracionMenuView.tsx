import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminNotificacionesBell } from '../components/AdminNotificacionesBell';
import { UsuarioPerfilNavbar } from '../components/UsuarioPerfilNavbar';
import {
  Search,
  Plus,
  Pencil,
  Trash2
} from 'lucide-react';
import { MenuItem } from '../types';

export const ConfiguracionMenuView: React.FC = () => {
  const {
    menuItems,
    mostrarAddProductModal,
    mostrarEditProductModal,
    mostrarConfirmEliminarModal,
    setActiveView
  } = useApp();


  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;



  // Categorías
  const categories = [
    'Todas',
    ...Array.from(
      new Set(
        menuItems
          .map((m) => (m.category || '').trim())
          .filter(Boolean)
      )
    ),
  ];

  // Filtrado
  const filtered = menuItems.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      categoryFilter === 'Todas' ||
      (item.category || '').trim().toLowerCase() === categoryFilter.trim().toLowerCase();
    const matchStatus =
      statusFilter === 'Todos' ||
      (item.status || '').toUpperCase() === statusFilter.toUpperCase();
    return matchSearch && matchCat && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const agotadosCount = menuItems.filter(i => i.status === 'AGOTADO').length;

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#1E110A] flex flex-row font-sans selection:bg-amber-100">

      {/* 1. SIDEBAR */}
      <AdminSidebar currentSubTitle="MENÚ" />

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Top Header */}
        <header className="bg-white border-b border-[#E7DDD3] px-8 py-3.5 flex items-center justify-between shrink-0">

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#8C7D73] font-medium">Panel Principal</span>
              <span className="text-[#A8988D] font-bold">›</span>
              <span className="text-[#1E110A] font-bold">Configuración de menú</span>
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

          {/* Header Title + Stats */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-[#1E110A] tracking-tight">
                Configuración de menú
              </h1>
              <p className="text-xs sm:text-sm text-[#786B63] mt-1 font-medium">
                Agrega, modifica o elimina los productos que se ofrecen en el comandero y en la cocina.
              </p>
            </div>

            {/* 3 Metrics Grouped Box (Productos 28 | Categorías 7 | Agotados 1) */}
            <div className="inline-flex items-center bg-white border border-[#E5DCD3] rounded-2xl overflow-hidden self-start md:self-auto shadow-2xs divide-x divide-[#E5DCD3]">
              <div className="px-5 py-3 text-center min-w-[95px]">
                <span className="block text-[11px] font-semibold text-[#8C7D73]">Productos</span>
                <span className="text-xl sm:text-2xl font-black text-[#1E110A] leading-tight">{menuItems.length}</span>
              </div>
              <div className="px-5 py-3 text-center min-w-[95px]">
                <span className="block text-[11px] font-semibold text-[#8C7D73]">Categorías</span>
                <span className="text-xl sm:text-2xl font-black text-[#1E110A] leading-tight">{categories.length - 1}</span>
              </div>
              <div className="px-5 py-3 text-center min-w-[95px]">
                <span className="block text-[11px] font-semibold text-[#8C7D73]">Agotados</span>
                <span className="text-xl sm:text-2xl font-black text-[#DF7B1B] leading-tight">{agotadosCount}</span>
              </div>
            </div>
          </div>

          {/* Search, Filter Bar and Add Product Button */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5DCD3] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7D73]" />
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#D5C7BA] rounded-xl text-xs font-semibold text-[#1E110A] focus:outline-none"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[#8C7D73] font-semibold">Categoría:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-[#D5C7BA] rounded-xl px-3 py-2 text-xs font-bold text-[#1E110A] focus:outline-none"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[#8C7D73] font-semibold">Estado:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-[#D5C7BA] rounded-xl px-3 py-2 text-xs font-bold text-[#1E110A] focus:outline-none"
                >
                  <option value="Todos">Todos</option>
                  <option value="DISPONIBLE">Disponible</option>
                  <option value="AGOTADO">Agotado</option>
                </select>
              </div>
            </div>

            {/* Nuevo producto button */}
            <button
              onClick={mostrarAddProductModal}
              className="w-full md:w-auto px-5 py-2.5 bg-[#DF7B1B] hover:bg-[#C96910] text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo producto</span>
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-[#E5DCD3] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#F5EFEB] flex items-center justify-between">
              <h2 className="text-base font-black text-[#1E110A]">Productos del menú</h2>
              <span className="text-xs font-bold text-[#8C7D73] bg-[#FAF8F5] border border-[#E5DCD3] px-3 py-1 rounded-lg">
                {filtered.length} productos
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-[#8C7D73] font-bold border-b border-[#E5DCD3] uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-6">PRODUCTO</th>
                    <th className="py-3.5 px-6">CATEGORÍA</th>
                    <th className="py-3.5 px-6">PRECIO</th>
                    <th className="py-3.5 px-6">ESTADO</th>
                    <th className="py-3.5 px-6 text-right">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5EFEB] font-medium text-[#1E110A]">
                  {paginatedItems.map(item => (
                    <tr key={item.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-bold text-[#1E110A] text-xs">{item.name}</p>
                        <p className="text-[11px] text-[#8C7D73] mt-0.5">{item.description}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-[#6E5A4E] text-xs font-semibold">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-black text-[#1E110A]">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${item.status === 'DISPONIBLE'
                          ? 'bg-[#E6F7F0] text-[#059669]'
                          : 'bg-[#FEF3C7] text-[#D97706]'
                          }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => mostrarEditProductModal(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D5C7BA] hover:border-[#e59819] hover:text-[#e59819] text-[#231815] rounded-xl text-xs font-semibold shadow-2xs transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5 text-[#7c6e65]" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => mostrarConfirmEliminarModal(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF5F5] border border-[#FECACA] hover:bg-[#FEE2E2] text-[#DC2626] rounded-xl text-xs font-semibold shadow-2xs transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 bg-[#FAF8F5] border-t border-[#E5DCD3] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8C7D73]">
              <span>
                Mostrando {Math.min(filtered.length, (currentPage - 1) * itemsPerPage + 1)} de {filtered.length} productos
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white border border-[#D5C7BA] rounded-lg font-semibold disabled:opacity-40"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1
                      ? 'bg-[#DF7B1B] text-white shadow-xs'
                      : 'bg-white border border-[#D5C7BA] text-[#1E110A] hover:bg-stone-50'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white border border-[#D5C7BA] rounded-lg font-semibold disabled:opacity-40"
                >
                  ›
                </button>
              </div>
            </div>

          </div>

        </main>
      </div>

    </div>
  );
};
