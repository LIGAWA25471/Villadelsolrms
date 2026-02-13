import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed data for development/testing
  console.log('Seeding database...');

  // Create a main branch
  const mainBranch = await prisma.branch.upsert({
    where: { id: 'branch-main' },
    update: {},
    create: {
      id: 'branch-main',
      name: 'Villa del Sol - Downtown',
      address: '123 Main St, Downtown',
      phone: '555-0001',
      email: 'downtown@villadelsolrms.com',
    },
  });

  // Create payment methods
  await prisma.paymentMethod.upsert({
    where: { id: 'pm-cash' },
    update: {},
    create: {
      id: 'pm-cash',
      name: 'Cash',
      branchId: mainBranch.id,
    },
  });

  await prisma.paymentMethod.upsert({
    where: { id: 'pm-card' },
    update: {},
    create: {
      id: 'pm-card',
      name: 'Card',
      branchId: mainBranch.id,
    },
  });

  // Create menu categories
  const appetizers = await prisma.menuCategory.upsert({
    where: { id: 'cat-appetizers' },
    update: {},
    create: {
      id: 'cat-appetizers',
      name: 'Appetizers',
      branchId: mainBranch.id,
      order: 1,
    },
  });

  const mains = await prisma.menuCategory.upsert({
    where: { id: 'cat-mains' },
    update: {},
    create: {
      id: 'cat-mains',
      name: 'Main Courses',
      branchId: mainBranch.id,
      order: 2,
    },
  });

  // Create menu items
  await prisma.menuItem.upsert({
    where: { id: 'item-nachos' },
    update: {},
    create: {
      id: 'item-nachos',
      name: 'Nachos Supreme',
      description: 'Crispy tortilla chips with cheese, jalapeños, and sour cream',
      price: '8.99',
      categoryId: appetizers.id,
      branchId: mainBranch.id,
      preparationTime: 10,
    },
  });

  await prisma.menuItem.upsert({
    where: { id: 'item-tacos' },
    update: {},
    create: {
      id: 'item-tacos',
      name: 'Carne Asada Tacos',
      description: 'Grilled meat tacos with onions, cilantro, and lime',
      price: '12.99',
      categoryId: mains.id,
      branchId: mainBranch.id,
      preparationTime: 15,
    },
  });

  console.log('Seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
