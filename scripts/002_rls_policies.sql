-- Row Level Security (RLS) Policies for Villa del Sol RMS
-- Multi-branch tenant isolation and access control

-- Enable RLS on all tables
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE kitchen_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_shifts ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's branch ID
CREATE OR REPLACE FUNCTION get_current_user_branch_id()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    auth.jwt() ->> 'branch_id',
    current_setting('app.current_branch_id', true),
    ''
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========== BRANCHES RLS ==========
-- Users can only see their own branch
CREATE POLICY branches_select_own ON branches
  FOR SELECT USING (
    id = get_current_user_branch_id() OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
  );

CREATE POLICY branches_update_own ON branches
  FOR UPDATE USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
  );

-- ========== USERS RLS ==========
-- Users can only see users from their branch
CREATE POLICY users_select_own_branch ON users
  FOR SELECT USING (
    "branchId" = get_current_user_branch_id() OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
  );

CREATE POLICY users_insert_own_branch ON users
  FOR INSERT WITH CHECK (
    "branchId" = get_current_user_branch_id() OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
  );

CREATE POLICY users_update_own ON users
  FOR UPDATE USING (
    id = auth.uid() OR
    (SELECT role FROM users WHERE id = auth.uid()) IN ('ADMIN', 'MANAGER')
  );

-- ========== MENU CATEGORIES RLS ==========
-- Users can see menu categories from their branch
CREATE POLICY menu_categories_select ON menu_categories
  FOR SELECT USING (
    "branchId" = get_current_user_branch_id()
  );

CREATE POLICY menu_categories_insert_manager ON menu_categories
  FOR INSERT WITH CHECK (
    "branchId" = get_current_user_branch_id() AND
    (SELECT role FROM users WHERE id = auth.uid()) IN ('ADMIN', 'MANAGER')
  );

CREATE POLICY menu_categories_update_manager ON menu_categories
  FOR UPDATE USING (
    "branchId" = get_current_user_branch_id() AND
    (SELECT role FROM users WHERE id = auth.uid()) IN ('ADMIN', 'MANAGER')
  );

-- ========== MENU ITEMS RLS ==========
-- Users can see menu items from their branch
CREATE POLICY menu_items_select ON menu_items
  FOR SELECT USING (
    "branchId" = get_current_user_branch_id()
  );

CREATE POLICY menu_items_insert_manager ON menu_items
  FOR INSERT WITH CHECK (
    "branchId" = get_current_user_branch_id() AND
    (SELECT role FROM users WHERE id = auth.uid()) IN ('ADMIN', 'MANAGER')
  );

CREATE POLICY menu_items_update_manager ON menu_items
  FOR UPDATE USING (
    "branchId" = get_current_user_branch_id() AND
    (SELECT role FROM users WHERE id = auth.uid()) IN ('ADMIN', 'MANAGER')
  );

-- ========== ORDERS RLS ==========
-- Users can see orders from their branch
CREATE POLICY orders_select ON orders
  FOR SELECT USING (
    "branchId" = get_current_user_branch_id()
  );

CREATE POLICY orders_insert ON orders
  FOR INSERT WITH CHECK (
    "branchId" = get_current_user_branch_id()
  );

CREATE POLICY orders_update ON orders
  FOR UPDATE USING (
    "branchId" = get_current_user_branch_id()
  );

-- ========== ORDER ITEMS RLS ==========
-- Users can see order items from their branch (via order)
CREATE POLICY order_items_select ON order_items
  FOR SELECT USING (
    "orderId" IN (
      SELECT id FROM orders WHERE "branchId" = get_current_user_branch_id()
    )
  );

CREATE POLICY order_items_insert ON order_items
  FOR INSERT WITH CHECK (
    "orderId" IN (
      SELECT id FROM orders WHERE "branchId" = get_current_user_branch_id()
    )
  );

-- ========== KITCHEN QUEUES RLS ==========
-- Chefs can see kitchen queues from their branch
CREATE POLICY kitchen_queues_select ON kitchen_queues
  FOR SELECT USING (
    "orderId" IN (
      SELECT id FROM orders WHERE "branchId" = get_current_user_branch_id()
    )
  );

CREATE POLICY kitchen_queues_insert ON kitchen_queues
  FOR INSERT WITH CHECK (
    "orderId" IN (
      SELECT id FROM orders WHERE "branchId" = get_current_user_branch_id()
    )
  );

CREATE POLICY kitchen_queues_update ON kitchen_queues
  FOR UPDATE USING (
    "orderId" IN (
      SELECT id FROM orders WHERE "branchId" = get_current_user_branch_id()
    )
  );

-- ========== PAYMENTS RLS ==========
-- Users can see payments from their branch
CREATE POLICY payments_select ON payments
  FOR SELECT USING (
    "branchId" = get_current_user_branch_id()
  );

CREATE POLICY payments_insert ON payments
  FOR INSERT WITH CHECK (
    "branchId" = get_current_user_branch_id()
  );

CREATE POLICY payments_update ON payments
  FOR UPDATE USING (
    "branchId" = get_current_user_branch_id()
  );

-- ========== PAYMENT METHODS RLS ==========
-- Users can see payment methods from their branch
CREATE POLICY payment_methods_select ON payment_methods
  FOR SELECT USING (
    "branchId" = get_current_user_branch_id()
  );

CREATE POLICY payment_methods_insert_manager ON payment_methods
  FOR INSERT WITH CHECK (
    "branchId" = get_current_user_branch_id() AND
    (SELECT role FROM users WHERE id = auth.uid()) IN ('ADMIN', 'MANAGER')
  );

-- ========== INVENTORY RLS ==========
-- Users can see inventory from their branch
CREATE POLICY inventory_select ON inventory
  FOR SELECT USING (
    "branchId" = get_current_user_branch_id()
  );

CREATE POLICY inventory_insert_manager ON inventory
  FOR INSERT WITH CHECK (
    "branchId" = get_current_user_branch_id() AND
    (SELECT role FROM users WHERE id = auth.uid()) IN ('ADMIN', 'MANAGER')
  );

CREATE POLICY inventory_update_manager ON inventory
  FOR UPDATE USING (
    "branchId" = get_current_user_branch_id() AND
    (SELECT role FROM users WHERE id = auth.uid()) IN ('ADMIN', 'MANAGER')
  );

-- ========== STAFF SHIFTS RLS ==========
-- Users can see staff shifts from their branch
CREATE POLICY staff_shifts_select ON staff_shifts
  FOR SELECT USING (
    "branchId" = get_current_user_branch_id()
  );

CREATE POLICY staff_shifts_insert ON staff_shifts
  FOR INSERT WITH CHECK (
    "branchId" = get_current_user_branch_id()
  );

CREATE POLICY staff_shifts_update ON staff_shifts
  FOR UPDATE USING (
    "branchId" = get_current_user_branch_id()
  );
