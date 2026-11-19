import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import Swal from 'sweetalert2';

interface CatalogProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  portion: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  modifier?: string;
}

export const ComanderoView: React.FC = () => {
  const { 
    activeTableId, 
    selectTable, 
    setActiveView, 
    logout, 
    mostrarCobroModal, 
    mostrarTicketModal 
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('Todos (28)');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notaItemEditando, setNotaItemEditando] = useState<CartItem | null>(null);
  const [notaTexto, setNotaTexto] = useState<string>('');

  // Exact catalog from Comandero Táctil - Menú y Pedidos.pdf
  const catalogProducts: CatalogProduct[] = [
    {
      id: 'p-1',
      name: 'Cappuccino Artesanal',
      price: 65.00,
      description: 'Caliente • Leche texturizada sedosa • Origen Chiapas',
      category: 'Cafetería Especialidad',
      portion: 'Taza 8 oz'
    },
    {
      id: 'p-2',
      name: 'Croissant Almendras',
      price: 58.00,
      description: 'Frangipane artesanal • Mantequilla pura de Normandía',
      category: 'Repostería y Pan',
      portion: 'Pastelería'
    },
    {
      id: 'p-3',
      name: 'Cold Brew Cítrico',
      price: 72.00,
      description: 'Infusión lenta • Rodaja de naranja valencia • Romero',
      category: 'Bebidas Frías',
      portion: 'Vaso 12 oz'
    },
    {
      id: 'p-4',
      name: 'Tostada Aguacate',
      price: 110.00,
      description: 'Pan de masa madre • Huevo de libre pastoreo • Germinados',
      category: 'Desayunos',
      portion: 'Brunch'
    },
    {
      id: 'p-5',
      name: 'Flat White Avena',
      price: 68.00,
      description: 'Doble ristretto concentrado • Leche de avena barista',
      category: 'Cafetería Especialidad',
      portion: 'Taza 6 oz'
    },
    {
      id: 'p-6',
      name: 'Cheesecake Berries',
      price: 75.00,
      description: 'Queso crema horneado • Coulis de frambuesa y zarzamora',
      category: 'Repostería y Pan',
      portion: 'Postre'
    }
  ];

  // Exact 3 active order items from the Figma screenshot
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 'cart-1',
      name: 'Cappuccino Artesanal',
      price: 65.00,
      quantity: 1,
      modifier: 'Leche de avena • Sin azúcar'
    },
    {
      id: 'cart-2',
      name: 'Croissant Almendras',
      price: 58.00,
      quantity: 1
    },
    {
      id: 'cart-3',
      name: 'Tostada Aguacate',
      price: 110.00,
      quantity: 1,
      modifier: 'Poché término medio • Sal rosa'
    }
  ]);

  const categories = [
    { label: 'Todos (28)', icon: <Coffee className="w-3.5 h-3.5" /> },
    { label: 'Alimentos salados' },
    { label: 'Opciones frescas', icon: <Layers className="w-3.5 h-3.5" /> },
    { label: 'Dulces',  },
    { label: 'Mini hotcakes', icon: <Utensils className="w-3.5 h-3.5" /> },
    { label: 'Opciones sin café', icon: <Utensils className="w-3.5 h-3.5" /> },
    { label: 'Bebidas calientes',  icon: <Coffee className="w-3.5 h-3.5" /> },
    { label: 'Bebidas frías', icon: <CupSoda className="w-3.5 h-3.5" />}
  ];

  const handleAddToCart = (product: CatalogProduct) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.name === product.name);
      if (existing) {
        return prev.map(item => item.name === product.name ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, {
        id: `cart-${Date.now()}`,
        name: product.name,
        price: product.price,
        quantity: 1,
        modifier: product.category === 'Cafetería Especialidad' ? 'Leche entera' : undefined
      }];
    });
  };

  const handleUpdateQty = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const handleRemove = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  // Pricing (matches Figma: Subtotal $233.00, IVA 16% $37.28, Total $270.28 MXN)
  const subtotal = cartItems.reduce((s, i) => s + (i.price * i.quantity), 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  const filteredCatalog = catalogProducts.filter(p => {
    const matchCat = selectedCategory === 'Todos (28)' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#1E110A] flex flex-col justify-between font-sans selection:bg-amber-100">
      
      {/* 1. TOP HEADER (Exact Figma Match) */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[#E7DDD3] bg-[#F5EFEB] shrink-0">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          <Logo size="md" variant="badge-only" />
          <span className="font-extrabold text-[#1E110A] text-xl tracking-tight leading-none">
            ¡Hola, Café!
          </span>
        </div>

        {/* Center: Volver a Mesas button (no extra menu) */}
        <button
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
            onClick={logout}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#6E5A4E] hover:text-[#1E110A] transition-colors ml-1"
          >
            <LogOut className="w-3.5 h-3.5 text-[#6E5A4E]" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>

      </header>

      {/* 2. SPLIT LAYOUT: Catalog on Left (with categories, search, cards, bottom bar) | Comanda on Right */}
      <div className="flex-1 px-6 py-4 max-w-[1600px] w-full mx-auto flex flex-col lg:flex-row gap-6 items-stretch">
        
        {/* LEFT MAIN AREA */}
        <div className="flex-1 flex flex-col justify-between space-y-4">
          
          <div className="space-y-4">
            {/* Category pills + Back button */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveView('mapa-mesas')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 bg-white border border-[#D5C7BA] text-[#1E110A] hover:border-[#DF7B1B] hover:text-[#DF7B1B] transition-all shadow-2xs"
                title="Volver a Salón de Mesas"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#DF7B1B]" />
                <span>Mesas</span>
              </button>
              {categories.map(cat => (
                <button
                  key={cat.label}
                  onClick={() => setSelectedCategory(cat.label)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${
                    selectedCategory === cat.label
                      ? 'bg-[#7B3F00] text-white shadow-xs'
                      : 'bg-white/80 border border-[#D5C7BA] text-[#1E110A] hover:bg-white'
                  }`}
                >
                  <span className={selectedCategory === cat.label ? 'text-amber-400' : 'text-[#8C7D73]'}>
                    {cat.icon}
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
                placeholder="Buscar producto ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D5C7BA] rounded-xl text-xs sm:text-sm font-medium text-[#1E110A] focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            {/* 6 Product Cards Grid (3 columns x 2 rows, matching Figma) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCatalog.map(product => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-[#E5DCD3] p-4 flex flex-col justify-between shadow-2xs hover:border-[#D5C7BA] transition-all"
                >
                  <div>
                    {/* Title + Price */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-[#1E110A] text-sm leading-snug">
                        {product.name}
                      </h3>
                      <span className="font-black text-[#8B4513] text-sm shrink-0">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>

                    {/* Description / Ingredients */}
                    <p className="text-xs text-[#8C7D73] mt-1.5 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Bottom: Portion badge + "+ Agregar" solid brown button */}
                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#F5EFEB]">
                    <span className="text-[11px] font-semibold text-[#8C7D73] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#E5DCD3]">
                      {product.portion}
                    </span>

                    <button
                      onClick={() => handleAddToCart(product)}
                      className="px-3.5 py-1.5 bg-[#8B4513] hover:bg-[#72380F] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 active:scale-95"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Toolbar: Mesa 02 | Cambiar Mesa */}
          <div className="bg-white/80 border border-[#D5C7BA] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 mt-4">
            
            <div className="flex items-center gap-3">
              {/* Table Pill */}
              <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E5DCD3] rounded-xl px-3 py-1.5 text-xs font-bold text-[#1E110A]">
                <Utensils className="w-3.5 h-3.5 text-[#8B4513]" />
                <span>Mesa 02</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView('mapa-mesas')}
                className="px-3.5 py-1.5 bg-[#7B3F00] hover:bg-[#683500] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Cambiar Mesa</span>
              </button>
            </div>

          </div>

        </div>

        {/* RIGHT SIDEBAR: Comanda Activa (Exact Figma Match) */}
        <aside className="w-full lg:w-[380px] bg-white rounded-2xl border border-[#E5DCD3] shadow-sm flex flex-col justify-between overflow-hidden shrink-0">
          
          <div>
            {/* Dark brown Header */}
            <div className="bg-[#7B3F00] text-white p-4">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest bg-[#5E2F00] px-2 py-0.5 rounded">
                  MESA 02
                </span>
                <span className="text-[10px] font-medium text-stone-300">
                  #312-KDS
                </span>
              </div>

              <h2 className="text-base font-black text-white tracking-tight mt-1">
                Comanda Activa
              </h2>
              <p className="text-xs text-stone-300 mt-0.5">
                Mesero: Carlos R.
              </p>
            </div>

            {/* Items List */}
            <div className="p-4 divide-y divide-[#F5EFEB] max-h-[calc(100vh-420px)] overflow-y-auto">
              {cartItems.map(item => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      {/* Brown square quantity badge */}
                      <span className="w-5 h-5 rounded bg-[#7B3F00] text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {item.quantity}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-[#1E110A] leading-tight">
                          {item.name}
                        </h4>
                        {item.modifier && (
                          <p className="text-[11px] text-[#8C7D73] mt-0.5">
                            {item.modifier}
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
                        onClick={() => handleUpdateQty(item.id, -1)}
                        className="text-[#8C7D73] hover:text-[#1E110A]"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-[#1E110A] w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(item.id, 1)}
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
                          setNotaTexto(item.modifier || '');
                        }}
                        className="flex items-center gap-1 text-[11px] font-bold text-[#8B4513] hover:text-[#DF7B1B]"
                      >
                        <MessageSquarePlus className="w-3 h-3" />
                        <span>{item.modifier ? 'Editar nota' : '+ Nota'}</span>
                      </button>

                      <button
                        onClick={() => handleRemove(item.id)}
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
          </div>

          {/* Pricing & Dispatch Buttons */}
          <div className="p-4 bg-[#FAF8F5] border-t border-[#E5DCD3] space-y-3">
            
            <div className="space-y-1 text-xs text-[#786B63]">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.length} artículos):</span>
                <span className="font-semibold text-[#1E110A]">${subtotal.toFixed(2)} MXN</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (16% Trasladado):</span>
                <span className="font-semibold text-[#1E110A]">${iva.toFixed(2)} MXN</span>
              </div>
              <div className="flex justify-between text-base font-black text-[#1E110A] pt-2 border-t border-[#E5DCD3]">
                <span>Total a Pagar:</span>
                <span className="text-xl text-[#7B3F00]">${total.toFixed(2)} <span className="text-xs font-bold text-[#786B63]">MXN</span></span>
              </div>
            </div>

            {/* Primary actions: Enviar a Cocina + Cobrar */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  Swal.fire({
                    title: 'Cocina',
                    text: 'Pedido enviado correctamente a cocina',
                    icon: 'success',
                    confirmButtonColor: '#7B3F00',
                  });
                }}
                className="py-3 bg-[#9E5416] hover:bg-[#86440E] text-white rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98"
              >
                <span>▷ Enviar a Cocina</span>
              </button>

              <button
                onClick={() => mostrarCobroModal(activeTableId || 'M02')}
                className="py-3 bg-[#8B4513] hover:bg-[#72380F] text-white rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98"
              >
                <CreditCard className="w-4 h-4" />
                <span>Cobrar</span>
              </button>
            </div>

            {/* Secondary action: Pre-cuenta */}
            <div className="pt-1">
              <button
                onClick={() => mostrarTicketModal(activeTableId || 'M02')}
                className="w-full py-2 px-3 bg-white hover:bg-stone-50 border border-[#D5C7BA] rounded-xl text-xs font-bold text-[#1E110A] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Receipt className="w-3.5 h-3.5 text-[#8C7D73]" />
                <span>Pre-cuenta</span>
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
                setCartItems((prev) =>
                  prev.map((it) =>
                    it.id === notaItemEditando.id
                      ? { ...it, modifier: notaTexto.trim() || undefined }
                      : it
                  )
                );
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
