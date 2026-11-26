import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { UsuarioPerfilNavbar } from "../components/UsuarioPerfilNavbar";
import logoImg from "../img/logo.png";
import manitaPedidoListoImg from "../img/ManitaPedidoListo.jpg";
import manitaNoIngredientesImg from "../img/ManitaNoIngredientes.jpg";
import { Bell, CheckCircle2, ChevronRight, Clock, LogOut, Trash2, UtensilsCrossed } from "lucide-react";
import Swal from "sweetalert2";
import { KitchenTicket } from "../types";

type Status = "new" | "preparing" | "ready";
type Note = { text: string; allergy?: boolean };
type Dish = {
  index: number;
  quantity: number;
  name: string;
  option?: string;
  notes: Note[];
};
type Order = {
  id: string;
  table: string;
  number: string;
  waiter: string;
  createdAt: string;
  status: Status;
  dishes: Dish[];
};

const statusLabel: Record<Status, string> = {
  new: "NUEVA",
  preparing: "EN PREPARACIÓN",
  ready: "LISTA",
};

type Filter = "all" | "new" | "preparing" | "ready";

function mapTicketStatus(status: KitchenTicket["status"]): Status {
  if (status === "En preparación") return "preparing";
  if (status === "Listas") return "ready";
  return "new";
}

function mapTicketToOrder(ticket: KitchenTicket): Order {
  return {
    id: ticket.id,
    table: ticket.tableId,
    number: `#${ticket.orderFolio}`,
    waiter: ticket.waiterName || "Mesero",
    createdAt: ticket.createdAt || "Ahora",
    status: mapTicketStatus(ticket.status),
    dishes: ticket.items.map((item, index) => {
      const notes: Note[] = [];
      if (item.notes) {
        notes.push({
          text: item.notes,
          allergy: item.notes.toLowerCase().includes("alergia"),
        });
      }
      return {
        index,
        quantity: item.quantity,
        name: item.name,
        option: item.option,
        notes,
      };
    }),
  };
}

