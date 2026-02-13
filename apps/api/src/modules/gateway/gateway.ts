import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { PrismaService } from '@/prisma/prisma.service';
import { SocketEvent, Order, KitchenQueueItem } from '@villa-del-sol/shared';

@WebSocketGateway({
  namespace: '/socket',
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004'],
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private prisma: PrismaService) {}

  handleConnection(@ConnectedSocket() client: Socket) {
    console.log(`[Socket] Client connected: ${client.id}`);
    client.emit('connection', { message: 'Connected to WebSocket' });
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`[Socket] Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-branch')
  handleJoinBranch(@MessageBody() data: { branchId: string }, @ConnectedSocket() client: Socket) {
    const room = `branch-${data.branchId}`;
    client.join(room);
    console.log(`[Socket] Client ${client.id} joined room ${room}`);
    client.emit('joined-branch', { branchId: data.branchId });
  }

  @SubscribeMessage('leave-branch')
  handleLeaveBranch(@MessageBody() data: { branchId: string }, @ConnectedSocket() client: Socket) {
    const room = `branch-${data.branchId}`;
    client.leave(room);
    console.log(`[Socket] Client ${client.id} left room ${room}`);
  }

  @SubscribeMessage('ping')
  handlePing() {
    return { event: 'pong' };
  }

  // These methods would be called from the API endpoints when actions occur
  emitOrderCreated(branchId: string, order: any) {
    this.broadcast(`branch-${branchId}`, SocketEvent.ORDER_CREATED, order);
  }

  emitOrderStatusUpdated(branchId: string, order: any) {
    this.broadcast(`branch-${branchId}`, SocketEvent.ORDER_UPDATED, order);
  }

  emitKitchenOrderAdded(branchId: string, kitchenItem: any) {
    this.broadcast(`branch-${branchId}`, SocketEvent.KITCHEN_ORDER_ADDED, kitchenItem);
  }

  emitPaymentCompleted(branchId: string, payment: any) {
    this.broadcast(`branch-${branchId}`, SocketEvent.PAYMENT_COMPLETED, payment);
  }

  private broadcast(room: string, event: string, data: any) {
    // In a real implementation, this would use Socket.io server instance
    console.log(`[Socket] Broadcasting to ${room}:`, event, data);
  }
}
