import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  MenuItem,
  IoTDevice,
  TableInfo,
  KitchenTicket,
  CashClosingRecord,
  ActiveView,
  TableOrder,
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

interface AppContextType {
  currentUser: User | null;
  activeView: ActiveView;
  activeTableId: string | null;
  tables: TableInfo[];
  menuItems: MenuItem[];
  users: User[];
  iotDevices: IoTDevice[];
  kitchenTickets: KitchenTicket[];
  cashClosings: CashClosingRecord[];
  barAlerts: BarAlert[];
  
  // Modals
  isCobroModalOpen: boolean;
  isTicketModalOpen: boolean;
  isProductoModalOpen: boolean;
  editingProduct: MenuItem | null;
  isUsuarioModalOpen: boolean;
  isBotonModalOpen: boolean;
  isConfirmBajaModalOpen: boolean;
  userToBaja: User | null;
  isConfirmEliminarModalOpen: boolean;
  productToDelete: MenuItem | null;

  // Actions
  login: (username: string, role?: string) => boolean;
  logout: () => void;
  setActiveView: (view: ActiveView) => void;
  selectTable: (tableId: string | null) => void;
  
  // Order actions
  addItemToOrder: (tableId: string, item: MenuItem, selectedOption?: string, notes?: string) => void;
  updateItemQuantity: (tableId: string, itemId: string, delta: number) => void;
  removeItemFromOrder: (tableId: string, itemId: string) => void;
  sendOrderToKitchen: (tableId: string) => void;
  
  // Kitchen actions
  updateKitchenTicketStatus: (ticketId: string, newStatus: KitchenTicket['status']) => void;
  toggleKitchenItemCompleted: (ticketId: string, itemIndex: number) => void;

  // Cashier / Payment actions
  openCobroModal: (tableId: string) => void;
  closeCobroModal: () => void;
  openTicketModal: (tableId: string) => void;
  closeTicketModal: () => void;
  processPaymentAndRelease: (tableId: string, discount: number, tipPercent: number, method: 'Terminal Bancaria' | 'Efectivo en Mesa' | 'Transferencia QR / CoDi') => void;
  releaseTableDirectly: (tableId: string) => void;

  // Alerts
  triggerBarAlert: (tableId: string, message: string) => void;
  dismissBarAlert: (id: string) => void;

  // Modals controls
  openAddProductModal: () => void;
  openEditProductModal: (product: MenuItem) => void;
  closeProductModal: () => void;
  saveProduct: (product: Partial<MenuItem>) => void;
  openConfirmEliminarModal: (product: MenuItem) => void;
  closeConfirmEliminarModal: () => void;
  confirmDeleteProduct: () => void;

  openAddUserModal: () => void;
  closeAddUserModal: () => void;
  saveUser: (userData: Partial<User>) => void;
  openConfirmBajaModal: (user: User) => void;
  closeConfirmBajaModal: () => void;
  confirmBajaUser: () => void;
  reactivateUser: (userId: string) => void;

