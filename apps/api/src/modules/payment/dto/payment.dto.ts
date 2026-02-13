import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export class CreatePaymentDto {
  @IsString()
  orderId: string;

  @IsNumber()
  amount: number;

  @IsString()
  paymentMethodId: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class ProcessPaymentDto {
  @IsString()
  transactionId?: string;

  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
