import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { OrdersModule } from './modules/orders/orders.module';
import { MenuModule } from './modules/menu/menu.module';
import { PaymentModule } from './modules/payment/payment.module';
import { KitchenModule } from './modules/kitchen/kitchen.module';
import { PrismaModule } from './prisma/prisma.module';
import { RealtimeGateway } from './gateways/realtime.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    OrdersModule,
    MenuModule,
    PaymentModule,
    KitchenModule,
  ],
  providers: [RealtimeGateway],
})
export class AppModule {}
