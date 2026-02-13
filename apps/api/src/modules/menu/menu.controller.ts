import { Controller, Get, Post, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MenuService } from './menu.service';
import { CreateMenuItemRequest } from '@villa-del-sol/shared';

@Controller('menu')
export class MenuController {
  constructor(private menuService: MenuService) {}

  @Get('categories')
  async getCategories(@Query('branchId') branchId: string = 'branch-main') {
    return this.menuService.getMenuCategories(branchId);
  }

  @Get('items')
  async getItems(
    @Query('branchId') branchId: string = 'branch-main',
    @Query('categoryId') categoryId?: string,
  ) {
    return this.menuService.getMenuItems(branchId, categoryId);
  }

  @Get('full')
  async getFullMenu(@Query('branchId') branchId: string = 'branch-main') {
    return this.menuService.getFullMenu(branchId);
  }

  @Get('items/:id')
  async getMenuItem(@Param('id') itemId: string, @Query('branchId') branchId: string = 'branch-main') {
    return this.menuService.getMenuItemById(itemId, branchId);
  }

  @Post('items')
  @UseGuards(AuthGuard('jwt'))
  async createMenuItem(
    @Body() createDto: CreateMenuItemRequest,
    @Query('branchId') branchId: string = 'branch-main',
  ) {
    return this.menuService.createMenuItem(branchId, createDto);
  }
}
