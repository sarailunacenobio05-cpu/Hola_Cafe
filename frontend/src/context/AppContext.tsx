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
}

export interface AdminNotificacion {
  id: string;
  tipo: 'bateria' | 'corte';
  titulo: string;
  mensaje: string;
  hora: string;
  vistaDestino: ActiveView;
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
  eliminarItemFromOrder: (tableId: string, itemId: string) => void;
  enviarOrdenACocina: (tableId: string) => void;

  actualizarCocinaTicketStatus: (ticketId: string, newStatus: CocinaTicket['status']) => void;
  alternarItemCocinaCompletado: (ticketId: string, itemIndex: number) => void;

  mostrarCobroModal: (tableId: string) => void;
  cerrarCobroModal: () => void;
  mostrarTicketModal: (tableId: string) => void;
  cerrarTicketModal: () => void;
  procesarPagoYLiberar: (tableId: string, discount: number, tipPercent: number, method: 'Terminal Bancaria' | 'Efectivo en Mesa' | 'Transferencia QR / CoDi') => void;
  liberarMesaDirectamente: (tableId: string) => void;

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
  guardarUser: (userData: Partial<User>) => void;
  mostrarConfirmBajaModal: (user: User) => void;
  cerrarConfirmBajaModal: () => void;
  confirmarBajaUser: () => void;
  reactivarUser: (userId: string) => void;

  mostrarAddBotonModal: () => void;
  mostrarEditBotonModal: (boton: IoTDevice) => void;
  cerrarAddBotonModal: () => void;
  guardarBoton: (botonData: Partial<IoTDevice>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const VIEW_TO_PATH: Record<ActiveView, string> = {
  'login': '/login',
  'recuperar-password': '/recuperar-password',
  'registro': '/registro',
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
  '/registro': 'registro',
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
  const [activeTableId, setActiveTableId] = useState<string | null>('M04');

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
  }, [location.pathname]);

