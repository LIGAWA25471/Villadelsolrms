import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreatePaymentDto, ProcessPaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async createPayment(branchId: string, staffId: string, dto: CreatePaymentDto) {
    // Verify order exists
    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, branchId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify payment method exists
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { id: dto.paymentMethodId, branchId },
    });

    if (!paymentMethod) {
      throw new BadRequestException('Payment method not found');
    }

    if (dto.amount > Number(order.totalAmount)) {
      throw new BadRequestException(
        'Payment amount exceeds order total',
      );
    }

    const payment = await this.prisma.payment.create({
      data: {
        orderId: dto.orderId,
        amount: dto.amount,
        paymentMethodId: dto.paymentMethodId,
        staffId,
        branchId,
        status: 'PENDING',
        notes: dto.notes,
      },
    });

    return payment;
  }

  async getPayments(branchId: string, orderId?: string) {
    const where: any = { branchId };
    if (orderId) {
      where.orderId = orderId;
    }

    return this.prisma.payment.findMany({
      where,
      include: { order: true, paymentMethod: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPayment(id: string, branchId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, branchId },
      include: { order: true, paymentMethod: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async processPayment(
    id: string,
    branchId: string,
    dto: ProcessPaymentDto,
  ) {
    const payment = await this.getPayment(id, branchId);

    const updated = await this.prisma.payment.update({
      where: { id },
      data: {
        status: dto.status,
        transactionId: dto.transactionId || payment.transactionId,
        notes: dto.notes || payment.notes,
      },
    });

    // Mark order as paid if payment completed
    if (dto.status === 'COMPLETED') {
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { paidAt: new Date() },
      });
    }

    return updated;
  }

  async getPaymentMethods(branchId: string) {
    return this.prisma.paymentMethod.findMany({
      where: { branchId, isActive: true },
    });
  }

  async createPaymentMethod(branchId: string, name: string) {
    return this.prisma.paymentMethod.create({
      data: {
        name,
        branchId,
        isActive: true,
      },
    });
  }
}
