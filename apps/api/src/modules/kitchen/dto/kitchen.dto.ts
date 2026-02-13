import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum KitchenStatus {
  NEW = 'NEW',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class UpdateKitchenQueueDto {
  @IsEnum(KitchenStatus)
  status: KitchenStatus;

  @IsString()
  @IsOptional()
  station?: string;
}