function OrderCard({
  order,
  onAdvance,
  onCancelDish,
}: {
  order: Order;
  onAdvance: (order: Order) => void;
  onCancelDish: (order: Order, dish: Dish) => void;
}) {
  const totalPlatillos = order.dishes.reduce((acc, d) => acc + d.quantity, 0);

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

        {/* Resumen rápido del pedido */}
        <div className="mt-2.5 flex items-center justify-between text-[11px] font-semibold text-[#745853] bg-[#FAF7F2] border border-[#E8DFD8] rounded-lg px-2.5 py-1.5">
          <span className="inline-flex items-center gap-1">
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#DF7B1B]" />
            {totalPlatillos} {totalPlatillos === 1 ? "producto" : "productos"}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#8C7D73]" />
            {order.createdAt}
          </span>
        </div>

        <div className="kds-divider" />

        {/* Previsualización detallada de cada platillo/bebida */}
        <div className="kds-dish-list">
          {order.dishes.map((dish) => (
            <div
              className="kds-dish bg-[#FAF7F2] border border-[#EDE4DC] rounded-xl p-2.5 items-start"
              key={`${order.id}-${dish.index}-${dish.name}`}
            >
              <span className="kds-quantity shrink-0">{dish.quantity}×</span>
              <div className="kds-dish-content">
                <strong>{dish.name}</strong>
                {dish.option && (
                  <span className="inline-block w-fit px-2 py-0.5 rounded-md bg-white border border-[#E5DCD3] text-[11px] font-bold text-[#7B3F00]">
                    Opción: {dish.option}
                  </span>
                )}
                {dish.notes.map((note, noteIdx) => (
                  <span
                    className={note.allergy ? "kds-note kds-note--allergy" : "kds-note"}
                    key={`${order.id}-${dish.index}-${noteIdx}`}
                  >
                    {note.text}
                  </span>
                ))}
              </div>

              {order.status !== "ready" && (
                <button
                  type="button"
                  onClick={() => onCancelDish(order, dish)}
                  title="Quitar producto por falta de ingredientes y avisar al mesero"
                  className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#DC2626] hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Flujo de cocina: solo "Iniciar pedido" y "Marcar como lista". Se retira cuando el mesero confirma entrega */}
      {order.status === "new" && (
        <button
          className="kds-order-action kds-order-action--new"
          onClick={() => onAdvance(order)}
          type="button"
        >
          Iniciar pedido
        </button>
      )}

      {order.status === "preparing" && (
        <button
          className="kds-order-action kds-order-action--preparing"
          onClick={() => onAdvance(order)}
          type="button"
        >
          Marcar como lista
        </button>
      )}

      {order.status === "ready" && (
        <div className="mt-3.5 py-2.5 px-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-xs font-extrabold flex items-center justify-center gap-1.5 text-center">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Lista · Esperando entrega del mesero</span>
        </div>
      )}
    </article>
  );
}

export const CocinaKDSView = () => {
  const { logout, CocinaTickets, actualizarCocinaTicketStatus, cancelarProductoDesdeCocina } = useApp();
  const [filter, setFilter] = useState<Filter>("all");

  const orders = useMemo(
    () =>
      CocinaTickets.filter((ticket) => ticket.status !== "Entregadas").map(mapTicketToOrder),
    [CocinaTickets],
  );

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

  const advanceOrder = (order: Order) => {
    if (order.status === "new") {
      actualizarCocinaTicketStatus(order.id, "En preparación");
    } else if (order.status === "preparing") {
      actualizarCocinaTicketStatus(order.id, "Listas");
      Swal.fire({
        toast: true,
        position: "top-end",
        html: `
          <div style="display:flex;align-items:center;gap:12px;text-align:left;">
            <img src="${manitaPedidoListoImg}" alt="Pedido listo" style="width:50px;height:50px;object-fit:contain;border-radius:10px;flex-shrink:0;" />
            <div style="min-width:0;">
              <div style="font-size:13px;font-weight:800;color:#065F46;line-height:1.25;">¡Pedido listo! · ${order.table}</div>
              <div style="font-size:11.5px;color:#374151;margin-top:3px;line-height:1.35;">Se notificó a ${order.waiter} para pasar a recogerlo.</div>
            </div>
          </div>
        `,
        showConfirmButton: false,
        timer: 3200,
        timerProgressBar: true,
        background: "#FFFFFF",
        customClass: {
          popup: "rounded-2xl shadow-xl border border-[#A7F3D0] !p-3 !w-auto !max-w-sm",
          htmlContainer: "!m-0 !p-0",
        },
      });
    }
  };

  const handleCancelDish = async (order: Order, dish: Dish) => {
    const result = await Swal.fire({
      imageUrl: manitaNoIngredientesImg,
      imageWidth: 135,
      imageHeight: 135,
      imageAlt: "Manita sin ingredientes",
      title: "Quitar producto del pedido",
      html: `<p style="font-size:13px;color:#5C4E45;">Se eliminará <strong>${dish.quantity}× ${dish.name}</strong> de la comanda de <strong>${order.table}</strong> y se notificará al mesero para que avise al comensal.</p>`,
      input: "text",
      inputLabel: "Motivo (opcional)",
      inputValue: "Falta de ingredientes",
      inputPlaceholder: "Ej. Falta de ingredientes, producto agotado...",
      showCancelButton: true,
      confirmButtonText: "Eliminar y avisar al mesero",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#786B63",
      reverseButtons: true,
      background: "#FFFFFF",
      color: "#1E110A",
      customClass: {
        popup: "rounded-2xl shadow-xl border border-[#EFE6DA]",
        image: "mx-auto mb-2 object-contain",
        title: "text-[#1E110A] font-extrabold text-xl",
        confirmButton: "rounded-xl px-5 py-2.5 font-bold",
        cancelButton: "rounded-xl px-5 py-2.5 font-bold",
      },
    });

    if (result.isConfirmed) {
      cancelarProductoDesdeCocina(order.id, dish.index, result.value);
      Swal.fire({
        toast: true,
        position: "top-end",
        html: `
          <div style="display:flex;align-items:center;gap:12px;text-align:left;">
            <img src="${manitaNoIngredientesImg}" alt="Sin ingredientes" style="width:48px;height:48px;object-fit:contain;border-radius:10px;flex-shrink:0;" />
            <div style="min-width:0;">
              <div style="font-size:13px;font-weight:800;color:#92400E;line-height:1.25;">Producto retirado · ${order.table}</div>
              <div style="font-size:11.5px;color:#5C4E45;margin-top:2px;line-height:1.35;">Se notificó a ${order.waiter} para avisar al comensal.</div>
            </div>
          </div>
        `,
        showConfirmButton: false,
        timer: 3200,
        timerProgressBar: true,
        background: "#FFFFFF",
        customClass: {
          popup: "rounded-2xl shadow-xl border border-[#FDE68A] !p-3 !w-auto !max-w-sm",
          htmlContainer: "!m-0 !p-0",
        },
      });
    }
  };

  const tabs: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: "Todas", count: counts.all },
    { id: "new", label: "Nuevas", count: counts.new },
    { id: "preparing", label: "En preparación", count: counts.preparing },
    { id: "ready", label: "Listas", count: counts.ready },
  ];

  return (
    <div className="kds-shell">
      {/* Top Bar */}
      <header className="kds-topbar">
        <div className="kds-brand">
          <div className="kds-brand-logo">
            <img src={logoImg} alt="Logotipo de ¡Hola, Café!" />
          </div>
          <div className="kds-brand-info">
            <strong>¡Hola, Café!</strong>
            <span>COCINA</span>
          </div>
        </div>

        <nav className="kds-breadcrumb" aria-label="Migas de pan">
          <span>Panel Principal</span>
          <ChevronRight className="w-3.5 h-3.5 text-white/60" />
          <strong>Cocina</strong>
        </nav>

        <div className="kds-user-tools">
          <button
            className="kds-notifications"
            type="button"
            aria-label={`${counts.new} pedidos nuevos`}
            onClick={() => setFilter("new")}
          >
            <Bell className="w-4 h-4 text-white" />
            <span>{counts.new}</span>
          </button>
          <UsuarioPerfilNavbar variante="oscura" />
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
            <OrderCard
              key={order.id}
              order={order}
              onAdvance={advanceOrder}
              onCancelDish={handleCancelDish}
            />
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
