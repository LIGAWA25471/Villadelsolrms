import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentService } from './payment.service';
import { CreatePaymentDto, ProcessPaymentDto } from './dto/payment.dto';

@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post()
  async createPayment(@Body() dto: CreatePaymentDto, @Request() req) {
    return this.paymentService.createPayment(
      req.user.branchId,
      req.user.id,
      dto,
    );
  }

  @Get()
  async getPayments(@Query('orderId') orderId?: string, @Request() req) {
    return this.paymentService.getPayments(req.user.branchId, orderId);
  }

  @Get(':id')
  async getPayment(@Param('id') id: string, @Request() req) {
    return this.paymentService.getPayment(id, req.user.branchId);
  }

  @Patch(':id')
  async processPayment(
    @Param('id') id: string,
    @Body() dto: ProcessPaymentDto,
    @Request() req,
  ) {
    return this.paymentService.processPayment(id, req.user.branchId, dto);
  }

  @Get('methods/list')
  async getPaymentMethods(@Request() req) {
    return this.paymentService.getPaymentMethods(req.user.branchId);
  }

  @Post('methods')
  async createPaymentMethod(
    @Body() body: { name: string },
    @Request() req,
  ) {
    return this.paymentService.createPaymentMethod(req.user.branchId, body.name);
  }
}
