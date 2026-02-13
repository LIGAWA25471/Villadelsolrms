import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { OrdersModule } from './modules/orders/orders.module';
import { MenuModule } from './modules/menu/menu.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { PrismaModule } from './prisma/prisma.module';

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
    PaymentsModule,
    GatewayModule,
  ],
})
export class AppModule {}
