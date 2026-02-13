import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateMenuItemRequest } from '@villa-del-sol/shared';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async getMenuCategories(branchId: string) {
    return this.prisma.menuCategory.findMany({
      where: { branchId, isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async getMenuItems(branchId: string, categoryId?: string) {
    const where: any = { branchId, isActive: true };
    if (categoryId) {
      where.categoryId = categoryId;
    }

    return this.prisma.menuItem.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async getMenuItemById(itemId: string, branchId: string) {
    const item = await this.prisma.menuItem.findFirst({
      where: { id: itemId, branchId },
    });

    if (!item) {
      throw new NotFoundException('Menu item not found');
    }

    return item;
  }

  async createMenuItem(branchId: string, createDto: CreateMenuItemRequest) {
    const category = await this.prisma.menuCategory.findUnique({
      where: { id: createDto.categoryId },
    });

    if (!category || category.branchId !== branchId) {
      throw new BadRequestException('Category not found in this branch');
    }

    return this.prisma.menuItem.create({
      data: {
        ...createDto,
        branchId,
      },
    });
  }

  async getFullMenu(branchId: string) {
    const categories = await this.prisma.menuCategory.findMany({
      where: { branchId, isActive: true },
      include: {
        items: {
          where: { isActive: true },
        },
      },
      orderBy: { order: 'asc' },
    });

    return categories;
  }
}
