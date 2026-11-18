import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import logoImg from "../img/logo.png";
import { Bell, ChevronRight, ChevronDown, LogOut } from "lucide-react";

type Status = "new" | "preparing" | "ready";
type Note = { text: string; allergy?: boolean };
type Dish = { quantity: number; name: string; notes: Note[] };
type Order = {
  table: string;
  number: string;
  waiter: string;
  status: Status;
  dishes: Dish[];
};

// Initial orders from Figma specifications
// M05 is set to "preparing" instead of "late", without red borders as requested
const initialOrders: Order[] = [
  {
    table: "M08",
    number: "#1048",
    waiter: "Sarai L.",
    status: "new",
    dishes: [
      {
        quantity: 2,
        name: "Latte (Vainilla)",
        notes: [{ text: "Leche deslactosada · Extra shot" }],
      },
      {
        quantity: 1,
        name: "Grilled Cheese Artesanal",
        notes: [{ text: "Bien dorado · Cortado en triángulos" }],
      },
    ],
  },
  {
    table: "M04",
    number: "#1039",
    waiter: "Gael O.",
    status: "new",
    dishes: [
      {
        quantity: 2,
        name: "Crepa Nutella & Frutos Rojos",
        notes: [{ text: "Una con la fruta aparte" }],
      },
      { quantity: 1, name: "Chai Latte", notes: [{ text: "Caliente · Sin azúcar" }] },
    ],
  },
  {
    table: "M05",
    number: "#1045",
    waiter: "Santi M.",
    status: "preparing",
    dishes: [
      { quantity: 1, name: "Hot Dog Gourmet", notes: [{ text: "Toppings: tocino y jalapeño" }] },
      {
        quantity: 1,
        name: "Hamburguesa Clásica",
        notes: [
          { text: "ALERGIA: sin lácteos (sin queso)", allergy: true },
          { text: "Término medio · Sin jitomate" },
        ],
      },
      { quantity: 1, name: "Smoothie (Mango)", notes: [{ text: "Con yogurt" }] },
    ],
  },
  {
    table: "M01",
    number: "#1042",
    waiter: "David H.",
    status: "preparing",
    dishes: [
      {
        quantity: 1,
        name: "Mini Hotcakes",
        notes: [
          { text: "ALERGIA: frutos secos", allergy: true },
          { text: "Base Lechera · Fruta Plátano · Topping Chispas" },
        ],
      },
      { quantity: 2, name: "Cappuccino", notes: [{ text: "Leche de avena · Uno descafeinado" }] },
    ],
  },
  {
    table: "M07",
    number: "#1049",
    waiter: "Gael O.",
    status: "preparing",
    dishes: [
      {
        quantity: 1,
        name: "Baguette de Pierna (Especial)",
        notes: [{ text: "Sin jitomate · Extra queso" }],
      },
      { quantity: 1, name: "Frappé (Moka)", notes: [{ text: "Sin crema" }] },
    ],
  },
  {
    table: "M03",
    number: "#1041",
    waiter: "Melissa H.",
    status: "ready",
    dishes: [
      { quantity: 1, name: "Club Sandwich Clásico", notes: [{ text: "Sin jitomate" }] },
      { quantity: 1, name: "Ensalada de Temporada", notes: [{ text: "Aderezo aparte" }] },
    ],
  },
];

const statusLabel: Record<Status, string> = {
  new: "NUEVA",
  preparing: "EN PREPARACIÓN",
  ready: "LISTA",
};

type Filter = "all" | "new" | "preparing" | "ready";

