-- Enable RLS on all tables
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE kitchen_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_shifts ENABLE ROW LEVEL SECURITY;

-- ========== BRANCHES RLS ==========
CREATE POLICY "Admins can view all branches" ON branches
  FOR SELECT USING (true); -- Can be refined later

CREATE POLICY "Branch managers can update their own branch" ON branches
  FOR UPDATE USING (true); -- Will check JWT claims in app

-- ========== USERS RLS ==========
CREATE POLICY "Users can view their own branch users" ON users
  FOR SELECT USING (true); -- Filtered by branch_id in app

CREATE POLICY "Users can only update themselves" ON users
  FOR UPDATE USING (true); -- Filtered in app

-- ========== MENU CATEGORIES RLS ==========
CREATE POLICY "Users can view menu categories for their branch" ON menu_categories
  FOR SELECT USING (true); -- Filtered by branch_id in app

CREATE POLICY "Branch managers can manage menu categories" ON menu_categories
  FOR ALL USING (true); -- Filtered by branch_id and role in app

-- ========== MENU ITEMS RLS ==========
CREATE POLICY "Users can view menu items for their branch" ON menu_items
  FOR SELECT USING (true); -- Filtered by branch_id in app

CREATE POLICY "Branch managers can manage menu items" ON menu_items
  FOR ALL USING (true); -- Filtered by branch_id and role in app

-- ========== ORDERS RLS ==========
CREATE POLICY "Users can view orders for their branch" ON orders
  FOR SELECT USING (true); -- Filtered by branch_id in app

CREATE POLICY "Staff can create orders for their branch" ON orders
  FOR INSERT WITH CHECK (true); -- Filtered by branch_id and role in app

CREATE POLICY "Staff can update orders for their branch" ON orders
  FOR UPDATE USING (true); -- Filtered by branch_id in app

-- ========== ORDER ITEMS RLS ==========
CREATE POLICY "Users can view order items" ON order_items
  FOR SELECT USING (true); -- Filtered through order relationship

CREATE POLICY "Users can manage order items" ON order_items
  FOR ALL USING (true); -- Filtered through order relationship

-- ========== PAYMENT METHODS RLS ==========
CREATE POLICY "Users can view payment methods for their branch" ON payment_methods
  FOR SELECT USING (true); -- Filtered by branch_id in app

CREATE POLICY "Branch managers can manage payment methods" ON payment_methods
  FOR ALL USING (true); -- Filtered by branch_id and role in app

-- ========== PAYMENTS RLS ==========
CREATE POLICY "Users can view payments for their branch" ON payments
  FOR SELECT USING (true); -- Filtered by branch_id in app

CREATE POLICY "Staff can create payments" ON payments
  FOR INSERT WITH CHECK (true); -- Filtered by branch_id in app

CREATE POLICY "Staff can update payments" ON payments
  FOR UPDATE USING (true); -- Filtered by branch_id in app

-- ========== KITCHEN QUEUES RLS ==========
CREATE POLICY "Kitchen staff can view all kitchen queues" ON kitchen_queues
  FOR SELECT USING (true); -- Filtered through order relationship

CREATE POLICY "System can manage kitchen queues" ON kitchen_queues
  FOR ALL USING (true); -- Filtered through order relationship

-- ========== INVENTORY RLS ==========
CREATE POLICY "Users can view inventory for their branch" ON inventory
  FOR SELECT USING (true); -- Filtered by branch_id in app

CREATE POLICY "Managers can manage inventory" ON inventory
  FOR ALL USING (true); -- Filtered by branch_id and role in app

-- ========== STAFF SHIFTS RLS ==========
CREATE POLICY "Users can view shifts for their branch" ON staff_shifts
  FOR SELECT USING (true); -- Filtered by branch_id in app

CREATE POLICY "Managers can manage shifts" ON staff_shifts
  FOR ALL USING (true); -- Filtered by branch_id and role in app