  const [tables, setTables] = useState<TableInfo[]>(INITIAL_TABLES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [iotDevices, setIotDevices] = useState<IoTDevice[]>(INITIAL_IOT_DEVICES);
  const [CocinaTickets, setCocinaTickets] = useState<CocinaTicket[]>(INITIAL_KITCHEN_TICKETS);
  const [cashClosings, setCashClosings] = useState<CashClosingRecord[]>(INITIAL_CASH_CLOSINGS);

  const cargarDatosBackend = async () => {
    try {
      // 1. Cargar Productos del menú
      const resProd = await api.get('/productos');
      if (Array.isArray(resProd.data) && resProd.data.length > 0) {
        setMenuItems(
          resProd.data.map((p: any) => ({
            id: p.id,
            name: p.nombre,
            category: p.categoriaNombre,
            description: p.descripcion || '',
            price: Number(p.precio),
            status: (p.estado as 'DISPONIBLE' | 'AGOTADO' | 'OCULTO') || 'DISPONIBLE',
            options: p.opciones ? p.opciones.map((o: any) => o.nombre) : [],
            allowKitchenNotes: Boolean(p.permiteNotasCocina),
          }))
        );
      }

      if (authService.getToken()) {
        // 2. Cargar Mesas
        try {
          const resMesas = await api.get('/mesas');
          if (Array.isArray(resMesas.data) && resMesas.data.length > 0) {
            setTables((prev) =>
              resMesas.data.map((m: any) => {
                const tableId = `M0${m.numero}`;
                const prevTable = prev.find((t) => t.id === tableId || t.id === m.id);
                return {
                  id: tableId,
                  dbId: m.id,
                  number: m.numero,
                  capacity: m.capacidad,
                  status: m.estado || 'Limpia / Disponible',
                  guests: prevTable?.guests || 0,
                  waiterName: m.meseroNombre || prevTable?.waiterName,
                  currentOrder: prevTable?.currentOrder,
                };
              })
            );
          }
        } catch { }

        // 3. Cargar Botones 
        try {
          const resBot = await api.get('/mesas/botones');
          if (Array.isArray(resBot.data) && resBot.data.length > 0) {
            setIotDevices(
              resBot.data.map((b: any) => ({
                id: b.id,
                name: `Botón de Mesa 0${b.mesaNumero || 1}`,
                tableId: `M0${b.mesaNumero || 1}`,
                batteryPercentage: b.bateria,
                status:
                  b.bateria <= 10
                    ? 'Batería crítica'
                    : b.bateria <= 25
                      ? 'Batería baja'
                      : b.estado === 'ONLINE'
                        ? 'En línea'
                        : 'Sin conexión',
                lastConnection: 'En línea',
              }))
            );
          }
        } catch { }

        // 4. Cargar Usuarios y Cortes
        try {
          const resUsers = await api.get('/usuarios');
          if (Array.isArray(resUsers.data) && resUsers.data.length > 0) {
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

  const [barAlerts, setBarAlerts] = useState<BarAlert[]>([
    { id: 'al-1', tableId: 'M01', message: 'Mesa 01 presionó el botón de aviso', time: '14:31' },
    { id: 'al-2', tableId: 'M05', message: 'Mesa 05 solicita atención del mesero', time: '14:28' },
  ]);

  const [mesasAtendidas, setMesasAtendidas] = useState<Record<string, boolean>>({});

  const [adminNotificaciones, setAdminNotificaciones] = useState<AdminNotificacion[]>(() => {
    const notifs: AdminNotificacion[] = INITIAL_IOT_DEVICES
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
      notifs.push({
        id: `notif-corte-${ultimo.id}`,
        tipo: 'corte',
        titulo: `Corte de caja ${ultimo.folio}`,
        mensaje: `Realizado por ${ultimo.responsible} por $${ultimo.totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
        hora: ultimo.date,
        vistaDestino: 'caja',
      });
    }
    return notifs;
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
      const mensaje = error.response?.data?.message || 'Correo electrónico o contraseña incorrectos';
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
    setActiveView('login');
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
        i => i.menuItemId === item.id && i.selectedOption === selectedOption && i.notes === notes
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
          notes
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

  const enviarOrdenACocina = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table || !table.currentOrder || table.currentOrder.items.length === 0) return;

    const ticketNuevoCocina: CocinaTicket = {
      id: `k-${Date.now()}`,
      orderFolio: table.currentOrder.folio,
      tableId,
      waiterName: table.currentOrder.waiterName,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      elapsedMinutes: 1,
      status: 'Nuevas',
      allergies: table.currentOrder.items.some(i => i.notes?.toLowerCase().includes('alergia'))
        ? ['ALERGIA: Verificar notas']
        : [],
      items: table.currentOrder.items.map(i => ({
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
          status: 'En preparación'
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
    if (ticket && (newStatus === 'Listas' || newStatus === 'Entregadas')) {
      setTables(prev => prev.map(t => {
        if (t.id === ticket.tableId) {
          return {
            ...t,
            status: newStatus === 'Listas' ? 'Atendido' : 'En Consumo'
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
    _method: 'Terminal Bancaria' | 'Efectivo en Mesa' | 'Transferencia QR / CoDi'
  ) => {
    const table = tables.find(t => t.id === tableId);
    if (!table || !table.currentOrder) return;

    const subtotal = table.currentOrder.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const discounted = subtotal * (1 - discount / 100);
    const tip = discounted * (tipPercent / 100);
    void (discounted + tip);

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
    }
    setBarAlerts(prev => prev.filter(a => a.id !== id));
  };

  const marcarMesaAtendida = (tableId: string) => {
    setMesasAtendidas(prev => ({ ...prev, [tableId]: true }));
    setBarAlerts(prev => prev.filter(a => a.tableId !== tableId));
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
  };

  const descartarAdminNotificacion = (id: string) => {
    setAdminNotificaciones(prev => prev.filter(n => n.id !== id));
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
      await api.post('/auth/registro', {
        nombre: userData.name || 'Nuevo Usuario',
        correo: userData.username || `usuario${Date.now()}@holacafe.com`,
        password: userData.password || 'HolaCafe#2026',
        rolId,
      });
      await cargarDatosBackend();
      cerrarAddUserModal();
    } catch (error: any) {
      Swal.fire('Error', error.message || 'No se pudo registrar el usuario', 'error');
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
        await api.patch(`/usuarios/${usuarioBaja.id}/estado`);
        await cargarDatosBackend();
      } catch (error: any) {
        Swal.fire('Error', error.message || 'No se pudo dar de baja al usuario', 'error');
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

  const guardarBoton = (botonData: Partial<IoTDevice>) => {
    if (botonEditando) {
      setIotDevices(prev =>
        prev.map(b =>
          b.id === botonEditando.id
            ? {
              ...b,
              id: botonData.id || b.id,
              name: botonData.name || b.name,
              tableId: botonData.tableId || b.tableId,
            }
            : b
        )
      );
    } else {
      const newBoton: IoTDevice = {
        id: botonData.id || `BOT-M${Math.floor(10 + Math.random() * 89)}`,
        name: botonData.name || 'Botón de Mesa',
        tableId: botonData.tableId || 'M01',
        batteryPercentage: 100,
        status: 'En línea',
        lastConnection: 'Hace unos segundos'
      };
      setIotDevices(prev => [newBoton, ...prev]);
    }
    cerrarAddBotonModal();
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
        eliminarItemFromOrder,
        enviarOrdenACocina,
        actualizarCocinaTicketStatus,
        alternarItemCocinaCompletado,
        mostrarCobroModal,
        cerrarCobroModal,
        mostrarTicketModal,
        cerrarTicketModal,
        procesarPagoYLiberar,
        liberarMesaDirectamente,
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
