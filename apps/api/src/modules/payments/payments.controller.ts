import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';
import { CreatePaymentRequest } from '@villa-del-sol/shared';

@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post()
  async processPayment(
    @Body() createPaymentDto: CreatePaymentRequest,
    @Request() req,
  ) {
    const branchId = 'branch-main'; // Placeholder - should come from JWT
    return this.paymentsService.processPayment(branchId, req.user.userId, createPaymentDto);
  }

  @Get('order/:orderId')
  async getPaymentsByOrder(@Param('orderId') orderId: string, @Request() req) {
    const branchId = 'branch-main'; // Placeholder
    return this.paymentsService.getPaymentsByOrder(orderId, branchId);
  }

  @Get()
  async getPaymentsByBranch(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Request() req?: any,
  ) {
    const branchId = 'branch-main'; // Placeholder
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.paymentsService.getPaymentsByBranch(branchId, start, end);
  }

  @Post(':id/refund')
  async refundPayment(@Param('id') paymentId: string, @Request() req) {
    const branchId = 'branch-main'; // Placeholder
    return this.paymentsService.refundPayment(paymentId, branchId);
  }
}
