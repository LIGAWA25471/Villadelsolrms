import { z } from 'zod';

// Auth Validation
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginRequest = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  branchId: z.string().min(1, 'Branch is required'),
});

export type RegisterRequest = z.infer<typeof RegisterSchema>;

// Order Validation
export const CreateOrderSchema = z.object({
  tableNumber: z.number().int().optional(),
  customerName: z.string().optional(),
  items: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number().int().min(1),
    notes: z.string().optional(),
    specialRequests: z.string().optional(),
  })),
  notes: z.string().optional(),
});

export type CreateOrderRequest = z.infer<typeof CreateOrderSchema>;

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED', 'COMPLETED']),
});

export type UpdateOrderStatusRequest = z.infer<typeof UpdateOrderStatusSchema>;

// Payment Validation
export const CreatePaymentSchema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
  paymentMethod: z.string(),
  transactionId: z.string().optional(),
});

export type CreatePaymentRequest = z.infer<typeof CreatePaymentSchema>;

// Menu Item Validation
export const CreateMenuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be greater than 0'),
  categoryId: z.string(),
  preparationTime: z.number().int().positive(),
  image: z.string().optional(),
});

export type CreateMenuItemRequest = z.infer<typeof CreateMenuItemSchema>;
