import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create branch
  const branch = await prisma.branch.upsert({
    where: { id: 'branch-main' },
    update: {},
    create: {
      id: 'branch-main',
      name: 'Villa del Sol Main',
      address: '123 Restaurant Street, Downtown',
      phone: '+254701234567',
      email: 'main@villadelsolrms.com',
    },
  });

  console.log('✓ Created branch:', branch.name);

  // Create users
  const passwordHash = await bcrypt.hash('password123', 10);

  const waiter = await prisma.user.upsert({
    where: { email: 'waiter@example.com' },
    update: {},
    create: {
      email: 'waiter@example.com',
      firstName: 'John',
      lastName: 'Waiter',
      passwordHash,
      role: 'WAITER',
      branchId: branch.id,
    },
  });

  const chef = await prisma.user.upsert({
    where: { email: 'chef@example.com' },
    update: {},
    create: {
      email: 'chef@example.com',
      firstName: 'Jane',
      lastName: 'Chef',
      passwordHash,
      role: 'CHEF',
      branchId: branch.id,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      firstName: 'Mike',
      lastName: 'Manager',
      passwordHash,
      role: 'MANAGER',
      branchId: branch.id,
    },
  });

  const cashier = await prisma.user.upsert({
    where: { email: 'cashier@example.com' },
    update: {},
    create: {
      email: 'cashier@example.com',
      firstName: 'Sarah',
      lastName: 'Cashier',
      passwordHash,
      role: 'CASHIER',
      branchId: branch.id,
    },
  });

  console.log('✓ Created users:', {
    waiter: waiter.email,
    chef: chef.email,
    manager: manager.email,
    cashier: cashier.email,
  });

  // Create menu categories
  const beveragesCategory = await prisma.menuCategory.upsert({
    where: { id: 'cat-beverages' },
    update: {},
    create: {
      id: 'cat-beverages',
      name: 'Beverages',
      description: 'Drinks and beverages',
      branchId: branch.id,
      order: 1,
    },
  });

  const appetizersCategory = await prisma.menuCategory.upsert({
    where: { id: 'cat-appetizers' },
    update: {},
    create: {
      id: 'cat-appetizers',
      name: 'Appetizers',
      description: 'Starters and appetizers',
      branchId: branch.id,
      order: 2,
    },
  });

  const mainsCategory = await prisma.menuCategory.upsert({
    where: { id: 'cat-mains' },
    update: {},
    create: {
      id: 'cat-mains',
      name: 'Main Courses',
      description: 'Main dishes',
      branchId: branch.id,
      order: 3,
    },
  });

  const dessertsCategory = await prisma.menuCategory.upsert({
    where: { id: 'cat-desserts' },
    update: {},
    create: {
      id: 'cat-desserts',
      name: 'Desserts',
      description: 'Sweet treats',
      branchId: branch.id,
      order: 4,
    },
  });

  console.log('✓ Created menu categories');

  // Create menu items
  const menuItems = [
    {
      id: 'item-cola',
      name: 'Coca Cola',
      description: 'Cold soft drink',
      price: '2.50',
      categoryId: beveragesCategory.id,
      preparationTime: 0,
    },
    {
      id: 'item-oj',
      name: 'Fresh Orange Juice',
      description: 'Freshly squeezed',
      price: '4.00',
      categoryId: beveragesCategory.id,
      preparationTime: 5,
    },
    {
      id: 'item-springs',
      name: 'Spring Rolls',
      description: 'Crispy vegetable rolls',
      price: '5.00',
      categoryId: appetizersCategory.id,
      preparationTime: 8,
    },
    {
      id: 'item-bruschetta',
      name: 'Bruschetta',
      description: 'Toasted bread with tomato',
      price: '6.00',
      categoryId: appetizersCategory.id,
      preparationTime: 5,
    },
    {
      id: 'item-chicken',
      name: 'Grilled Chicken Breast',
      description: 'Served with vegetables',
      price: '15.00',
      categoryId: mainsCategory.id,
      preparationTime: 20,
    },
    {
      id: 'item-steak',
      name: 'Beef Steak',
      description: 'Prime cut, perfectly cooked',
      price: '18.00',
      categoryId: mainsCategory.id,
      preparationTime: 25,
    },
    {
      id: 'item-salmon',
      name: 'Grilled Salmon',
      description: 'Fresh salmon with lemon',
      price: '16.00',
      categoryId: mainsCategory.id,
      preparationTime: 15,
    },
    {
      id: 'item-pasta',
      name: 'Vegetarian Pasta',
      description: 'Fresh pasta with vegetables',
      price: '12.00',
      categoryId: mainsCategory.id,
      preparationTime: 12,
    },
    {
      id: 'item-cake',
      name: 'Chocolate Cake',
      description: 'Rich chocolate dessert',
      price: '7.00',
      categoryId: dessertsCategory.id,
      preparationTime: 2,
    },
    {
      id: 'item-icecream',
      name: 'Ice Cream Sundae',
      description: 'With toppings of your choice',
      price: '6.00',
      categoryId: dessertsCategory.id,
      preparationTime: 3,
    },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        branchId: branch.id,
      },
    });
  }

  console.log('✓ Created 10 menu items');

  // Create payment methods
  await prisma.paymentMethod.upsert({
    where: { id: 'pm-cash' },
    update: {},
    create: {
      id: 'pm-cash',
      name: 'Cash',
      branchId: branch.id,
    },
  });

  await prisma.paymentMethod.upsert({
    where: { id: 'pm-card' },
    update: {},
    create: {
      id: 'pm-card',
      name: 'Card',
      branchId: branch.id,
    },
  });

  await prisma.paymentMethod.upsert({
    where: { id: 'pm-mpesa' },
    update: {},
    create: {
      id: 'pm-mpesa',
      name: 'M-Pesa',
      branchId: branch.id,
    },
  });

  console.log('✓ Created payment methods');

  // Create inventory items
  const inventoryItems = [
    {
      itemName: 'Chicken Breast',
      quantity: '50',
      unit: 'kg',
      minThreshold: '10',
      maxCapacity: '100',
    },
    {
      itemName: 'Beef',
      quantity: '30',
      unit: 'kg',
      minThreshold: '10',
      maxCapacity: '80',
    },
    {
      itemName: 'Fresh Vegetables',
      quantity: '40',
      unit: 'kg',
      minThreshold: '15',
      maxCapacity: '100',
    },
    {
      itemName: 'Olive Oil',
      quantity: '20',
      unit: 'L',
      minThreshold: '5',
      maxCapacity: '50',
    },
    {
      itemName: 'Salt',
      quantity: '10',
      unit: 'kg',
      minThreshold: '2',
      maxCapacity: '20',
    },
  ];

  for (const item of inventoryItems) {
    await prisma.inventory.upsert({
      where: { id: `inv-${item.itemName.toLowerCase().replace(/\s/g, '-')}` },
      update: {},
      create: {
        ...item,
        branchId: branch.id,
      },
    });
  }

  console.log('✓ Created inventory items');

  console.log('\n✓ Database seeded successfully!');
  console.log('\nDemo Credentials:');
  console.log('━'.repeat(50));
  console.log('Waiter:  waiter@example.com / password123');
  console.log('Chef:    chef@example.com / password123');
  console.log('Manager: manager@example.com / password123');
  console.log('Cashier: cashier@example.com / password123');
  console.log('━'.repeat(50));
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