  openAddBotonModal: () => void;
  closeAddBotonModal: () => void;
  saveBoton: (botonData: Partial<IoTDevice>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user defaults to Dante M. (admin) or David Huerta (waiter)
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]);
  const [activeView, setActiveView] = useState<ActiveView>('mapa-mesas');
  const [activeTableId, setActiveTableId] = useState<string | null>('M04');

  const [tables, setTables] = useState<TableInfo[]>(INITIAL_TABLES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [iotDevices, setIotDevices] = useState<IoTDevice[]>(INITIAL_IOT_DEVICES);
  const [kitchenTickets, setKitchenTickets] = useState<KitchenTicket[]>(INITIAL_KITCHEN_TICKETS);
  const [cashClosings, setCashClosings] = useState<CashClosingRecord[]>(INITIAL_CASH_CLOSINGS);
  
  const [barAlerts, setBarAlerts] = useState<BarAlert[]>([
    { id: 'al-1', tableId: 'M04', message: 'Mesa 04 solicita cuenta', time: '14:31' },
    { id: 'al-2', tableId: 'M07', message: 'Mesa 07 solicita mesero', time: '14:28' },
  ]);

  // Modals state
  const [isCobroModalOpen, setIsCobroModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isProductoModalOpen, setIsProductoModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MenuItem | null>(null);
  const [isUsuarioModalOpen, setIsUsuarioModalOpen] = useState(false);
  const [isBotonModalOpen, setIsBotonModalOpen] = useState(false);
  const [isConfirmBajaModalOpen, setIsConfirmBajaModalOpen] = useState(false);
  const [userToBaja, setUserToBaja] = useState<User | null>(null);
  const [isConfirmEliminarModalOpen, setIsConfirmEliminarModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<MenuItem | null>(null);

  // Sync devices with tables
  useEffect(() => {
    setTables(prev => prev.map(t => {
      const dev = iotDevices.find(d => d.tableId === t.id);
      return { ...t, device: dev };
    }));
  }, [iotDevices]);

  const login = (username: string) => {
    const found = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (found) {
      setCurrentUser(found);
      setActiveView(found.role === 'Cocinero' ? 'cocina' : found.role === 'Administrador' ? 'caja' : 'mapa-mesas');
      return true;
    }
    // Default fallback to first active user
    const fallback = users[0];
    setCurrentUser(fallback);
    setActiveView('mapa-mesas');
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveView('login');
  };

  const selectTable = (tableId: string | null) => {
    setActiveTableId(tableId);
  };

  const addItemToOrder = (tableId: string, item: MenuItem, selectedOption?: string, notes?: string) => {
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

      // Check if item with same option and notes already in order
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

  const updateItemQuantity = (tableId: string, itemId: string, delta: number) => {
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

  const removeItemFromOrder = (tableId: string, itemId: string) => {
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

  const sendOrderToKitchen = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table || !table.currentOrder || table.currentOrder.items.length === 0) return;

    // Create KDS ticket
    const newKitchenTicket: KitchenTicket = {
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

    setKitchenTickets(prev => [newKitchenTicket, ...prev]);

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

  const updateKitchenTicketStatus = (ticketId: string, newStatus: KitchenTicket['status']) => {
    setKitchenTickets(prev => prev.map(k => {
      if (k.id !== ticketId) return k;
      return { ...k, status: newStatus };
    }));

    // If marked as list, update table status
    const ticket = kitchenTickets.find(k => k.id === ticketId);
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

  const toggleKitchenItemCompleted = (ticketId: string, itemIndex: number) => {
    setKitchenTickets(prev => prev.map(k => {
      if (k.id !== ticketId) return k;
      const updated = [...k.items];
      updated[itemIndex] = {
        ...updated[itemIndex],
        completed: !updated[itemIndex].completed
      };
      return { ...k, items: updated };
    }));
  };

  const openCobroModal = (tableId: string) => {
    setActiveTableId(tableId);
    setIsCobroModalOpen(true);
  };

  const closeCobroModal = () => {
    setIsCobroModalOpen(false);
  };

  const openTicketModal = (tableId: string) => {
    setActiveTableId(tableId);
    setIsTicketModalOpen(true);
  };

  const closeTicketModal = () => {
    setIsTicketModalOpen(false);
  };

  const processPaymentAndRelease = (
    tableId: string,
    discount: number,
    tipPercent: number,
    method: 'Terminal Bancaria' | 'Efectivo en Mesa' | 'Transferencia QR / CoDi'
  ) => {
    const table = tables.find(t => t.id === tableId);
    if (!table || !table.currentOrder) return;

    const subtotal = table.currentOrder.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const discounted = subtotal * (1 - discount / 100);
    const tip = discounted * (tipPercent / 100);
    const total = discounted + tip;

    // Update table
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

    // Remove any alert for this table
    setBarAlerts(prev => prev.filter(a => a.tableId !== tableId));
    closeCobroModal();
  };

  const releaseTableDirectly = (tableId: string) => {
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

  const triggerBarAlert = (tableId: string, message: string) => {
    const newAlert: BarAlert = {
      id: `al-${Date.now()}`,
      tableId,
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setBarAlerts(prev => [newAlert, ...prev]);

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
  };

  const dismissBarAlert = (id: string) => {
    setBarAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Menu Product CRUD
  const openAddProductModal = () => {
    setEditingProduct(null);
    setIsProductoModalOpen(true);
  };

  const openEditProductModal = (product: MenuItem) => {
    setEditingProduct(product);
    setIsProductoModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductoModalOpen(false);
    setEditingProduct(null);
  };

  const saveProduct = (productData: Partial<MenuItem>) => {
    if (editingProduct) {
      setMenuItems(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...productData } as MenuItem : p));
    } else {
      const newProduct: MenuItem = {
        id: `prod-${Date.now()}`,
        name: productData.name || 'Nuevo Producto',
        category: productData.category || 'Alimentos salados',
        description: productData.description || '',
        price: Number(productData.price) || 0,
        status: productData.status || 'DISPONIBLE',
        options: productData.options || [],
        allowKitchenNotes: productData.allowKitchenNotes ?? true
      };
      setMenuItems(prev => [newProduct, ...prev]);
    }
    closeProductModal();
  };

  const openConfirmEliminarModal = (product: MenuItem) => {
    setProductToDelete(product);
    setIsConfirmEliminarModalOpen(true);
  };

  const closeConfirmEliminarModal = () => {
    setIsConfirmEliminarModalOpen(false);
    setProductToDelete(null);
  };

  const confirmDeleteProduct = () => {
    if (productToDelete) {
      setMenuItems(prev => prev.filter(p => p.id !== productToDelete.id));
    }
    closeConfirmEliminarModal();
  };

  // User CRUD
  const openAddUserModal = () => {
    setIsUsuarioModalOpen(true);
  };

  const closeAddUserModal = () => {
    setIsUsuarioModalOpen(false);
  };

  const saveUser = (userData: Partial<User>) => {
    const names = (userData.name || 'Nuevo Usuario').split(' ');
    const initials = names.map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const newUser: User = {
      id: `u-${Date.now()}`,
      name: userData.name || 'Nuevo Usuario',
      initials,
      username: userData.username || 'usuario',
      role: userData.role || 'Mesero',
      shift: userData.shift || 'Turno vespertino',
      lastAccess: 'Hoy · Reciente',
      status: 'ACTIVO'
    };
    setUsers(prev => [newUser, ...prev]);
    closeAddUserModal();
  };

  const openConfirmBajaModal = (user: User) => {
    setUserToBaja(user);
    setIsConfirmBajaModalOpen(true);
  };

  const closeConfirmBajaModal = () => {
    setIsConfirmBajaModalOpen(false);
    setUserToBaja(null);
  };

  const confirmBajaUser = () => {
    if (userToBaja) {
      setUsers(prev => prev.map(u => u.id === userToBaja.id ? { ...u, status: 'BAJA' } : u));
    }
    closeConfirmBajaModal();
  };

  const reactivateUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'ACTIVO' } : u));
  };

  // IoT Button Modal
  const openAddBotonModal = () => {
    setIsBotonModalOpen(true);
  };

  const closeAddBotonModal = () => {
    setIsBotonModalOpen(false);
  };

  const saveBoton = (botonData: Partial<IoTDevice>) => {
    const newBoton: IoTDevice = {
      id: botonData.id || `BOT-M${Math.floor(10 + Math.random() * 89)}`,
      name: botonData.name || 'Botón de Mesa',
      tableId: botonData.tableId || 'M01',
      batteryPercentage: 100,
      status: 'En línea',
      lastConnection: 'Hace unos segundos'
    };
    setIotDevices(prev => [newBoton, ...prev]);
    closeAddBotonModal();
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
        kitchenTickets,
        cashClosings,
        barAlerts,
        isCobroModalOpen,
        isTicketModalOpen,
        isProductoModalOpen,
        editingProduct,
        isUsuarioModalOpen,
        isBotonModalOpen,
        isConfirmBajaModalOpen,
        userToBaja,
        isConfirmEliminarModalOpen,
        productToDelete,
        login,
        logout,
        setActiveView,
        selectTable,
        addItemToOrder,
        updateItemQuantity,
        removeItemFromOrder,
        sendOrderToKitchen,
        updateKitchenTicketStatus,
        toggleKitchenItemCompleted,
        openCobroModal,
        closeCobroModal,
        openTicketModal,
        closeTicketModal,
        processPaymentAndRelease,
        releaseTableDirectly,
        triggerBarAlert,
        dismissBarAlert,
        openAddProductModal,
        openEditProductModal,
        closeProductModal,
        saveProduct,
        openConfirmEliminarModal,
        closeConfirmEliminarModal,
        confirmDeleteProduct,
        openAddUserModal,
        closeAddUserModal,
        saveUser,
        openConfirmBajaModal,
        closeConfirmBajaModal,
        confirmBajaUser,
        reactivateUser,
        openAddBotonModal,
        closeAddBotonModal,
        saveBoton,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
