// User Types
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  WAITER = 'WAITER',
  CHEF = 'CHEF',
  CASHIER = 'CASHIER',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  branchId: string;
  isActive: boolean;
}

// Order Types
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  SERVED = 'SERVED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  image?: string;
  preparationTime: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  specialRequests?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableNumber?: number;
  customerName?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  notes?: string;
  staffId?: string;
  branchId: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  paidAt?: Date;
}

// Payment Types
export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  status: PaymentStatus;
  transactionId?: string;
  createdAt: Date;
}

// Kitchen Queue Types
export enum KitchenStatus {
  NEW = 'NEW',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface KitchenQueueItem {
  id: string;
  orderId: string;
  orderNumber: string;
  items: OrderItem[];
  status: KitchenStatus;
  station: string;
  priority: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// WebSocket Events
export enum SocketEvent {
  // Order events
  ORDER_CREATED = 'order:created',
  ORDER_UPDATED = 'order:updated',
  ORDER_CANCELLED = 'order:cancelled',
  
  // Kitchen events
  KITCHEN_ORDER_ADDED = 'kitchen:order_added',
  KITCHEN_ORDER_STATUS = 'kitchen:order_status',
  
  // Payment events
  PAYMENT_COMPLETED = 'payment:completed',
  PAYMENT_FAILED = 'payment:failed',
}

// Branch Types
export interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
}
