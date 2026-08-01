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
import { Logger, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { RedisService } from '../../redis/redis.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/realtime',
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized successfully.');
  }

  async handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.query.token as string;
      if (!authHeader) {
        this.logger.warn(
          `Connection rejected: Missing token from client ${client.id}`,
        );
        client.disconnect();
        return;
      }

      const secret = this.configService.get<string>('JWT_SECRET_KEY');
      const payload = jwt.verify(authHeader, secret) as any;

      // Attach user details to socket instance
      client.data.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        branchId: payload.branchId,
      };

      const userId = payload.sub;

      // Join individual room
      await client.join(`user:${userId}`);

      // Join role room
      if (payload.role) {
        await client.join(`role:${payload.role.toUpperCase()}`);
      }

      // Join branch room
      if (payload.branchId) {
        await client.join(`branch:${payload.branchId}`);
      }

      // Presence tracking: Set user as online in Redis
      await this.redis.set(`presence:${userId}`, 'online', 3600); // Expires in 1 hour
      this.server.emit('presence_change', { userId, status: 'online' });

      this.logger.log(
        `Client connected: User ${userId} on socket ${client.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Connection authentication failed for client ${client.id}: ${error.message}`,
      );
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user) {
      const userId = user.id;
      // Presence tracking: Mark user as offline
      await this.redis.set(`presence:${userId}`, 'offline', 600); // Keep offline log cache for 10 min
      this.server.emit('presence_change', { userId, status: 'offline' });
      this.logger.log(
        `Client disconnected: User ${userId} on socket ${client.id}`,
      );
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { targetUserId: string; isTyping: boolean },
  ) {
    const user = client.data.user;
    if (user && payload.targetUserId) {
      this.server.to(`user:${payload.targetUserId}`).emit('typing_state', {
        senderId: user.id,
        isTyping: payload.isTyping,
      });
    }
  }

  @SubscribeMessage('heartbeat')
  async handleHeartbeat(@ConnectedSocket() client: Socket) {
    const user = client.data.user;
    if (user) {
      await this.redis.set(`presence:${user.id}`, 'online', 3600); // Refresh TTL
      client.emit('heartbeat_ack', { timestamp: new Date().toISOString() });
    }
  }
}
