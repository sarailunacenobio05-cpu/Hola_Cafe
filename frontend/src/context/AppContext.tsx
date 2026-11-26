import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
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
  tableId: string;
  message: string;
  time: string;
  tipo?: 'boton' | 'cocina' | 'cocina-cancelacion';
}

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
  mesero: string;
  total: number;
  tickets?: number;
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
  ventasPendientesCorte: number;
  ticketsPendientesCorte: number;
  barAlerts: BarAlert[];
  adminNotificaciones: AdminNotificacion[];
  mesasAtendidas: Record<string, boolean>;

  isCobroModalOpen: boolean;
  isTicketModalOpen: boolean;
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
  mostrarTicketModal: (tableId: string) => void;
  cerrarTicketModal: () => void;
  procesarPagoYLiberar: (tableId: string, discount: number, tipPercent: number, method: 'Terminal Bancaria' | 'Efectivo en Mesa' | 'Transferencia QR / CoDi', customTipAmount?: number) => void;
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

  mostrarAddUserModal: () => void;
  cerrarAddUserModal: () => void;
  guardarUser: (userData: Partial<User> & { password?: string }) => Promise<void>;
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

  const [tables, setTables] = useState<TableInfo[]>(() => {
    try {
      const saved = localStorage.getItem(TABLES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
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
      if (e.key === BAR_ALERTS_STORAGE_KEY && e.newValue) {
        try {
          const parsed: BarAlert[] = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setBarAlerts((prev) => {
              const prevIds = new Set(prev.map((a) => a.id));
              const nuevaCocina = parsed.find((a) => a.tipo === 'cocina' && !prevIds.has(a.id));
              const nuevaCancelacion = parsed.find((a) => a.tipo === 'cocina-cancelacion' && !prevIds.has(a.id));
              if (nuevaCancelacion) {
                Swal.fire({
                  toast: true,
                  position: 'top-end',
                  icon: 'warning',
                  title: `Sin ingredientes · ${nuevaCancelacion.tableId.replace('M', 'Mesa ')}`,
                  text: nuevaCancelacion.message,
                  showConfirmButton: false,
                  timer: 6000,
                  timerProgressBar: true,
                  background: '#FFFBEB',
                  color: '#92400E',
                });
              } else if (nuevaCocina) {
                Swal.fire({
                  toast: true,
                  position: 'top-end',
                  icon: 'success',
                  title: `Pedido listo · ${nuevaCocina.tableId.replace('M', 'Mesa ')}`,
                  text: nuevaCocina.message,
                  showConfirmButton: false,
                  timer: 5000,
                  timerProgressBar: true,
                  background: '#ECFDF5',
                  color: '#065F46',
                });
              }
              return parsed;
            });
          }
        } catch { }
      }
    };
    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, []);
  const [cashClosings, setCashClosings] = useState<CashClosingRecord[]>(INITIAL_CASH_CLOSINGS);
  const [cortesCaja, setCortesCaja] = useState<CorteCajaItem[]>([
    { id: '#07', fecha: '26/03/2026 · 20:00', mesero: 'Melissa H.', total: 7450.00, tickets: 24 },
    { id: '#06', fecha: '25/03/2026 · 20:00', mesero: 'Dante M.', total: 4310.00, tickets: 15 },
    { id: '#05', fecha: '24/03/2026 · 20:00', mesero: 'Gael O.', total: 6980.00, tickets: 22 },
    { id: '#04', fecha: '23/03/2026 · 20:00', mesero: 'Melissa H.', total: 5150.00, tickets: 18 },
    { id: '#03', fecha: '22/03/2026 · 20:00', mesero: 'Melissa H.', total: 6390.00, tickets: 21 },
    { id: '#02', fecha: '21/03/2026 · 20:00', mesero: 'Gael O.', total: 7210.00, tickets: 25 },
    { id: '#01', fecha: '20/03/2026 · 20:00', mesero: 'Dante M.', total: 4820.00, tickets: 16 },
  ]);
  const [ventasPendientesCorte, setVentasPendientesCorte] = useState<number>(18420.00);
  const [ticketsPendientesCorte, setTicketsPendientesCorte] = useState<number>(37);

  const cargarDatosBackend = async () => {
    try {
      // 1. Cargar Productos del menú
      const resProd = await api.get('/productos');
      if (Array.isArray(resProd.data) && resProd.data.length > 0) {
        setMenuItems(
          resProd.data.map((p: any) => ({
            id: p.id,
            name: p.nombre,
            category: p.categoria || p.categoriaNombre || 'Sin categoría',
            description: p.descripcion || '',
            price: Number(p.precio),
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
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
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
        icon: 'error',
        title: 'Error de Inicio de Sesión',
        text: mensaje,
        confirmButtonColor: '#b45309',
      });
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setActiveViewState('login');
    navigate('/login', { replace: true });
  };

  const selectTable = (tableId: string | null) => {
    setActiveTableId(tableId);
  };

  const agregarItemToOrder = (tableId: string, item: MenuItem, selectedOption?: string, notes?: string) => {
    setTables(prevTables => prevTables.map(t => {
      if (t.id !== tableId) return t;

      let order = t.currentOrder;
      if (!order) {
        order = {
          id: `ord-${Date.now()}`,
          folio: Math.floor(1000 + Math.random() * 9000),
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

      let newItems = [...order.items];
      if (existingIdx >= 0) {
        newItems[existingIdx] = {
          ...newItems[existingIdx],
          quantity: newItems[existingIdx].quantity + 1
        };
      } else {
        newItems.push({
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          selectedOption,
          notes,
          enviadoACocina: false
        });
      }

      return {
        ...t,
        status: t.status === 'Limpia / Disponible' ? 'En Consumo' : t.status,
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

    const ticketNuevoCocina: CocinaTicket = {
      id: `k-${Date.now()}`,
      orderFolio: table.currentOrder.folio,
      tableId,
      waiterName: table.currentOrder.waiterName,
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
        return { ...t, hasAlert: true, alertType: 'Llamada de cliente' };
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
        hasAlert: true,
        alertType: 'Llamada de cliente',
        currentOrder: {
          ...t.currentOrder,
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
    };
    setBarAlerts(prev => [alertaCancelacion, ...prev]);
    setMesasAtendidas(prev => ({ ...prev, [ticket.tableId]: false }));
  };

  const mostrarCobroModal = (tableId: string) => {
    setActiveTableId(tableId);
    setIsCobroModalOpen(true);
  };

  const cerrarCobroModal = () => {
    setIsCobroModalOpen(false);
  };

  const mostrarTicketModal = (tableId: string) => {
    setActiveTableId(tableId);
    setIsTicketModalOpen(true);
  };

  const cerrarTicketModal = () => {
    setIsTicketModalOpen(false);
  };

  const procesarPagoYLiberar = (
    tableId: string,
    discount: number,
    tipPercent: number,
    _method: 'Terminal Bancaria' | 'Efectivo en Mesa' | 'Transferencia QR / CoDi',
    customTipAmount?: number
  ) => {
    const table = tables.find(t => t.id === tableId);
    if (!table || !table.currentOrder) return;

    const subtotal = table.currentOrder.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const discounted = subtotal * (1 - discount / 100);
    const tip = typeof customTipAmount === 'number' ? customTipAmount : discounted * (tipPercent / 100);
    const totalCobrado = Number((discounted + tip).toFixed(2));

    setVentasPendientesCorte(prev => Number((prev + totalCobrado).toFixed(2)));
    setTicketsPendientesCorte(prev => prev + 1);

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
    cerrarCobroModal();
  };

  const realizarCorteCaja = (): CorteCajaItem | null => {
    if (ventasPendientesCorte <= 0) {
      return null;
    }

    const num = cortesCaja.length + 1;
    const nuevoId = `#${num < 10 ? `0${num}` : num}`;
    const totalNuevo = ventasPendientesCorte;
    const ticketsNuevos = ticketsPendientesCorte;
    const responsable = currentUser?.name || 'Dante M.';

    const nuevoCorte: CorteCajaItem = {
      id: nuevoId,
      fecha: `Hoy · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      mesero: responsable,
      total: totalNuevo,
      tickets: ticketsNuevos,
    };

    setCortesCaja(prev => [nuevoCorte, ...prev]);
    setVentasPendientesCorte(0);
    setTicketsPendientesCorte(0);

    agregarAdminNotificacion({
      tipo: 'corte',
      titulo: `Corte de caja ${nuevoId} realizado`,
      mensaje: `Registrado por ${responsable} por $${totalNuevo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      vistaDestino: 'caja',
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
      setMesasAtendidas(prev => ({ ...prev, [alerta.tableId]: true }));
      setTables(prev => prev.map(t =>
        t.id === alerta.tableId
          ? {
              ...t,
              hasAlert: false,
              alertType: undefined,
              status: t.status === 'Atendido' ? 'En Consumo' : t.status,
            }
          : t
      ));
      // Si el mesero confirma entrega de un pedido listo de cocina, lo retiramos de Cocina
      if (alerta.tipo === 'cocina') {
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
    setMesasAtendidas(prev => ({ ...prev, [tableId]: true }));
    setBarAlerts(prev => prev.filter(a => a.tableId !== tableId));
    setTables(prev => prev.map(t =>
      t.id === tableId
        ? {
            ...t,
            hasAlert: false,
            alertType: undefined,
            status: t.status === 'Atendido' ? 'En Consumo' : t.status,
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
      };
      if (productoEditando) {
        await api.put(`/productos/${productoEditando.id}`, payload);
      } else {
        await api.post('/productos', payload);
      }
      await cargarDatosBackend();
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
        ventasPendientesCorte,
        ticketsPendientesCorte,
        barAlerts,
        adminNotificaciones,
        mesasAtendidas,
        isCobroModalOpen,
        isTicketModalOpen,
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
        mostrarTicketModal,
        cerrarTicketModal,
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
        mostrarAddUserModal,
        cerrarAddUserModal,
        guardarUser,
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
