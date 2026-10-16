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
import { TicketStoreService } from './ticket-store.service';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

interface AuthedSocket extends Socket {
  user?: JwtPayload;
}

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
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly realtimeService: RealtimeService,
    private readonly ticketStore: TicketStoreService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket gateway initialized');
    this.realtimeService.setGateway(this);
  }

  async handleConnection(client: AuthedSocket) {
    try {
      const auth = client.handshake.auth as Record<string, string | undefined>;

      // ── Path 1: one-time ticket (browser clients — no token in the browser) ──
      if (auth?.ticket) {
        const payload = this.ticketStore.consume(auth.ticket);
        if (!payload) {
          this.logger.warn('Rejected WebSocket: invalid or expired ticket');
          client.disconnect(true);
          return;
        }
        client.user = {
          sub: payload.userId,
          username: payload.username,
          role: payload.role,
        };
        await client.join(`role:${payload.role}`);
        await client.join(`user:${payload.userId}`);
        this.logger.log(`WS connected via ticket: ${payload.username} (${payload.role})`);
        return;
      }

      // ── Path 2: bearer JWT (server-to-server or admin tooling) ──────────────
      const token =
        (auth?.token as string | undefined) ||
        (client.handshake.headers?.authorization as string | undefined)
          ?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn('Rejected WebSocket: no auth credentials');
        client.disconnect(true);
        return;
      }

      const jwtPayload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('jwt.accessSecret'),
      });

      client.user = jwtPayload;
      await client.join(`role:${jwtPayload.role}`);
      await client.join(`user:${jwtPayload.sub}`);
      this.logger.log(`WS connected via JWT: ${jwtPayload.username} (${jwtPayload.role})`);
    } catch {
      this.logger.warn('Rejected WebSocket: auth error');
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthedSocket) {
    if (client.user) {
      this.logger.log(`WS disconnected: ${client.user.username}`);
    }
  }

  /** Emit an event to all sockets in a role room */
  emitToRole(role: string, event: string, payload: unknown) {
    this.server.to(`role:${role}`).emit(event, payload);
  }

  /** Emit an event to a specific user's sockets */
  emitToUser(userId: string, event: string, payload: unknown) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }
}
