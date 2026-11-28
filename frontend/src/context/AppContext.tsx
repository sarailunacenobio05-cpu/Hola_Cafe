import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import manitaTiteImg from '../img/ManitaTite.jpg';
import manitaDudaImg from '../img/ManitaDuda.jpg';
import manitaPedidoListoImg from '../img/ManitaPedidoListo.jpg';
import manitaNoIngredientesImg from '../img/ManitaNoIngredientes.jpg';
import { authService, UsuarioDTO } from '../api/authService';
import {
  User,
  MenuItem,
  IoTDevice,
  TableInfo,
  CocinaTicket,
  CashClosingRecord,
  ActiveView,
  OrderItem
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_MENU_ITEMS,
  INITIAL_IOT_DEVICES,
  INITIAL_TABLES,
  INITIAL_KITCHEN_TICKETS,
  INITIAL_CASH_CLOSINGS
} from '../data/mockData';

export interface BarAlert {
  id: string;
  dbId?: number;
  tableId: string;
  message: string;
  time: string;
  tipo?: 'boton' | 'cocina' | 'cocina-cancelacion';
  waiterId?: string;
  waiterName?: string;
}

export const esAlertaParaMesero = (alerta: BarAlert, user: User | null): boolean => {
  if (alerta.tipo !== 'cocina' && alerta.tipo !== 'cocina-cancelacion') return true;
  if (!alerta.waiterId && !alerta.waiterName) return true;
  if (!user) return false;
  if (alerta.waiterId && user.id && alerta.waiterId === user.id) return true;
  if (
    alerta.waiterName &&
    user.name &&
    alerta.waiterName.trim().toLowerCase() === user.name.trim().toLowerCase()
  ) {
    return true;
  }
  return false;
};

export interface AdminNotificacion {
  id: string;
  tipo: 'bateria' | 'corte';
  titulo: string;
  mensaje: string;
  hora: string;
  vistaDestino: ActiveView;
}

export interface CorteCajaItem {
  id: string;
  fecha: string;
  fechaClave?: string;
  horaCorte?: string;
  mesero: string;
  total: number;
  tickets?: number;
}

export interface TicketRegistrado {
  id: string;
  folio: string;
  fechaClave: string;
  hora: string;
  pago: 'Efectivo' | 'Tarjeta' | 'Transferencia';
  estado: 'Pagado' | 'Cancelado';
  mesa: string;
  mesero: string;
  personas: number;
  lineas: {
    cantidad: number;
    nombre: string;
    detalle: string;
    precioUnitario: number;
  }[];
  subtotal: number;
  descuento: number;
  propina: number;
  total: number;
  corteId?: string;
}

interface AppContextType {
  currentUser: User | null;
  activeView: ActiveView;
  activeTableId: string | null;
  tables: TableInfo[];
  menuItems: MenuItem[];
  users: User[];
  iotDevices: IoTDevice[];
  CocinaTickets: CocinaTicket[];
  cashClosings: CashClosingRecord[];
  cortesCaja: CorteCajaItem[];
  ticketsRegistrados: TicketRegistrado[];
  ventasPendientesCorte: number;
  ticketsPendientesCorte: number;
  barAlerts: BarAlert[];
  adminNotificaciones: AdminNotificacion[];
  mesasAtendidas: Record<string, boolean>;

  isCobroModalOpen: boolean;
  isProductoModalOpen: boolean;
  productoEditando: MenuItem | null;
  isUsuarioModalOpen: boolean;
  isBotonModalOpen: boolean;
  botonEditando: IoTDevice | null;
  isConfirmBajaModalOpen: boolean;
  usuarioBaja: User | null;
  isConfirmEliminarModalOpen: boolean;
  productoAEliminar: MenuItem | null;

  login: (correo: string, password: string, remember?: boolean) => Promise<boolean>;
  loginWithGoogle: (credential: string, remember?: boolean) => Promise<boolean>;
  logout: () => void;
  setActiveView: (view: ActiveView) => void;
  selectTable: (tableId: string | null) => void;

  agregarItemToOrder: (tableId: string, item: MenuItem, selectedOption?: string, notes?: string) => void;
  actualizarItemQuantity: (tableId: string, itemId: string, delta: number) => void;
  actualizarNotaItemOrder: (tableId: string, itemId: string, notes?: string) => void;
  eliminarItemFromOrder: (tableId: string, itemId: string) => void;
  enviarOrdenACocina: (tableId: string) => void;

  actualizarCocinaTicketStatus: (ticketId: string, newStatus: CocinaTicket['status']) => void;
  alternarItemCocinaCompletado: (ticketId: string, itemIndex: number) => void;
  cancelarProductoDesdeCocina: (ticketId: string, itemIndex: number, motivo?: string) => void;

  mostrarCobroModal: (tableId: string) => void;
  cerrarCobroModal: () => void;
  registrarTicketCobro: (
    tableId: string,
    discount: number,
    tipPercent: number,
    method: 'Terminal Bancaria' | 'Efectivo en Mesa' | 'Transferencia QR / CoDi',
    customTipAmount?: number,
    redondeoAmount?: number
  ) => TicketRegistrado | null;
  procesarPagoYLiberar: (tableId: string, discount: number, tipPercent: number, method: 'Terminal Bancaria' | 'Efectivo en Mesa' | 'Transferencia QR / CoDi', customTipAmount?: number, redondeoAmount?: number) => void;
  liberarMesaDirectamente: (tableId: string) => void;
  realizarCorteCaja: () => CorteCajaItem | null;

  activarAlertaBarra: (tableId: string, message: string) => void;
  descartarAlertaBarra: (id: string) => void;
  marcarMesaAtendida: (tableId: string) => void;
  agregarAdminNotificacion: (notificacion: Omit<AdminNotificacion, 'id' | 'hora'>) => void;
  descartarAdminNotificacion: (id: string) => void;

  mostrarAddProductModal: () => void;
  mostrarEditProductModal: (product: MenuItem) => void;
  cerrarProductModal: () => void;
  guardarProducto: (product: Partial<MenuItem>) => void;
  mostrarConfirmEliminarModal: (product: MenuItem) => void;
  cerrarConfirmEliminarModal: () => void;
  confirmarBorrarProducto: () => void;
  actualizarDescuentoProducto: (productId: string, discountPercent: number) => void;

  mostrarAddUserModal: () => void;
  cerrarAddUserModal: () => void;
  guardarUser: (userData: Partial<User> & { password?: string }) => Promise<void>;
  actualizarRolUsuario: (userId: string, newRole: User['role']) => Promise<void>;
  mostrarConfirmBajaModal: (user: User) => void;
  cerrarConfirmBajaModal: () => void;
  confirmarBajaUser: () => Promise<void>;
  reactivarUser: (userId: string) => void;