function OrderCard({ order, onAdvance }: { order: Order; onAdvance: (number: string) => void }) {
  const action =
    order.status === "new"
      ? "Iniciar preparación"
      : order.status === "ready"
        ? "Entregada a mesa"
        : "Marcar como lista";

  return (
    <article className={`kds-order-card kds-order-card--${order.status}`}>
      <div>
        <div className="kds-order-title">
          <strong>{order.table}</strong>
          <span>{order.number}</span>
        </div>
        <div className="kds-order-meta">
          <span className={`kds-status kds-status--${order.status}`}>{statusLabel[order.status]}</span>
          <span>Mesero: {order.waiter}</span>
        </div>
        <div className="kds-divider" />
        <div className="kds-dish-list">
          {order.dishes.map((dish) => (
            <div className="kds-dish" key={dish.name}>
              <span className="kds-quantity">{dish.quantity}×</span>
              <div className="kds-dish-content">
                <strong>{dish.name}</strong>
                {dish.notes.map((note) => (
                  <span
                    className={note.allergy ? "kds-note kds-note--allergy" : "kds-note"}
                    key={note.text}
                  >
                    {note.text}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <button
        className={`kds-order-action kds-order-action--${order.status}`}
        onClick={() => onAdvance(order.number)}
        type="button"
      >
        {action}
      </button>
    </article>
  );
}

export const CocinaKDSView = () => {
  const { logout } = useApp();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(
    () => ({
      all: orders.length,
      new: orders.filter((order) => order.status === "new").length,
      preparing: orders.filter((order) => order.status === "preparing").length,
      ready: orders.filter((order) => order.status === "ready").length,
    }),
    [orders],
  );

  const visibleOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  const advanceOrder = (number: string) => {
    setOrders((current) =>
      current
        .map((order) => {
          if (order.number !== number) return order;
          if (order.status === "new") return { ...order, status: "preparing" as const };
          if (order.status === "preparing") return { ...order, status: "ready" as const };
          return order;
        })
        .filter((order) => !(order.number === number && order.status === "ready")),
    );
  };

  const tabs: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: "Todas", count: counts.all },
    { id: "new", label: "Nuevas", count: counts.new },
    { id: "preparing", label: "En preparación", count: counts.preparing },
    { id: "ready", label: "Listas", count: counts.ready },
  ];

  return (
    <div className="kds-shell">
      {/* Top Bar matching Figma exact specifications */}
      <header className="kds-topbar">
        {/* Left: Brand logo & name */}
        <div className="kds-brand">
          <div className="kds-brand-logo">
            <img src={logoImg} alt="Logotipo de ¡Hola, Café!" />
          </div>
          <div className="kds-brand-info">
            <strong>¡Hola, Café!</strong>
            <span>COCINA</span>
          </div>
        </div>

        {/* Breadcrumb (without middle menu bar) */}
        <nav className="kds-breadcrumb" aria-label="Migas de pan">
          <span>Panel Principal</span>
          <ChevronRight className="w-3.5 h-3.5 text-white/60" />
          <strong>Cocina</strong>
        </nav>

        {/* Right: Notifications & Profile */}
        <div className="kds-user-tools">
          <button className="kds-notifications" type="button" aria-label="2 notificaciones">
            <Bell className="w-4 h-4 text-white" />
            <span>2</span>
          </button>
          <div className="kds-profile">
            <div className="w-8 h-8 rounded-full bg-[#523323] text-amber-300 font-bold text-xs flex items-center justify-center border border-amber-400/30">
              DM
            </div>
            <span className="kds-profile-copy">
              <strong>Dante M.</strong>
              <small>Cocinero</small>
            </span>
            <ChevronDown className="w-3 h-3 text-white/70" />
          </div>
        </div>
      </header>

      {/* Main KDS Content */}
      <main className="kds-main-content">
        <section className="kds-page-heading">
          <div>
            <h1>Cocina</h1>
            <p>Pedidos de cada mesa en tiempo real, con las especificaciones de cada platillo.</p>
          </div>
          <div className="kds-indicators">
            <div>
              <span>Activas</span>
              <strong>{counts.all}</strong>
            </div>
            <div>
              <span>Nuevas</span>
              <strong className="amber">{counts.new}</strong>
            </div>
            <div>
              <span>En preparación</span>
              <strong className="amber">{counts.preparing}</strong>
            </div>
          </div>
        </section>

        {/* Filters / Tabs */}
        <div className="kds-filters" role="tablist" aria-label="Filtrar comandas">
          {tabs.map((tab) => (
            <button
              aria-selected={filter === tab.id}
              className={filter === tab.id ? "active" : ""}
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              role="tab"
              type="button"
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        <section className="kds-orders-grid" aria-live="polite">
          {visibleOrders.map((order) => (
            <OrderCard key={order.number} order={order} onAdvance={advanceOrder} />
          ))}
          {visibleOrders.length === 0 && (
            <p className="kds-empty-state">No hay comandas en este estado.</p>
          )}
        </section>
      </main>

      {/* Footer session logout */}
      <footer className="kds-session-footer">
        <button type="button" onClick={() => logout()}>
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </button>
      </footer>
    </div>
  );
};
