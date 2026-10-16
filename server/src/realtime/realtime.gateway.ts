import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { RealtimeService } from './realtime.service';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/',
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private realtimeService: RealtimeService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket gateway initialized');
    // Register ourselves with the service so it can emit
    this.realtimeService.setGateway(this);
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.headers?.authorization as string)?.replace('Bearer ', '');

      if (!token) {
        client.disconnect(true);
        return;
      }

      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('jwt.accessSecret'),
      });

      // Store user info on socket
      (client as Socket & { user: JwtPayload }).user = payload;

      // Join role room
      await client.join(`role:${payload.role}`);
      await client.join(`user:${payload.sub}`);

      this.logger.log(`Client connected: ${payload.username} (${payload.role})`);
    } catch {
      this.logger.warn('Unauthorized WebSocket connection attempt');
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const user = (client as Socket & { user?: JwtPayload }).user;
    if (user) {
      this.logger.log(`Client disconnected: ${user.username}`);
    }
  }

  /** Emit to all sockets in a role room */
  emitToRole(role: string, event: string, payload: unknown) {
    this.server.to(`role:${role}`).emit(event, payload);
  }

  /** Emit to a specific user */
  emitToUser(userId: string, event: string, payload: unknown) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }
}