  mostrarAddBotonModal: () => void;
  mostrarEditBotonModal: (boton: IoTDevice) => void;
  cerrarAddBotonModal: () => void;
  guardarBoton: (botonData: Partial<IoTDevice>) => Promise<void>;
  eliminarBoton: (botonId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const VIEW_TO_PATH: Record<ActiveView, string> = {
  'login': '/login',
  'recuperar-password': '/recuperar-password',
  'mapa-mesas': '/mesas',
  'comandero': '/comandero',
  'cocina': '/cocina',
  'caja': '/admin/caja',
  'revision-tickets': '/admin/tickets',
  'config-menu': '/admin/menu',
  'config-descuentos': '/admin/descuentos',
  'config-usuarios': '/admin/usuarios',
  'botones-aviso': '/admin/botones',
};

const PATH_TO_VIEW: Record<string, ActiveView> = {
  '/login': 'login',
  '/recuperar-password': 'recuperar-password',
  '/mesas': 'mapa-mesas',
  '/comandero': 'comandero',
  '/cocina': 'cocina',
  '/admin/caja': 'caja',
  '/admin/tickets': 'revision-tickets',
  '/admin/menu': 'config-menu',
  '/admin/descuentos': 'config-descuentos',
  '/admin/usuarios': 'config-usuarios',
  '/admin/botones': 'botones-aviso',
};
function adaptarUsuarioBackend(backendUser: UsuarioDTO): User {
  const initials =
    backendUser.nombre
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'HC';

  return {
    id: backendUser.id,
    name: backendUser.nombre,
    initials,
    username: backendUser.correo,
    role:
      backendUser.rol === 'ROLE_ADMINISTRADOR'
        ? 'Administrador'
        : backendUser.rol === 'ROLE_COCINERO'
          ? 'Cocinero'
          : 'Mesero',
    shift: 'Turno completo',
    lastAccess: 'En línea',
    status: backendUser.estado === 'ACTIVO' ? 'ACTIVO' : 'BAJA',
    avatar: backendUser.avatarUrl || '/img/admin-avatar.jpg',
    authMethod: backendUser.metodoAcceso?.toUpperCase() === 'GOOGLE' ? 'Google' : 'Correo',
    registeredAt: backendUser.fechaRegistro || '—',
  };
}
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const backendUser = authService.getUsuarioActual();
    return backendUser ? adaptarUsuarioBackend(backendUser) : null;
  });
  const [activeView, setActiveViewState] = useState<ActiveView>(
    PATH_TO_VIEW[location.pathname] || 'login'
  );
  const ACTIVE_TABLE_STORAGE_KEY = 'holacafe_active_table_id';
  const TABLES_STORAGE_KEY = 'holacafe_tables_state_v1';
  const BAR_ALERTS_STORAGE_KEY = 'holacafe_bar_alerts_v1';
  const MESAS_ATENDIDAS_STORAGE_KEY = 'holacafe_mesas_atendidas_v1';
  const COCINA_TICKETS_STORAGE_KEY = 'holacafe_cocina_tickets_v1';

  const [activeTableId, setActiveTableIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_TABLE_STORAGE_KEY) || 'M01';
    } catch {
      return 'M01';
    }
  });

  const setActiveTableId = (tableId: string | null) => {
    setActiveTableIdState(tableId);
    try {
      if (tableId) {
        localStorage.setItem(ACTIVE_TABLE_STORAGE_KEY, tableId);
      } else {
        localStorage.removeItem(ACTIVE_TABLE_STORAGE_KEY);
      }
    } catch { }
  };

  const setActiveView = (view: ActiveView) => {
    setActiveViewState(view);
    const targetPath = VIEW_TO_PATH[view];
    if (targetPath && location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  useEffect(() => {
    const matchedView = PATH_TO_VIEW[location.pathname];
    if (matchedView && matchedView !== activeView) {
      setActiveViewState(matchedView);
    }

    // Solo al entrar o regresar a /login (por ejemplo con las flechas del navegador)
    // cerramos la sesión activa para impedir volver con la flecha de adelante.
    if (location.pathname === '/login' && authService.getToken()) {
      authService.logout();
      setCurrentUser(null);
    }
  }, [location.pathname]);

  const TICKET_FOLIO_STORAGE_KEY = 'holacafe_last_ticket_folio_v1';

  const leerUltimoFolioGuardado = (mesasActuales: TableInfo[]): number => {
    const maxEnMesas = mesasActuales.reduce((max, t) => {
      const f = t.currentOrder?.folio;
      return typeof f === 'number' && f >= 1000 && f < 2000 ? Math.max(max, f) : max;
    }, 1041);

    let ultimoGuardado = 1041;
    try {
      const raw = localStorage.getItem(TICKET_FOLIO_STORAGE_KEY);
      if (raw) {
        const parsed = parseInt(raw, 10);
        if (Number.isFinite(parsed) && parsed >= 1000) {
          ultimoGuardado = parsed;
        }
      }
    } catch { }

    return Math.max(ultimoGuardado, maxEnMesas);
  };

  const [tables, setTables] = useState<TableInfo[]>(() => {
    try {
      const saved = localStorage.getItem(TABLES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalizar cualquier folio aleatorio heredado (>= 2000) a consecutivo para todas las mesas 1-9
          let ultimo = leerUltimoFolioGuardado(parsed);
          let huboCambio = false;
          const normalizadas = parsed.map((t: TableInfo) => {
            if (t.currentOrder && (t.currentOrder.folio >= 2000 || t.currentOrder.folio < 1000)) {
              ultimo += 1;
              huboCambio = true;
              return {
                ...t,
                currentOrder: {
                  ...t.currentOrder,
                  folio: ultimo,
                },
              };
            }
            return t;
          });
          if (huboCambio) {
            try {
              localStorage.setItem(TICKET_FOLIO_STORAGE_KEY, String(ultimo));
            } catch { }
          }
          return normalizadas;
        }
      }
    } catch { }
    return INITIAL_TABLES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(TABLES_STORAGE_KEY, JSON.stringify(tables));
    } catch { }
  }, [tables]);

  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [iotDevices, setIotDevices] = useState<IoTDevice[]>(INITIAL_IOT_DEVICES);
  const [CocinaTickets, setCocinaTickets] = useState<CocinaTicket[]>(() => {
    try {
      const saved = localStorage.getItem(COCINA_TICKETS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch { }
    return INITIAL_KITCHEN_TICKETS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(COCINA_TICKETS_STORAGE_KEY, JSON.stringify(CocinaTickets));
    } catch { }
  }, [CocinaTickets]);

  // Sincronización en tiempo real entre pestañas (ej. Mesero en una pestaña y Cocina en otra)
  useEffect(() => {
    const handleStorageSync = (e: StorageEvent) => {
      if (e.key === COCINA_TICKETS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setCocinaTickets(parsed);
        } catch { }
      }
      if (e.key === TABLES_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setTables(parsed);
        } catch { }
      }
      if (e.key === 'holacafe_product_discounts_v1') {
        try {
          const descuentos: Record<string, number> = JSON.parse(e.newValue || '{}');
          setMenuItems((prevMenu) => {
            const nextMenu = prevMenu.map((p) => ({
              ...p,
              discountPercent: descuentos[p.id] || 0,
            }));
            setTables((prevTables) =>
              prevTables.map((t) => {
                if (!t.currentOrder) return t;
                return {
                  ...t,
                  currentOrder: {
                    ...t.currentOrder,
                    items: t.currentOrder.items.map((it) => {
                      const prod = nextMenu.find((m) => m.id === it.menuItemId);
                      if (!prod) return it;
                      const pct = descuentos[prod.id] || 0;
                      const orig = it.originalPrice ?? prod.price;
                      const finalUnit = pct > 0 ? Number((orig * (1 - pct / 100)).toFixed(2)) : orig;
                      return { ...it, originalPrice: orig, discountPercent: pct, price: finalUnit };
                    }),
                  },
                };
              })
            );
            return nextMenu;
          });
        } catch { }
      }
      if (e.key === BAR_ALERTS_STORAGE_KEY && e.newValue) {
        try {
          const parsed: BarAlert[] = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setBarAlerts(parsed);
          }
        } catch { }
      }
      if (e.key === CORTES_CAJA_STORAGE_KEY && e.newValue) {
        try {
          const parsed: CorteCajaItem[] = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setCortesCaja(parsed);
        } catch { }
      }
      if (e.key === TICKETS_REGISTRADOS_STORAGE_KEY && e.newValue) {
        try {
          const parsed: TicketRegistrado[] = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setTicketsRegistrados(parsed);
        } catch { }
      }
      if (e.key === 'holacafe_menu_updated_v1') {
        cargarDatosBackend();
      }
    };
    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, []);
  const CORTES_CAJA_STORAGE_KEY = 'holacafe_cortes_caja_v1';
  const TICKETS_REGISTRADOS_STORAGE_KEY = 'holacafe_tickets_registrados_v1';

  const aClaveFechaLocal = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const [cashClosings, setCashClosings] = useState<CashClosingRecord[]>(INITIAL_CASH_CLOSINGS);
  const [cortesCaja, setCortesCaja] = useState<CorteCajaItem[]>(() => {
    try {
      const saved = localStorage.getItem(CORTES_CAJA_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch { }
    return [];
  });
  const normalizarSecuenciaTickets = (lista: TicketRegistrado[]): TicketRegistrado[] => {
    if (!Array.isArray(lista) || lista.length === 0) return [];
    // En ticketsRegistrados los más recientes están al principio ([nuevoTicket, ...prev]),
    // por lo que el orden cronológico de cobro va del último elemento al primero.
    const cronologicos = [...lista].reverse();
    const baseFolio = 1035;
    const resecuenciados = cronologicos.map((t, index) => {
      const folioLineal = baseFolio + index;
      return {
        ...t,
        folio: `#${folioLineal}`,
      };
    });
    return resecuenciados.reverse();
  };

  const obtenerSiguienteFolioCobro = (listaTickets: TicketRegistrado[]): number => {
    const baseFolio = 1035;
    if (!listaTickets || listaTickets.length === 0) return baseFolio;
    const maxFolioCobrado = listaTickets.reduce((max, t) => {
      const num = parseInt(String(t.folio || '').replace(/\D+/g, ''), 10);
      return Number.isFinite(num) && num >= baseFolio ? Math.max(max, num) : max;
    }, baseFolio - 1);
    return maxFolioCobrado + 1;
  };

  const [ticketsRegistrados, setTicketsRegistrados] = useState<TicketRegistrado[]>(() => {
    try {
      const saved = localStorage.getItem(TICKETS_REGISTRADOS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return normalizarSecuenciaTickets(parsed);
      }
    } catch { }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(CORTES_CAJA_STORAGE_KEY, JSON.stringify(cortesCaja));
    } catch { }
  }, [cortesCaja]);

  useEffect(() => {
    try {
      localStorage.setItem(TICKETS_REGISTRADOS_STORAGE_KEY, JSON.stringify(ticketsRegistrados));
    } catch { }
  }, [ticketsRegistrados]);

  const ticketsPendientesList = ticketsRegistrados.filter(
    (t) => !t.corteId && t.estado === 'Pagado'
  );
  const ventasPendientesCorte = Number(
    ticketsPendientesList.reduce((acc, t) => acc + t.total, 0).toFixed(2)
  );
  const ticketsPendientesCorte = ticketsPendientesList.length;

  const cargarDatosBackend = async () => {
    try {
      // 1. Cargar Productos del menú
      const resProd = await api.get('/productos');
      if (Array.isArray(resProd.data) && resProd.data.length > 0) {
        let descuentosGuardados: Record<string, number> = {};
        try {
          descuentosGuardados = JSON.parse(
            localStorage.getItem('holacafe_product_discounts_v1') || '{}'
          );
        } catch {}

        setMenuItems(
          resProd.data.map((p: any) => ({
            id: p.id,
            name: p.nombre,
            category: p.categoria || p.categoriaNombre || 'Sin categoría',
            description: p.descripcion || '',
            price: Number(p.precio),
            discountPercent: descuentosGuardados[p.id] || 0,
            status: (p.estado as 'DISPONIBLE' | 'AGOTADO' | 'OCULTO') || 'DISPONIBLE',
            options: p.opciones ? p.opciones.map((o: any) => o.nombre) : [],
            allowKitchenNotes: Boolean(p.permiteNotasCocina),
          }))
        );
      }

      if (authService.getToken()) {
        // 2. Cargar Mesas (preservando estado local y comandas activas de las mesas)
        try {
          const resMesas = await api.get('/mesas');
          if (Array.isArray(resMesas.data) && resMesas.data.length > 0) {
            const tieneEstadoGuardado = Boolean(localStorage.getItem(TABLES_STORAGE_KEY));
            setTables((prev) =>
              resMesas.data.map((m: any) => {
                const tableId = `M${m.numero < 10 ? `0${m.numero}` : m.numero}`;
                const prevTable = prev.find((t) => t.id === tableId || t.id === m.id);
                return {
                  id: tableId,
                  dbId: m.id,
                  number: m.numero,
                  capacity: m.capacidad,
                  status: (tieneEstadoGuardado && prevTable?.status) ? prevTable.status : (m.estado || 'Limpia / Disponible'),
                  guests: prevTable?.guests || 0,
                  waiterName: prevTable?.waiterName || m.meseroNombre,
                  hasAlert: prevTable?.hasAlert ?? false,
                  alertType: prevTable?.alertType,
                  currentOrder: prevTable?.currentOrder,
                };
              })
            );
          }
        } catch { }

        // 3. Cargar Botones 
        try {
          const resBot = await api.get('/mesas/botones');
          if (Array.isArray(resBot.data)) {
            setIotDevices(
              resBot.data.map((b: any) => ({
                id: b.id,
                name: b.nombre || `Botón de Mesa ${b.mesaNumero ? (b.mesaNumero < 10 ? `0${b.mesaNumero}` : b.mesaNumero) : ''}`.trim(),
                tableId: b.mesaId || (b.mesaNumero ? `M${b.mesaNumero < 10 ? `0${b.mesaNumero}` : b.mesaNumero}` : ''),
                batteryPercentage: Number(b.bateria ?? 100),
                status:
                  b.estado === 'Sin conexión'
                    ? 'Sin conexión'
                    : Number(b.bateria ?? 100) <= 10
                      ? 'Batería crítica'
                      : Number(b.bateria ?? 100) <= 25
                        ? 'Batería baja'
                        : b.estado === 'ONLINE' || b.estado === 'En línea'
                          ? 'En línea'
                          : 'Sin conexión',
                lastConnection: b.estado === 'Sin conexión' ? 'Sin señal' : 'En línea',
              }))
            );
          }
        } catch { }

        // 4. Cargar Usuarios y Cortes
        try {
          const resUsers = await api.get('/usuarios');
          if (Array.isArray(resUsers.data)) {
            setUsers(resUsers.data.map((u: UsuarioDTO) => adaptarUsuarioBackend(u)));
          }
        } catch { }

        try {
          const resCortes = await api.get('/cortes-caja');
          if (Array.isArray(resCortes.data) && resCortes.data.length > 0) {
            setCashClosings(
              resCortes.data.map((c: any) => ({
                id: c.folio,
                folio: c.folio,
                date: new Date(c.fecha).toLocaleString('es-MX'),
                responsible: c.responsableNombre,
                totalSales: Number(c.totalVentas),
                cashAmount: Number(c.montoEfectivo),
                cardAmount: Number(c.montoTarjeta),
                difference: 0,
                status: 'Completado' as const,
                ticketsCount: c.totalTickets,
              }))
            );
          }
        } catch { }
      }
    } catch (err) {
      console.error('Error sincronizando con backend:', err);
    }
  };

  useEffect(() => {
    cargarDatosBackend();
  }, [currentUser]);

  // Sincronización periódica de alertas físicas (ESP32) y batería de botones IoT
  useEffect(() => {
    if (!currentUser || !authService.getToken()) return;
    if (currentUser.role !== 'Administrador' && currentUser.role !== 'Mesero') return;

    let activo = true;

    const sincronizarIoT = async () => {
      try {
        const [resAlertas, resBotones] = await Promise.all([
          api.get('/mesas/alertas'),
          api.get('/mesas/botones'),
        ]);

        if (!activo) return;

        if (Array.isArray(resBotones.data)) {
          const nextBotones: IoTDevice[] = resBotones.data.map((b: any) => ({
            id: b.id,
            name:
              b.nombre ||
              `Botón de Mesa ${b.mesaNumero ? (b.mesaNumero < 10 ? `0${b.mesaNumero}` : b.mesaNumero) : ''}`.trim(),
            tableId:
              b.mesaId ||
              (b.mesaNumero ? `M${b.mesaNumero < 10 ? `0${b.mesaNumero}` : b.mesaNumero}` : ''),
            batteryPercentage: Number(b.bateria ?? 100),
            status:
              b.estado === 'Sin conexión'
                ? 'Sin conexión'
                : Number(b.bateria ?? 100) <= 10
                  ? 'Batería crítica'
                  : Number(b.bateria ?? 100) <= 25
                    ? 'Batería baja'
                    : b.estado === 'ONLINE' || b.estado === 'En línea'
                      ? 'En línea'
                      : 'Sin conexión',
            lastConnection: b.estado === 'Sin conexión' ? 'Sin señal' : 'En línea',
          }));

          setIotDevices((prev) =>
            JSON.stringify(prev) === JSON.stringify(nextBotones) ? prev : nextBotones
          );
        }

        if (Array.isArray(resAlertas.data)) {
          const nuevasAlertas: BarAlert[] = [];
          const mesasConAlerta = new Set<string>();

          resAlertas.data.forEach((a: any) => {
            if (!a.estado) return;
            const tableId = a.mesaNumero
              ? `M${a.mesaNumero < 10 ? `0${a.mesaNumero}` : a.mesaNumero}`
              : a.mesaId;
            if (!tableId) return;

            const alertId = `db-al-${a.id}`;
            if (!notifiedAlertIdsRef.current.has(alertId)) {
              notifiedAlertIdsRef.current.add(alertId);
              mesasConAlerta.add(tableId);
              nuevasAlertas.push({
                id: alertId,
                dbId: a.id,
                tableId,
                message: 'Llamada desde botón físico de mesa',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                tipo: 'boton',
              });
            }
          });

          if (nuevasAlertas.length > 0) {
            setBarAlerts((prev) => {
              const idsExistentes = new Set(prev.map((x) => x.id));
              const filtradas = nuevasAlertas.filter((n) => !idsExistentes.has(n.id));
              return filtradas.length > 0 ? [...filtradas, ...prev] : prev;
            });

            setMesasAtendidas((prev) => {
              const next = { ...prev };
              mesasConAlerta.forEach((tid) => {
                next[tid] = false;
              });
              return next;
            });

            setTables((prev) =>
              prev.map((t) =>
                mesasConAlerta.has(t.id)
                  ? { ...t, hasAlert: true, alertType: 'Llamada de cliente' }
                  : t
              )
            );

            const reciente = nuevasAlertas[0];
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'warning',
              title: `${reciente.tableId.replace('M', 'Mesa ')} presionó el botón`,
              text: reciente.message,
              showConfirmButton: false,
              timer: 4000,
              timerProgressBar: true,
              background: '#FFF5F5',
              color: '#1E110A',
            });
          }
        }
      } catch {
        // Silenciar errores transitorios de red en polling
      }
    };

    sincronizarIoT();
    const intervalId = window.setInterval(sincronizarIoT, 3000);
    return () => {
      activo = false;
      window.clearInterval(intervalId);
    };
  }, [currentUser]);

  const [barAlerts, setBarAlerts] = useState<BarAlert[]>(() => {
    try {
      const saved = localStorage.getItem(BAR_ALERTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch { }
    return [
      { id: 'al-1', tableId: 'M01', message: 'Mesa 01 presionó el botón de aviso', time: '14:31' },
      { id: 'al-2', tableId: 'M05', message: 'Mesa 05 solicita atención del mesero', time: '14:28' },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(BAR_ALERTS_STORAGE_KEY, JSON.stringify(barAlerts));
    } catch { }
  }, [barAlerts]);

  const notifiedAlertIdsRef = useRef<Set<string>>(new Set());

  // Mostrar alerta en vivo únicamente al mesero que envió la comanda cuando Cocina la finaliza o cancela un platillo
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'Mesero') return;

    const alertasCocinaParaMi = barAlerts.filter(
      (a) =>
        (a.tipo === 'cocina' || a.tipo === 'cocina-cancelacion') &&
        esAlertaParaMesero(a, currentUser) &&
        !notifiedAlertIdsRef.current.has(a.id)
    );

    if (alertasCocinaParaMi.length === 0) return;

    alertasCocinaParaMi.forEach((a) => notifiedAlertIdsRef.current.add(a.id));
    const reciente = alertasCocinaParaMi[0];

    if (reciente.tipo === 'cocina-cancelacion') {
      const tituloCancel = `Sin ingredientes · ${reciente.tableId.replace('M', 'Mesa ')}`;
      Swal.fire({
        toast: true,
        position: 'top-end',
        html: `
          <div style="display:flex;align-items:center;gap:12px;text-align:left;">
            <img src="${manitaNoIngredientesImg}" alt="Sin ingredientes" style="width:52px;height:52px;object-fit:contain;border-radius:10px;flex-shrink:0;" />
            <div style="min-width:0;">
              <div style="font-size:13px;font-weight:800;color:#92400E;line-height:1.25;">${tituloCancel}</div>
              <div style="font-size:11.5px;color:#374151;margin-top:3px;line-height:1.35;">${reciente.message}</div>
            </div>
          </div>
        `,
        showConfirmButton: false,
        timer: 6500,
        timerProgressBar: true,
        background: '#FFFFFF',
        customClass: {
          popup: 'rounded-2xl shadow-xl border border-[#FDE68A] !p-3 !w-auto !max-w-sm',
          htmlContainer: '!m-0 !p-0',
        },
      });
    } else {
      const mesaTitulo = `¡Pedido listo! · ${reciente.tableId.replace('M', 'Mesa ')}`;
      Swal.fire({
        toast: true,
        position: 'top-end',
        html: `
          <div style="display:flex;align-items:center;gap:12px;text-align:left;">
            <img src="${manitaPedidoListoImg}" alt="Pedido listo" style="width:52px;height:52px;object-fit:contain;border-radius:10px;flex-shrink:0;" />
            <div style="min-width:0;">
              <div style="font-size:13px;font-weight:800;color:#065F46;line-height:1.25;">${mesaTitulo}</div>
              <div style="font-size:11.5px;color:#374151;margin-top:3px;line-height:1.35;">${reciente.message}</div>
            </div>
          </div>
        `,
        showConfirmButton: false,
        timer: 6500,
        timerProgressBar: true,
        background: '#FFFFFF',
        customClass: {
          popup: 'rounded-2xl shadow-xl border border-[#A7F3D0] !p-3 !w-auto !max-w-sm',
          htmlContainer: '!m-0 !p-0',
        },
      });
    }
  }, [barAlerts, currentUser]);

  const [mesasAtendidas, setMesasAtendidas] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(MESAS_ATENDIDAS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch { }
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem(MESAS_ATENDIDAS_STORAGE_KEY, JSON.stringify(mesasAtendidas));
    } catch { }
  }, [mesasAtendidas]);

  const ADMIN_NOTIFS_DISMISSED_KEY = 'holacafe_admin_notifs_leidas';
  const ADMIN_NOTIFS_CUSTOM_KEY = 'holacafe_admin_notifs_custom';

  const leerNotifsLeidas = (): string[] => {
    try {
      const raw = localStorage.getItem(ADMIN_NOTIFS_DISMISSED_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const leerNotifsCustom = (): AdminNotificacion[] => {
    try {
      const raw = localStorage.getItem(ADMIN_NOTIFS_CUSTOM_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const [adminNotificaciones, setAdminNotificaciones] = useState<AdminNotificacion[]>(() => {
    const leidas = new Set(leerNotifsLeidas());
    const custom = leerNotifsCustom();

    const baseNotifs: AdminNotificacion[] = INITIAL_IOT_DEVICES
      .filter(d => d.batteryPercentage <= 25)
      .map(d => ({
        id: `notif-bat-${d.id}`,
        tipo: 'bateria' as const,
        titulo: d.batteryPercentage <= 10 ? `Batería crítica (${d.id})` : `Batería baja (${d.id})`,
        mensaje: `El botón de ${d.tableId.replace('M', 'Mesa ')} tiene ${d.batteryPercentage}% de batería.`,
        hora: d.lastConnection,
        vistaDestino: 'botones-aviso' as ActiveView,
      }));

    if (INITIAL_CASH_CLOSINGS[0]) {
      const ultimo = INITIAL_CASH_CLOSINGS[0];
      baseNotifs.push({
        id: `notif-corte-${ultimo.id}`,
        tipo: 'corte',
        titulo: `Corte de caja ${ultimo.folio}`,
        mensaje: `Realizado por ${ultimo.responsible} por $${ultimo.totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
        hora: ultimo.date,
        vistaDestino: 'caja',
      });
    }

    return [...custom, ...baseNotifs].filter(n => !leidas.has(n.id));
  });

  const [isCobroModalOpen, setIsCobroModalOpen] = useState(false);
  const [isProductoModalOpen, setIsProductoModalOpen] = useState(false);
  const [productoEditando, setProductoEditando] = useState<MenuItem | null>(null);
  const [isUsuarioModalOpen, setIsUsuarioModalOpen] = useState(false);
  const [isBotonModalOpen, setIsBotonModalOpen] = useState(false);
  const [botonEditando, setBotonEditando] = useState<IoTDevice | null>(null);
  const [isConfirmBajaModalOpen, setIsConfirmBajaModalOpen] = useState(false);
  const [usuarioBaja, setUsuarioBaja] = useState<User | null>(null);
  const [isConfirmEliminarModalOpen, setIsConfirmEliminarModalOpen] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState<MenuItem | null>(null);

  useEffect(() => {
    setTables(prev => prev.map(t => {
      const dev = iotDevices.find(d => d.tableId === t.id);
      return { ...t, device: dev };
    }));
  }, [iotDevices]);

  const login = async (correo: string, password: string, remember: boolean = true): Promise<boolean> => {
    try {
      const response = await authService.login({ correo, password, remember });
      const mappedUser = adaptarUsuarioBackend(response.usuario);

      setCurrentUser(mappedUser);

      if (mappedUser.role === 'Cocinero') {
        setActiveView('cocina');
      } else if (mappedUser.role === 'Administrador') {
        setActiveView('caja');
      } else {
        setActiveView('mapa-mesas');
      }

      return true;
    } catch (error: any) {
      const mensaje =
        error?.message ||
        error?.response?.data?.message ||
        'Correo electrónico o contraseña incorrectos';
      Swal.fire({
        imageUrl: manitaTiteImg,
        imageWidth: 130,
        imageHeight: 130,
        imageAlt: 'Manita triste',
        title: 'Error de Inicio de Sesión',
        text: mensaje,
        confirmButtonText: 'Intentar de nuevo',
        confirmButtonColor: '#D98A1A',
        background: '#FFFFFF',
        color: '#1E110A',
        customClass: {
          popup: 'rounded-2xl shadow-xl border border-[#EFE6DA]',
          image: 'mx-auto mb-2 object-contain',
          title: 'text-[#1E110A] font-extrabold text-xl',
          confirmButton: 'rounded-xl px-6 py-2.5 font-bold',
        },
      });
      return false;
    }
  };

  const loginWithGoogle = async (credential: string, remember: boolean = true): Promise<boolean> => {
    try {
      const response = await authService.loginWithGoogle(credential, remember);
      const mappedUser = adaptarUsuarioBackend(response.usuario);

      setCurrentUser(mappedUser);

      if (mappedUser.role === 'Cocinero') {
        setActiveView('cocina');
      } else if (mappedUser.role === 'Administrador') {
        setActiveView('caja');
      } else {
        setActiveView('mapa-mesas');
      }

      return true;
    } catch (error: any) {
      const mensaje =
        error?.message ||
        error?.response?.data?.message ||
        'No se pudo iniciar sesión con Google';
      Swal.fire({
        imageUrl: manitaTiteImg,
        imageWidth: 130,
        imageHeight: 130,
        imageAlt: 'Manita triste',
        title: 'Error de Inicio de Sesión',
        text: mensaje,
        confirmButtonText: 'Intentar de nuevo',
        confirmButtonColor: '#D98A1A',
        background: '#FFFFFF',
        color: '#1E110A',
        customClass: {
          popup: 'rounded-2xl shadow-xl border border-[#EFE6DA]',
          image: 'mx-auto mb-2 object-contain',
          title: 'text-[#1E110A] font-extrabold text-xl',
          confirmButton: 'rounded-xl px-6 py-2.5 font-bold',
        },
      });
      return false;
    }
  };

  const logout = () => {
    Swal.fire({
      imageUrl: manitaDudaImg,
      imageWidth: 130,
      imageHeight: 130,
      imageAlt: 'Manita con duda',
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que deseas salir del sistema?',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#D32F2F',
      cancelButtonColor: '#786B63',
      reverseButtons: true,
      background: '#FFFFFF',
      color: '#1E110A',
      customClass: {
        popup: 'rounded-2xl shadow-xl border border-[#EFE6DA]',
        image: 'mx-auto mb-2 object-contain',
        title: 'text-[#1E110A] font-extrabold text-xl',
        confirmButton: 'rounded-xl px-5 py-2.5 font-bold',
        cancelButton: 'rounded-xl px-5 py-2.5 font-bold',
      },
    }).then((res) => {
      if (res.isConfirmed) {
        setIsCobroModalOpen(false);
        authService.logout();
        setCurrentUser(null);
        setActiveViewState('login');
        navigate('/login', { replace: true });
      }
    });
  };

  const selectTable = (tableId: string | null) => {
    setActiveTableId(tableId);
  };

  const generarSiguienteFolio = (mesasActuales: TableInfo[]): number => {
    const siguiente = leerUltimoFolioGuardado(mesasActuales) + 1;
    try {
      localStorage.setItem(TICKET_FOLIO_STORAGE_KEY, String(siguiente));
    } catch { }
    return siguiente;
  };

  const agregarItemToOrder = (tableId: string, item: MenuItem, selectedOption?: string, notes?: string) => {
    const targetTable = tables.find(t => t.id === tableId);
    const nuevoFolio = !targetTable?.currentOrder ? generarSiguienteFolio(tables) : undefined;

    setTables(prevTables => prevTables.map(t => {
      if (t.id !== tableId) return t;

      let order = t.currentOrder;
      if (!order) {
        order = {
          id: `ord-${Date.now()}`,
          folio: nuevoFolio ?? generarSiguienteFolio(prevTables),
          tableId,
          waiterId: currentUser?.id || 'u-1',
          waiterName: currentUser?.name || 'Mesero',
          guestsCount: t.guests || 2,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timeElapsedMinutes: 0,
          status: 'Abierta',
          items: []
        };
      }

      const existingIdx = order.items.findIndex(
        i =>
          !i.enviadoACocina &&
          i.menuItemId === item.id &&
          i.selectedOption === selectedOption &&
          i.notes === notes
      );

      const pctDescuento = item.discountPercent && item.discountPercent > 0 ? item.discountPercent : 0;
      const precioOriginal = item.price;
      const precioFinalUnitario = pctDescuento > 0
        ? Number((precioOriginal * (1 - pctDescuento / 100)).toFixed(2))
        : precioOriginal;

      let newItems = [...order.items];
      if (existingIdx >= 0) {
        newItems[existingIdx] = {
          ...newItems[existingIdx],
          price: precioFinalUnitario,
          originalPrice: precioOriginal,
          discountPercent: pctDescuento,
          quantity: newItems[existingIdx].quantity + 1
        };
      } else {
        newItems.push({
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          menuItemId: item.id,
          name: item.name,
          price: precioFinalUnitario,
          originalPrice: precioOriginal,
          discountPercent: pctDescuento,
          quantity: 1,
          selectedOption,
          notes,
          enviadoACocina: false
        });
      }

      return {
        ...t,
        status: t.status === 'Limpia / Disponible' ? 'Tomando Comanda' : t.status,
        currentOrder: {
          ...order,
          items: newItems
        }
      };
    }));
  };

  const actualizarItemQuantity = (tableId: string, itemId: string, delta: number) => {
    setTables(prev => prev.map(t => {
      if (t.id !== tableId || !t.currentOrder) return t;
      const newItems = t.currentOrder.items.map(item => {
        if (item.id === itemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as OrderItem[];

      return {
        ...t,
        currentOrder: {
          ...t.currentOrder,
          items: newItems
        }
      };
    }));
  };

  const eliminarItemFromOrder = (tableId: string, itemId: string) => {
    setTables(prev => prev.map(t => {
      if (t.id !== tableId || !t.currentOrder) return t;
      return {
        ...t,
        currentOrder: {
          ...t.currentOrder,
          items: t.currentOrder.items.filter(i => i.id !== itemId)
        }
      };
    }));
  };

  const actualizarNotaItemOrder = (tableId: string, itemId: string, notes?: string) => {
    setTables(prev => prev.map(t => {
      if (t.id !== tableId || !t.currentOrder) return t;
      return {
        ...t,
        currentOrder: {
          ...t.currentOrder,
          items: t.currentOrder.items.map(i =>
            i.id === itemId ? { ...i, notes: notes?.trim() || undefined } : i
          )
        }
      };
    }));
  };

  const enviarOrdenACocina = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table || !table.currentOrder || table.currentOrder.items.length === 0) return;

    // Solo enviamos los productos pendientes (que aún no se han mandado a cocina)
    const itemsPendientes = table.currentOrder.items.filter(i => !i.enviadoACocina);
    if (itemsPendientes.length === 0) return;

    const meseroIdEnvio = currentUser?.id || table.currentOrder.waiterId;
    const meseroNombreEnvio = currentUser?.name || table.currentOrder.waiterName;

    const ticketNuevoCocina: CocinaTicket = {
      id: `k-${Date.now()}`,
      orderFolio: table.currentOrder.folio,
      tableId,
      waiterId: meseroIdEnvio,
      waiterName: meseroNombreEnvio,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      elapsedMinutes: 1,
      status: 'Nuevas',
      allergies: itemsPendientes.some(i => i.notes?.toLowerCase().includes('alergia'))
        ? ['ALERGIA: Verificar notas']
        : [],
      items: itemsPendientes.map(i => ({
        name: i.name,
        quantity: i.quantity,
        option: i.selectedOption,
        notes: i.notes,
        completed: false
      }))
    };

    setCocinaTickets(prev => [ticketNuevoCocina, ...prev]);

    setTables(prev => prev.map(t => {
      if (t.id !== tableId || !t.currentOrder) return t;
      return {
        ...t,
        status: 'En Preparación',
        currentOrder: {
          ...t.currentOrder,
          status: 'En preparación',
          items: t.currentOrder.items.map(i => ({ ...i, enviadoACocina: true }))
        }
      };
    }));
  };

  const actualizarCocinaTicketStatus = (ticketId: string, newStatus: CocinaTicket['status']) => {
    setCocinaTickets(prev => prev.map(k => {
      if (k.id !== ticketId) return k;
      return { ...k, status: newStatus };
    }));

    const ticket = CocinaTickets.find(k => k.id === ticketId);
    if (ticket && newStatus === 'Listas') {
      const mesaLabel = ticket.tableId.replace('M', 'Mesa ');
      const resumenPlatillos = ticket.items
        .map(i => `${i.quantity}x ${i.name}`)
        .slice(0, 2)
        .join(', ');
      const nuevaAlertaCocina: BarAlert = {
        id: `al-cocina-${ticket.id}-${Date.now()}`,
        tableId: ticket.tableId,
        message: `Pedido #${ticket.orderFolio} listo en cocina para llevar a ${mesaLabel}${resumenPlatillos ? ` (${resumenPlatillos})` : ''}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tipo: 'cocina',
        waiterId: ticket.waiterId,
        waiterName: ticket.waiterName,
      };

      setBarAlerts(prev => [nuevaAlertaCocina, ...prev]);
      setMesasAtendidas(prev => ({ ...prev, [ticket.tableId]: false }));
      setTables(prev => prev.map(t => {
        if (t.id === ticket.tableId) {
          return {
            ...t,
            status: 'Atendido',
            hasAlert: true,
            alertType: 'Pedido listo en cocina',
          };
        }
        return t;
      }));
    } else if (ticket && newStatus === 'Entregadas') {
      setBarAlerts(prev => prev.filter(a => !(a.tableId === ticket.tableId && a.tipo === 'cocina')));
      setMesasAtendidas(prev => ({ ...prev, [ticket.tableId]: true }));
      setTables(prev => prev.map(t => {
        if (t.id === ticket.tableId) {
          return {
            ...t,
            status: 'En Consumo',
            hasAlert: false,
            alertType: undefined,
            currentOrder: t.currentOrder
              ? {
                  ...t.currentOrder,
                  items: t.currentOrder.items.map(i =>
                    i.enviadoACocina ? { ...i, entregado: true } : i
                  ),
                }
              : t.currentOrder,
          };
        }
        return t;
      }));
    }
  };

  const alternarItemCocinaCompletado = (ticketId: string, itemIndex: number) => {
    setCocinaTickets(prev => prev.map(k => {
      if (k.id !== ticketId) return k;
      const updated = [...k.items];
      updated[itemIndex] = {
        ...updated[itemIndex],
        completed: !updated[itemIndex].completed
      };
      return { ...k, items: updated };
    }));
  };

  const cancelarProductoDesdeCocina = (ticketId: string, itemIndex: number, motivo?: string) => {
    const ticket = CocinaTickets.find(k => k.id === ticketId);
    if (!ticket || !ticket.items[itemIndex]) return;

    const itemCancelado = ticket.items[itemIndex];
    const razon = (motivo || '').trim() || 'Falta de ingredientes';
    const mesaLabel = ticket.tableId.replace('M', 'Mesa ');

    // 1. Quitar producto del ticket de cocina (si era el último, retirar el ticket completo)
    setCocinaTickets(prev =>
      prev
        .map(k => {
          if (k.id !== ticketId) return k;
          const restantes = k.items.filter((_, idx) => idx !== itemIndex);
          return { ...k, items: restantes };
        })
        .filter(k => k.items.length > 0)
    );

    // 2. Eliminar ese producto de la comanda de la mesa para que no se cobre
    setTables(prev => prev.map(t => {
      if (t.id !== ticket.tableId) return t;
      if (!t.currentOrder) {
        return {
          ...t,
          status: 'Tomando comanda por cancelación',
          hasAlert: true,
          alertType: 'Llamada de cliente',
        };
      }
      let removido = false;
      const nuevosItems = t.currentOrder.items.filter(it => {
        if (!removido && it.name === itemCancelado.name && (it.selectedOption || '') === (itemCancelado.option || '')) {
          removido = true;
          return false;
        }
        return true;
      });
      return {
        ...t,
        status: 'Tomando comanda por cancelación',
        hasAlert: true,
        alertType: 'Llamada de cliente',
        currentOrder: {
          ...t.currentOrder,
          status: 'Abierta',
          items: nuevosItems,
        },
      };
    }));

    // 3. Notificar al mesero para avisar al comensal y ofrecer otra opción
    const alertaCancelacion: BarAlert = {
      id: `al-cancel-${ticket.id}-${Date.now()}`,
      tableId: ticket.tableId,
      message: `Cocina canceló ${itemCancelado.quantity}x ${itemCancelado.name} en ${mesaLabel} (${razon}). Avisa al comensal para elegir otra opción.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tipo: 'cocina-cancelacion',
      waiterId: ticket.waiterId,
      waiterName: ticket.waiterName,
    };
    setBarAlerts(prev => [alertaCancelacion, ...prev]);
    setMesasAtendidas(prev => ({ ...prev, [ticket.tableId]: false }));
  };

  const mostrarCobroModal = (tableId: string) => {
    const folioConsecutivo = obtenerSiguienteFolioCobro(ticketsRegistrados);
    setTables(prev => {
      const mesaObjetivo = prev.find(t => t.id === tableId);
      const folioAnteriorMesa = mesaObjetivo?.currentOrder?.folio;
      return prev.map(t => {
        if (!t.currentOrder) return t;
        if (t.id === tableId) {
          return {
            ...t,
            currentOrder: {
              ...t.currentOrder,
              folio: folioConsecutivo,
            },
          };
        }
        // Si otra mesa abierta tenía asignado provisionalmente ese mismo folio, intercambiarlo para evitar duplicados
        if (t.currentOrder.folio === folioConsecutivo && typeof folioAnteriorMesa === 'number') {
          return {
            ...t,
            currentOrder: {
              ...t.currentOrder,
              folio: folioAnteriorMesa,
            },
          };
        }
        return t;
      });
    });
    setActiveTableId(tableId);
    setIsCobroModalOpen(true);
  };

  const cerrarCobroModal = () => {
    setIsCobroModalOpen(false);
  };

  const registrarTicketCobro = (
    tableId: string,
    discount: number,
    tipPercent: number,
    method: 'Terminal Bancaria' | 'Efectivo en Mesa' | 'Transferencia QR / CoDi',
    customTipAmount?: number,
    redondeoAmount: number = 0
  ): TicketRegistrado | null => {
    const table = tables.find(t => t.id === tableId);
    if (!table || !table.currentOrder || table.currentOrder.items.length === 0) return null;

    const lineas = table.currentOrder.items.map((i) => {
      const prod = menuItems.find(m => m.id === i.menuItemId);
      const pct = prod?.discountPercent ?? i.discountPercent ?? 0;
      const orig = i.originalPrice ?? prod?.price ?? i.price;
      const unitPrice = pct > 0 ? Number((orig * (1 - pct / 100)).toFixed(2)) : orig;
      const partes: string[] = [];
      if (pct > 0) partes.push(`Desc. -${pct}%`);
      if (i.selectedOption) partes.push(i.selectedOption);
      if (i.notes) partes.push(i.notes);
      return {
        cantidad: i.quantity,
        nombre: i.name,
        detalle: partes.join(' · ') || prod?.category || 'Menú ¡Hola, Café!',
        precioUnitario: unitPrice,
      };
    });

    const subtotal = Number(
      lineas.reduce((sum, l) => sum + l.precioUnitario * l.cantidad, 0).toFixed(2)
    );
    const descuentoMonto = Number(((subtotal * discount) / 100).toFixed(2));
    const base = Number((subtotal - descuentoMonto).toFixed(2));
    const propinaMonto = Number(
      (typeof customTipAmount === 'number' ? customTipAmount : (base * tipPercent) / 100).toFixed(2)
    );
    const redondeoSeguro = Number((redondeoAmount > 0 ? redondeoAmount : 0).toFixed(2));
    const totalCobrado = Number((base + propinaMonto + redondeoSeguro).toFixed(2));

    const pagoNormalizado: 'Efectivo' | 'Tarjeta' | 'Transferencia' =
      method === 'Efectivo en Mesa'
        ? 'Efectivo'
        : method === 'Transferencia QR / CoDi'
          ? 'Transferencia'
          : 'Tarjeta';

    const ahora = new Date();
    const hora = ahora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
    const fechaClave = aClaveFechaLocal(ahora);
    const folioNum = obtenerSiguienteFolioCobro(ticketsRegistrados);

    const folioStr = `#${folioNum}`;
    const yaExiste = ticketsRegistrados.some(
      (t) => t.folio === folioStr && t.fechaClave === fechaClave && !t.corteId
    );
    if (yaExiste) {
      return ticketsRegistrados.find(
        (t) => t.folio === folioStr && t.fechaClave === fechaClave && !t.corteId
      ) || null;
    }

    const nuevoTicket: TicketRegistrado = {
      id: `tkt-${folioNum}-${Date.now()}`,
      folio: folioStr,
      fechaClave,
      hora,
      pago: pagoNormalizado,
      estado: 'Pagado',
      mesa: String(table.number).padStart(2, '0'),
      mesero: currentUser?.name || table.currentOrder.waiterName || table.waiterName || 'Mesero',
      personas: table.guests || table.capacity || 2,
      lineas,
      subtotal,
      descuento: descuentoMonto,
      propina: propinaMonto,
      total: totalCobrado,
    };

    setTicketsRegistrados(prev => [nuevoTicket, ...prev]);
    return nuevoTicket;
  };

  const procesarPagoYLiberar = (
    tableId: string,
    discount: number,
    tipPercent: number,
    method: 'Terminal Bancaria' | 'Efectivo en Mesa' | 'Transferencia QR / CoDi',
    customTipAmount?: number,
    redondeoAmount: number = 0
  ) => {
    registrarTicketCobro(tableId, discount, tipPercent, method, customTipAmount, redondeoAmount);

    setTables(prev => prev.map(t => {
      if (t.id !== tableId) return t;
      return {
        ...t,
        status: 'Limpia / Disponible',
        guests: 0,
        hasAlert: false,
        alertType: undefined,
        currentOrder: undefined
      };
    }));

    setBarAlerts(prev => prev.filter(a => a.tableId !== tableId));
    setCocinaTickets(prev => prev.filter(k => k.tableId !== tableId));
    cerrarCobroModal();
  };

  const realizarCorteCaja = (): CorteCajaItem | null => {
    const pendientes = ticketsRegistrados.filter((t) => !t.corteId && t.estado === 'Pagado');
    if (pendientes.length === 0 || ventasPendientesCorte <= 0) {
      return null;
    }

    const num = cortesCaja.length + 1;
    const nuevoId = `#${num < 10 ? `0${num}` : num}`;
    const totalNuevo = Number(pendientes.reduce((acc, t) => acc + t.total, 0).toFixed(2));
    const ticketsNuevos = pendientes.length;
    const responsable = currentUser?.name || 'Administrador';
    const ahora = new Date();
    const fechaStr = ahora.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const horaStr = ahora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
    const fechaClave = aClaveFechaLocal(ahora);

    const nuevoCorte: CorteCajaItem = {
      id: nuevoId,
      fecha: `${fechaStr} · ${horaStr}`,
      fechaClave,
      horaCorte: horaStr,
      mesero: responsable,
      total: totalNuevo,
      tickets: ticketsNuevos,
    };

    const idsPendientes = new Set(pendientes.map((t) => t.id));
    setTicketsRegistrados(prev =>
      prev.map((t) => (idsPendientes.has(t.id) ? { ...t, corteId: nuevoId } : t))
    );
    setCortesCaja(prev => [nuevoCorte, ...prev]);

    agregarAdminNotificacion({
      tipo: 'corte',
      titulo: `Corte de caja ${nuevoId} realizado`,
      mensaje: `Realizado por ${responsable} a las ${horaStr} h por $${totalNuevo.toLocaleString('es-MX', { minimumFractionDigits: 2 })} (${ticketsNuevos} tickets)`,
      vistaDestino: 'revision-tickets',
    });

    return nuevoCorte;
  };

  const liberarMesaDirectamente = (tableId: string) => {
    setTables(prev => prev.map(t => {
      if (t.id !== tableId) return t;
      return {
        ...t,
        status: 'Limpia / Disponible',
        guests: 0,
        hasAlert: false,
        alertType: undefined,
        currentOrder: undefined
      };
    }));
    setBarAlerts(prev => prev.filter(a => a.tableId !== tableId));
    setCocinaTickets(prev => prev.filter(k => k.tableId !== tableId));
    api.patch(`/mesas/${encodeURIComponent(tableId)}/estado`, null, {
      params: { estado: 'Limpia / Disponible' }
    }).catch(() => {});
  };

  const activarAlertaBarra = (tableId: string, message: string) => {
    const newAlert: BarAlert = {
      id: `al-${Date.now()}`,
      tableId,
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setBarAlerts(prev => [newAlert, ...prev]);
    setMesasAtendidas(prev => ({ ...prev, [tableId]: false }));

    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        return {
          ...t,
          hasAlert: true,
          alertType: 'Llamada de cliente'
        };
      }
      return t;
    }));

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'warning',
      title: `${tableId.replace('M', 'Mesa ')} presionó el botón`,
      text: message,
      showConfirmButton: false,
      timer: 3500,
      timerProgressBar: true,
      background: '#FFF5F5',
      color: '#1E110A',
    });
  };

  const descartarAlertaBarra = (id: string) => {
    const alerta = barAlerts.find(a => a.id === id);
    if (alerta) {
      if (alerta.dbId && authService.getToken()) {
        api.patch(`/mesas/alertas/${alerta.dbId}/atender`).catch(() => {});
      }
      const esEntregaCocina = alerta.tipo === 'cocina';
      setMesasAtendidas(prev => ({ ...prev, [alerta.tableId]: true }));
      setTables(prev => prev.map(t =>
        t.id === alerta.tableId
          ? {
              ...t,
              hasAlert: false,
              alertType: undefined,
              status: t.status === 'Atendido' ? 'En Consumo' : t.status,
              currentOrder:
                esEntregaCocina && t.currentOrder
                  ? {
                      ...t.currentOrder,
                      items: t.currentOrder.items.map(i =>
                        i.enviadoACocina ? { ...i, entregado: true } : i
                      ),
                    }
                  : t.currentOrder,
            }
          : t
      ));
      // Si el mesero confirma entrega de un pedido listo de cocina, lo retiramos de Cocina
      if (esEntregaCocina) {
        setCocinaTickets(prev =>
          prev.map(k =>
            k.tableId === alerta.tableId && k.status === 'Listas'
              ? { ...k, status: 'Entregadas' }
              : k
          )
        );
      }
    }
    setBarAlerts(prev => prev.filter(a => a.id !== id));
  };

  const marcarMesaAtendida = (tableId: string) => {
    if (authService.getToken()) {
      barAlerts
        .filter((a) => a.tableId === tableId && a.dbId)
        .forEach((a) => {
          api.patch(`/mesas/alertas/${a.dbId}/atender`).catch(() => {});
        });
    }
    const tienePedidoListo =
      barAlerts.some(a => a.tableId === tableId && a.tipo === 'cocina') ||
      CocinaTickets.some(k => k.tableId === tableId && k.status === 'Listas');

    setMesasAtendidas(prev => ({ ...prev, [tableId]: true }));
    setBarAlerts(prev => prev.filter(a => a.tableId !== tableId));
    setTables(prev => prev.map(t =>
      t.id === tableId
        ? {
            ...t,
            hasAlert: false,
            alertType: undefined,
            status: t.status === 'Atendido' ? 'En Consumo' : t.status,
            currentOrder:
              tienePedidoListo && t.currentOrder
                ? {
                    ...t.currentOrder,
                    items: t.currentOrder.items.map(i =>
                      i.enviadoACocina ? { ...i, entregado: true } : i
                    ),
                  }
                : t.currentOrder,
          }
        : t
    ));
    // Al confirmar entrega en mesa, retirar los tickets "Listas" de esa mesa en Cocina
    setCocinaTickets(prev =>
      prev.map(k =>
        k.tableId === tableId && k.status === 'Listas'
          ? { ...k, status: 'Entregadas' }
          : k
      )
    );
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `${tableId.replace('M', 'Mesa ')} atendida`,
      showConfirmButton: false,
      timer: 2200,
      background: '#FAF8F5',
      color: '#1E110A',
    });
  };

  const agregarAdminNotificacion = (notificacion: Omit<AdminNotificacion, 'id' | 'hora'>) => {
    const nueva: AdminNotificacion = {
      ...notificacion,
      id: `notif-${Date.now()}`,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setAdminNotificaciones(prev => [nueva, ...prev]);
    try {
      const existentes = leerNotifsCustom();
      localStorage.setItem(ADMIN_NOTIFS_CUSTOM_KEY, JSON.stringify([nueva, ...existentes]));
    } catch { }
  };

  const descartarAdminNotificacion = (id: string) => {
    setAdminNotificaciones(prev => prev.filter(n => n.id !== id));
    try {
      const leidas = Array.from(new Set([...leerNotifsLeidas(), id]));
      localStorage.setItem(ADMIN_NOTIFS_DISMISSED_KEY, JSON.stringify(leidas));

      const customActualizadas = leerNotifsCustom().filter(n => n.id !== id);
      localStorage.setItem(ADMIN_NOTIFS_CUSTOM_KEY, JSON.stringify(customActualizadas));
    } catch { }
  };

  const mostrarAddProductModal = () => {
    setProductoEditando(null);
    setIsProductoModalOpen(true);
  };

  const mostrarEditProductModal = (product: MenuItem) => {
    setProductoEditando(product);
    setIsProductoModalOpen(true);
  };

  const cerrarProductModal = () => {
    setIsProductoModalOpen(false);
    setProductoEditando(null);
  };

  const guardarProducto = async (productData: Partial<MenuItem>) => {
    try {
      const payload = {
        nombre: productData.name || 'Nuevo Producto',
        descripcion: productData.description || '',
        precio: Number(productData.price) || 0,
        categoriaNombre: productData.category || 'Alimentos Salados',
        estado: productData.status || 'DISPONIBLE',
        permiteNotasCocina: productData.allowKitchenNotes ?? true,
        opciones: (productData.options || []).map((o) => o.trim()).filter(Boolean),
      };
      if (productoEditando) {
        await api.put(`/productos/${productoEditando.id}`, payload);
      } else {
        await api.post('/productos', payload);
      }
      await cargarDatosBackend();
      try {
        localStorage.setItem('holacafe_menu_updated_v1', String(Date.now()));
      } catch {}
      cerrarProductModal();
    } catch (error: any) {
      Swal.fire('Error', error.message || 'No se pudo guardar el producto en la base de datos', 'error');
    }
  };

  const mostrarConfirmEliminarModal = (product: MenuItem) => {
    setProductoAEliminar(product);
    setIsConfirmEliminarModalOpen(true);
  };

  const cerrarConfirmEliminarModal = () => {
    setIsConfirmEliminarModalOpen(false);
    setProductoAEliminar(null);
  };

  const confirmarBorrarProducto = async () => {
    if (productoAEliminar) {
      try {
        await api.delete(`/productos/${productoAEliminar.id}`);
        setMenuItems((prev) => prev.filter((p) => p.id !== productoAEliminar.id));
      } catch (error: any) {
        Swal.fire('Error', error.message || 'No se pudo eliminar el producto', 'error');
      }
    }
    cerrarConfirmEliminarModal();
  };

  const actualizarDescuentoProducto = (productId: string, discountPercent: number) => {
    const pct = Math.max(0, Math.min(90, Math.round(discountPercent)));
    try {
      const actuales: Record<string, number> = JSON.parse(
        localStorage.getItem('holacafe_product_discounts_v1') || '{}'
      );
      if (pct > 0) {
        actuales[productId] = pct;
      } else {
        delete actuales[productId];
      }
      localStorage.setItem('holacafe_product_discounts_v1', JSON.stringify(actuales));
    } catch {}
    setMenuItems(prev => {
      const prod = prev.find(p => p.id === productId);
      if (prod) {
        setTables(prevTables =>
          prevTables.map(t => {
            if (!t.currentOrder) return t;
            const hasProd = t.currentOrder.items.some(i => i.menuItemId === productId);
            if (!hasProd) return t;
            return {
              ...t,
              currentOrder: {
                ...t.currentOrder,
                items: t.currentOrder.items.map(i => {
                  if (i.menuItemId !== productId) return i;
                  const orig = i.originalPrice ?? prod.price;
                  const finalUnit = pct > 0 ? Number((orig * (1 - pct / 100)).toFixed(2)) : orig;
                  return { ...i, originalPrice: orig, discountPercent: pct, price: finalUnit };
                }),
              },
            };
          })
        );
      }
      return prev.map(p => (p.id === productId ? { ...p, discountPercent: pct } : p));
    });
  };

  const mostrarAddUserModal = () => {
    setIsUsuarioModalOpen(true);
  };

  const cerrarAddUserModal = () => {
    setIsUsuarioModalOpen(false);
  };

  const guardarUser = async (userData: Partial<User> & { password?: string }) => {
    try {
      const rolId =
        userData.role === 'Administrador' ? 1 : userData.role === 'Cocinero' ? 3 : 2;
      const correoLimpio = (userData.username || '').trim();
      await api.post('/auth/registro', {
        nombre: (userData.name || '').trim(),
        correo: correoLimpio,
        password: userData.password || '',
        rolId,
      });
      await cargarDatosBackend();
      cerrarAddUserModal();

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Usuario ${(userData.name || correoLimpio).trim()} creado`,
        showConfirmButton: false,
        timer: 2400,
        background: '#FAF8F5',
        color: '#1E110A',
      });
    } catch (error: any) {
      const detalles: Record<string, string> | undefined =
        error?.errors || error?.validaciones || error?.response?.data?.validaciones;

      if (detalles && Object.keys(detalles).length > 0) {
        const listaHtml = Object.entries(detalles)
          .map(([campo, msg]) => `<li><strong>${campo}:</strong> ${msg}</li>`)
          .join('');
        Swal.fire({
          icon: 'error',
          title: 'No se pudo crear el usuario',
          html: `<div style="text-align:left;font-size:13px;"><p style="margin-bottom:8px;">Corrige los siguientes campos:</p><ul style="padding-left:18px;margin:0;">${listaHtml}</ul></div>`,
          confirmButtonColor: '#DF7B1B',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'No se pudo crear el usuario',
          text: error?.message || error?.response?.data?.message || 'Error al registrar el usuario.',
          confirmButtonColor: '#DF7B1B',
        });
      }
    }
  };

  const actualizarRolUsuario = async (userId: string, newRole: User['role']) => {
    try {
      const rolId = newRole === 'Administrador' ? 1 : newRole === 'Cocinero' ? 3 : 2;
      const { data } = await api.patch<UsuarioDTO>(`/usuarios/${userId}/rol`, null, {
        params: { rolId },
      });
      const actualizado = adaptarUsuarioBackend(data);
      setUsers((prev) => prev.map((u) => (u.id === userId ? actualizado : u)));

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Rol actualizado a ${actualizado.role}`,
        text: actualizado.name,
        showConfirmButton: false,
        timer: 2400,
        background: '#FAF8F5',
        color: '#1E110A',
      });
    } catch (error: any) {
      Swal.fire('Error', error.message || 'No se pudo actualizar el rol del usuario', 'error');
    }
  };

  const mostrarConfirmBajaModal = (user: User) => {
    setUsuarioBaja(user);
    setIsConfirmBajaModalOpen(true);
  };

  const cerrarConfirmBajaModal = () => {
    setIsConfirmBajaModalOpen(false);
    setUsuarioBaja(null);
  };

  const confirmarBajaUser = async () => {
    if (usuarioBaja) {
      try {
        await api.delete(`/usuarios/${encodeURIComponent(usuarioBaja.id)}`);
        await cargarDatosBackend();
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `Cuenta de ${usuarioBaja.name} eliminada`,
          showConfirmButton: false,
          timer: 2400,
          background: '#FAF8F5',
          color: '#1E110A',
        });
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'No se pudo eliminar la cuenta',
          text: error?.message || error?.response?.data?.message || 'Ocurrió un error al eliminar el usuario.',
          confirmButtonColor: '#DC2626',
        });
      }
    }
    cerrarConfirmBajaModal();
  };

  const reactivarUser = async (userId: string) => {
    try {
      await api.patch(`/usuarios/${userId}/estado`);
      await cargarDatosBackend();
    } catch (error: any) {
      Swal.fire('Error', error.message || 'No se pudo reactivar al usuario', 'error');
    }
  };

  const mostrarAddBotonModal = () => {
    setBotonEditando(null);
    setIsBotonModalOpen(true);
  };

  const mostrarEditBotonModal = (boton: IoTDevice) => {
    setBotonEditando(boton);
    setIsBotonModalOpen(true);
  };

  const cerrarAddBotonModal = () => {
    setIsBotonModalOpen(false);
    setBotonEditando(null);
  };

  const guardarBoton = async (botonData: Partial<IoTDevice>) => {
    try {
      const payload = {
        id: (botonEditando ? botonEditando.id : (botonData.id || `BOT-M${Math.floor(10 + Math.random() * 89)}`)).trim().toUpperCase(),
        nombre: (botonData.name || 'Botón de Mesa').trim(),
        mesaId: botonData.tableId || null,
        bateria: botonEditando ? botonEditando.batteryPercentage : 100,
        estado: botonEditando ? botonEditando.status : 'En línea',
      };

      if (botonEditando) {
        await api.put(`/mesas/botones/${encodeURIComponent(botonEditando.id)}`, payload);
      } else {
        await api.post('/mesas/botones', payload);
      }

      await cargarDatosBackend();
      cerrarAddBotonModal();

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: botonEditando ? 'Dispositivo actualizado' : 'Dispositivo registrado',
        showConfirmButton: false,
        timer: 2200,
        background: '#FAF8F5',
        color: '#1E110A',
      });
    } catch (error: any) {
      Swal.fire(
        'Error',
        error?.message || error?.response?.data?.message || 'No se pudo guardar el dispositivo',
        'error'
      );
    }
  };

  const eliminarBoton = async (botonId: string) => {
    try {
      await api.delete(`/mesas/botones/${encodeURIComponent(botonId)}`);
      await cargarDatosBackend();

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Dispositivo ${botonId} eliminado`,
        showConfirmButton: false,
        timer: 2200,
        background: '#FAF8F5',
        color: '#1E110A',
      });
    } catch (error: any) {
      Swal.fire(
        'Error',
        error?.message || error?.response?.data?.message || 'No se pudo eliminar el dispositivo',
        'error'
      );
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        activeView,
        activeTableId,
        tables,
        menuItems,
        users,
        iotDevices,
        CocinaTickets,
        cashClosings,
        cortesCaja,
        ticketsRegistrados,
        ventasPendientesCorte,
        ticketsPendientesCorte,
        barAlerts,
        adminNotificaciones,
        mesasAtendidas,
        isCobroModalOpen,
        isProductoModalOpen,
        productoEditando,
        isUsuarioModalOpen,
        isBotonModalOpen,
        botonEditando,
        isConfirmBajaModalOpen,
        usuarioBaja,
        isConfirmEliminarModalOpen,
        productoAEliminar,
        login,
        loginWithGoogle,
        logout,
        setActiveView,
        selectTable,
        agregarItemToOrder,
        actualizarItemQuantity,
        actualizarNotaItemOrder,
        eliminarItemFromOrder,
        enviarOrdenACocina,
        actualizarCocinaTicketStatus,
        alternarItemCocinaCompletado,
        cancelarProductoDesdeCocina,
        mostrarCobroModal,
        cerrarCobroModal,
        registrarTicketCobro,
        procesarPagoYLiberar,
        liberarMesaDirectamente,
        realizarCorteCaja,
        activarAlertaBarra,
        descartarAlertaBarra,
        marcarMesaAtendida,
        agregarAdminNotificacion,
        descartarAdminNotificacion,
        mostrarAddProductModal,
        mostrarEditProductModal,
        cerrarProductModal,
        guardarProducto,
        mostrarConfirmEliminarModal,
        cerrarConfirmEliminarModal,
        confirmarBorrarProducto,
        actualizarDescuentoProducto,
        mostrarAddUserModal,
        cerrarAddUserModal,
        guardarUser,
        actualizarRolUsuario,
        mostrarConfirmBajaModal,
        cerrarConfirmBajaModal,
        confirmarBajaUser,
        reactivarUser,
        mostrarAddBotonModal,
        mostrarEditBotonModal,
        cerrarAddBotonModal,
        guardarBoton,
        eliminarBoton,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de un AppProvider');
  }
  return context;
};
