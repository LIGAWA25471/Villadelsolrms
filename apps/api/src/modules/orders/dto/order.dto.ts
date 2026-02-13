import { IsString, IsNumber, IsOptional, IsDecimal } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  tableNumber?: number;

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  items: Array<{
    menuItemId: string;
    quantity: number;
    specialRequests?: string;
  }>;
}

export class UpdateOrderStatusDto {
  @IsString()
  status: string;
}

export class UpdateOrderItemDto {
  @IsNumber()
  quantity: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
