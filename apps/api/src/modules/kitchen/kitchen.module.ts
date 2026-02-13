import { Module } from '@nestjs/common';
import { KitchenService } from './kitchen.service';
import { KitchenController } from './kitchen.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [KitchenService],
  controllers: [KitchenController],
  exports: [KitchenService],
})
export class KitchenModule {}
