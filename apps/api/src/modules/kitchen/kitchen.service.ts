import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { UpdateKitchenQueueDto, KitchenStatus } from './dto/kitchen.dto';

@Injectable()
export class KitchenService {
  constructor(private prisma: PrismaService) {}

  async getKitchenQueue(branchId: string, status?: KitchenStatus) {
    const where: any = {
      order: {
        branchId,
      },
    };

    if (status) {
      where.status = status;
    }

    return this.prisma.kitchenQueue.findMany({
      where,
      include: { order: { include: { items: { include: { menuItem: true } } } } },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async getQueueItem(id: string, branchId: string) {
    const item = await this.prisma.kitchenQueue.findFirst({
      where: {
        id,
        order: { branchId },
      },
      include: { order: { include: { items: { include: { menuItem: true } } } } },
    });

    if (!item) {
      throw new NotFoundException('Kitchen queue item not found');
    }

    return item;
  }

  async updateQueueStatus(
    id: string,
    branchId: string,
    dto: UpdateKitchenQueueDto,
  ) {
    const item = await this.getQueueItem(id, branchId);

    const updateData: any = { status: dto.status };

    if (dto.status === 'PREPARING') {
      updateData.startedAt = new Date();
    } else if (dto.status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    if (dto.station) {
      updateData.station = dto.station;
    }

    const updated = await this.prisma.kitchenQueue.update({
      where: { id },
      data: updateData,
      include: { order: { include: { items: true } } },
    });

    // Update order status based on kitchen queue status
    if (dto.status === 'READY_FOR_PICKUP') {
      await this.prisma.order.update({
        where: { id: item.orderId },
        data: { status: 'READY' },
      });
    }

    return updated;
  }

  async setQueuePriority(id: string, branchId: string, priority: number) {
    const item = await this.getQueueItem(id, branchId);

    return this.prisma.kitchenQueue.update({
      where: { id },
      data: { priority },
    });
  }
}
