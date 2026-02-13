import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
    ],
    credentials: true,
  },
})
@Injectable()
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger('RealtimeGateway');
  private userConnections: Map<string, Set<string>> = new Map();

  afterInit(server: Server) {
    this.logger.log('WebSocket server initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Clean up user connections
    for (const [userId, connections] of this.userConnections.entries()) {
      if (connections.has(client.id)) {
        connections.delete(client.id);
        if (connections.size === 0) {
          this.userConnections.delete(userId);
        }
      }
    }
  }

  @SubscribeMessage('subscribe-branch')
  subscribeBranch(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { branchId: string; userId: string },
  ) {
    const room = `branch-${data.branchId}`;
    client.join(room);

    if (!this.userConnections.has(data.userId)) {
      this.userConnections.set(data.userId, new Set());
    }
    this.userConnections.get(data.userId).add(client.id);

    this.logger.log(`Client subscribed to branch: ${data.branchId}`);
  }

  @SubscribeMessage('subscribe-kitchen')
  subscribeKitchen(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { branchId: string },
  ) {
    const room = `kitchen-${data.branchId}`;
    client.join(room);
    this.logger.log(`Client subscribed to kitchen: ${data.branchId}`);
  }

  // Broadcast new order to POS and KDS
  broadcastNewOrder(branchId: string, order: any) {
    this.server.to(`branch-${branchId}`).emit('order-created', order);
    this.server.to(`kitchen-${branchId}`).emit('order-created', order);
  }

  // Broadcast order status update
  broadcastOrderStatusUpdate(branchId: string, orderId: string, status: string) {
    this.server.to(`branch-${branchId}`).emit('order-status-updated', {
      orderId,
      status,
    });
    this.server.to(`kitchen-${branchId}`).emit('order-status-updated', {
      orderId,
      status,
    });
  }

  // Broadcast kitchen queue update
  broadcastKitchenQueueUpdate(branchId: string, queueItem: any) {
    this.server.to(`kitchen-${branchId}`).emit('queue-updated', queueItem);
    this.server.to(`branch-${branchId}`).emit('queue-status', queueItem);
  }

  // Broadcast payment update
  broadcastPaymentUpdate(branchId: string, orderId: string, paymentStatus: string) {
    this.server.to(`branch-${branchId}`).emit('payment-updated', {
      orderId,
      paymentStatus,
    });
  }
}
