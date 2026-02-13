import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateOrderRequest, UpdateOrderStatusRequest, OrderStatus } from '@villa-del-sol/shared';
import { TAX_RATE } from '@villa-del-sol/shared';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(branchId: string, staffId: string, createOrderDto: CreateOrderRequest) {
    const { items, tableNumber, customerName, notes } = createOrderDto;

    // Calculate totals
    let subtotal = 0;

    // Get menu items and validate
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: { in: items.map((i) => i.menuItemId) },
        branchId,
      },
    });

    if (menuItems.length !== items.length) {
      throw new BadRequestException('Some menu items not found or not in this branch');
    }

    // Calculate subtotal
    const itemsWithPrices = items.map((item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);
      const totalPrice = Number(menuItem.price) * item.quantity;
      subtotal += totalPrice;
      return {
        ...item,
        unitPrice: Number(menuItem.price),
        totalPrice,
      };
    });

    const tax = Number((subtotal * TAX_RATE).toFixed(2));
    const totalAmount = subtotal + tax;

    // Generate order number
    const lastOrder = await this.prisma.order.findFirst({
      where: { branchId },
      orderBy: { createdAt: 'desc' },
    });

    const orderNumber = `ORD-${Date.now()}`;

    // Create order with items
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        branchId,
        staffId,
        tableNumber,
        customerName,
        notes,
        subtotal,
        tax,
        totalAmount,
        status: 'PENDING',
        items: {
          create: itemsWithPrices,
        },
      },
      include: { items: true },
    });

    // Create kitchen queue
    await this.prisma.kitchenQueue.create({
      data: {
        orderId: order.id,
        station: 'Main',
        status: 'NEW',
      },
    });

    return order;
  }

  async getOrders(branchId: string, status?: OrderStatus) {
    const where: any = { branchId };
    if (status) {
      where.status = status;
    }

    return this.prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(orderId: string, branchId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, branchId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateOrderStatus(orderId: string, branchId: string, updateDto: UpdateOrderStatusRequest) {
    const order = await this.getOrderById(orderId, branchId);

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: updateDto.status },
      include: { items: true },
    });

    // Update kitchen queue if preparing
    if (updateDto.status === 'PREPARING') {
      await this.prisma.kitchenQueue.update({
        where: { orderId },
        data: { status: 'PREPARING', startedAt: new Date() },
      });
    }

    if (updateDto.status === 'READY') {
      await this.prisma.kitchenQueue.update({
        where: { orderId },
        data: { status: 'READY_FOR_PICKUP' },
      });
    }

    return updatedOrder;
  }

  async cancelOrder(orderId: string, branchId: string) {
    const order = await this.getOrderById(orderId, branchId);

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
      include: { items: true },
    });

    await this.prisma.kitchenQueue.update({
      where: { orderId },
      data: { status: 'CANCELLED' },
    });

    return updatedOrder;
  }
}
