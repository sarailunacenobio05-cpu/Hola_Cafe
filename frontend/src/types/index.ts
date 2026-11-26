export type UserRole = 'Administrador' | 'Mesero' | 'Cocinero' | 'Cajero';

export interface User {
  id: string;
  name: string;
  initials: string;
  username: string;
  role: UserRole;
  shift: 'Turno matutino' | 'Turno vespertino' | 'Turno completo';
  lastAccess: string;
  status: 'ACTIVO' | 'BAJA';
  avatar?: string;
}

export type TableStatus = 
  | 'Limpia / Disponible'
  | 'Tomando Comanda'
  | 'Tomando comanda por cancelación'
  | 'En Consumo'
  | 'En Preparación'
  | 'Atendido'
  | 'Pidiendo Cuenta'
  | 'Reservada';

export interface IoTDevice {
  id: string;              // e.g. 'BOT-M01'
  name: string;            // e.g. 'Botón de Mesa 01'
  tableId: string;         // e.g. 'M01'
  batteryPercentage: number; // e.g. 92
  status: 'En línea' | 'Batería baja' | 'Batería crítica' | 'Sin conexión';
  lastConnection: string;  // e.g. 'Hace 10 s'
  alertActive?: boolean;   // true if currently pressed
}

export interface ProductVariant {
  name: string;
  extraPrice?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  discountPercent?: number; // Descuento individual del producto (0 a 100)
  status: 'DISPONIBLE' | 'AGOTADO' | 'OCULTO';
  options?: string[]; // e.g. ['Natural', 'Vainilla', 'Caramelo']
  allowKitchenNotes?: boolean;
  image?: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  quantity: number;
  selectedOption?: string;
  notes?: string;
  allergies?: string[];
  enviadoACocina?: boolean;
  entregado?: boolean;
}

export interface TableOrder {
  id: string;
  folio: number;
  tableId: string;
  waiterId: string;
  waiterName: string;
  guestsCount: number;
  items: OrderItem[];
  createdAt: string;
  timeElapsedMinutes: number;
  status: 'Abierta' | 'Enviada' | 'En preparación' | 'Lista' | 'Por Cobrar' | 'Cerrada';
  discountPercent?: number; // 0 or 10
  tipPercent?: number;      // 0, 10, 15, 20
  paymentMethod?: 'Terminal Bancaria' | 'Efectivo en Mesa' | 'Transferencia QR / CoDi';
  amountPaid?: number;
  change?: number;
}

export interface KitchenTicket {
  id: string;
  orderFolio: number;
  tableId: string;
  waiterId?: string;
  waiterName: string;
  items: {
    name: string;
    quantity: number;
    option?: string;
    notes?: string;
    completed?: boolean;
  }[];
  allergies: string[];
  createdAt: string;
  elapsedMinutes: number;
  status: 'Nuevas' | 'En preparación' | 'Listas' | 'Entregadas';
}

export type CocinaTicket = KitchenTicket;

export interface CashClosingRecord {
  id: string;
  folio: string;
  date: string;
  responsible: string;
  totalSales: number;
  cashAmount: number;
  cardAmount: number;
  difference: number;
  status: 'Completado' | 'Con diferencia';
  ticketsCount: number;
}

export interface TableInfo {
  id: string;              // M01, M02, ...
  number: number;
  capacity: number;
  guests: number;
  waiterId: string;
  waiterName: string;
  status: TableStatus;
  hasAlert: boolean;
  alertType?: 'Llamada de cliente' | 'Solicitud de cuenta' | 'Batería baja' | 'Pedido listo en cocina';
  currentOrder?: TableOrder;
  device?: IoTDevice;
}

export type ActiveView = 
  | 'login'
  | 'recuperar-password'
  | 'mapa-mesas'
  | 'comandero'
  | 'cocina'
  | 'caja'
  | 'revision-tickets'
  | 'config-menu'
  | 'config-descuentos'
  | 'config-usuarios'
  | 'botones-aviso';
