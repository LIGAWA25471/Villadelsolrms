-- Database initialization with RLS policies for Villa del Sol RMS

-- Create extension for UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Branches table
CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT NOT NULL UNIQUE,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  phone TEXT,
  "passwordHash" TEXT NOT NULL,
  role TEXT DEFAULT 'WAITER' CHECK (role IN ('ADMIN', 'MANAGER', 'WAITER', 'CHEF', 'CASHIER')),
  "isActive" BOOLEAN DEFAULT TRUE,
  "branchId" TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_branch_id ON users("branchId");
CREATE INDEX idx_users_email ON users(email);

-- Menu Categories table
CREATE TABLE IF NOT EXISTS menu_categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  "branchId" TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  "order" INT DEFAULT 0,
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("branchId", name)
);

CREATE INDEX idx_menu_categories_branch_id ON menu_categories("branchId");

-- Menu Items table
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  "categoryId" TEXT NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  "branchId" TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  image TEXT,
  "isActive" BOOLEAN DEFAULT TRUE,
  "preparationTime" INT DEFAULT 15,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_menu_items_category_id ON menu_items("categoryId");
CREATE INDEX idx_menu_items_branch_id ON menu_items("branchId");

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "orderNumber" TEXT NOT NULL,
  "tableNumber" INT,
  "customerName" TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED', 'COMPLETED')),
  "totalAmount" NUMERIC(10, 2) DEFAULT 0,
  subtotal NUMERIC(10, 2) DEFAULT 0,
  tax NUMERIC(10, 2) DEFAULT 0,
  discount NUMERIC(10, 2) DEFAULT 0,
  notes TEXT,
  "staffId" TEXT REFERENCES users(id) ON DELETE SET NULL,
  "branchId" TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP,
  "paidAt" TIMESTAMP,
  UNIQUE("branchId", "orderNumber")
);

CREATE INDEX idx_orders_branch_id ON orders("branchId");
CREATE INDEX idx_orders_staff_id ON orders("staffId");
CREATE INDEX idx_orders_status ON orders(status);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "orderId" TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  "menuItemId" TEXT NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
  quantity INT NOT NULL,
  "unitPrice" NUMERIC(10, 2) NOT NULL,
  "totalPrice" NUMERIC(10, 2) NOT NULL,
  notes TEXT,
  "specialRequests" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items("orderId");
CREATE INDEX idx_order_items_menu_item_id ON order_items("menuItemId");

-- Kitchen Queue table
CREATE TABLE IF NOT EXISTS kitchen_queues (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "orderId" TEXT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED')),
  station TEXT NOT NULL,
  priority INT DEFAULT 0,
  "startedAt" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kitchen_queues_status ON kitchen_queues(status);
CREATE INDEX idx_kitchen_queues_station ON kitchen_queues(station);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "orderId" TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  "paymentMethodId" TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED')),
  "transactionId" TEXT,
  "staffId" TEXT REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  "branchId" TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_order_id ON payments("orderId");
CREATE INDEX idx_payments_branch_id ON payments("branchId");

-- Payment Methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  "isActive" BOOLEAN DEFAULT TRUE,
  "branchId" TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("branchId", name)
);

CREATE INDEX idx_payment_methods_branch_id ON payment_methods("branchId");

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "itemName" TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  "minThreshold" NUMERIC(10, 2) NOT NULL,
  "maxCapacity" NUMERIC(10, 2) NOT NULL,
  "branchId" TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  "lastRestockDate" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("branchId", "itemName")
);

CREATE INDEX idx_inventory_branch_id ON inventory("branchId");

-- Staff Shifts table
CREATE TABLE IF NOT EXISTS staff_shifts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "branchId" TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  "startTime" TIMESTAMP NOT NULL,
  "endTime" TIMESTAMP,
  "breakStart" TIMESTAMP,
  "breakEnd" TIMESTAMP,
  "totalHours" NUMERIC(5, 2) DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_staff_shifts_user_id ON staff_shifts("userId");
CREATE INDEX idx_staff_shifts_branch_id ON staff_shifts("branchId");
