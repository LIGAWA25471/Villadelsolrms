import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreatePaymentRequest } from '@villa-del-sol/shared';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async processPayment(branchId: string, staffId: string, createPaymentDto: CreatePaymentRequest) {
    const { orderId, amount, paymentMethod } = createPaymentDto;

    // Validate order exists and belongs to branch
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, branchId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (Number(order.totalAmount) !== amount) {
      throw new BadRequestException('Payment amount does not match order total');
    }

    // Get payment method
    const paymentMethodRecord = await this.prisma.paymentMethod.findFirst({
      where: { name: paymentMethod, branchId },
    });

    if (!paymentMethodRecord) {
      throw new BadRequestException('Payment method not found');
    }

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        amount,
        paymentMethodId: paymentMethodRecord.id,
        branchId,
        staffId,
        status: 'COMPLETED',
      },
    });

    // Update order status
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'COMPLETED', paidAt: new Date() },
    });

    return payment;
  }

  async getPaymentsByOrder(orderId: string, branchId: string) {
    return this.prisma.payment.findMany({
      where: { orderId, branchId },
      include: { paymentMethod: true },
    });
  }

  async getPaymentsByBranch(branchId: string, startDate?: Date, endDate?: Date) {
    const where: any = { branchId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    return this.prisma.payment.findMany({
      where,
      include: { order: true, paymentMethod: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async refundPayment(paymentId: string, branchId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, branchId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Update payment status to refunded
    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'REFUNDED' },
    });

    // Update order status
    await this.prisma.order.update({
      where: { id: payment.orderId },
      data: { status: 'CANCELLED' },
    });

    return updatedPayment;
  }
}
