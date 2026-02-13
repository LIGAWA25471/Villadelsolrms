import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { CreateOrderRequest, UpdateOrderStatusRequest, OrderStatus } from '@villa-del-sol/shared';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderRequest, @Request() req) {
    // Note: In production, branch context would come from JWT claims
    const branchId = 'branch-main'; // Placeholder
    return this.ordersService.createOrder(branchId, req.user.userId, createOrderDto);
  }

  @Get()
  async getOrders(@Query('status') status?: OrderStatus, @Request() req) {
    const branchId = 'branch-main'; // Placeholder
    return this.ordersService.getOrders(branchId, status);
  }

  @Get(':id')
  async getOrder(@Param('id') orderId: string, @Request() req) {
    const branchId = 'branch-main'; // Placeholder
    return this.ordersService.getOrderById(orderId, branchId);
  }

  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body() updateDto: UpdateOrderStatusRequest,
    @Request() req,
  ) {
    const branchId = 'branch-main'; // Placeholder
    return this.ordersService.updateOrderStatus(orderId, branchId, updateDto);
  }

  @Delete(':id')
  async cancelOrder(@Param('id') orderId: string, @Request() req) {
    const branchId = 'branch-main'; // Placeholder
    return this.ordersService.cancelOrder(orderId, branchId);
  }
}
