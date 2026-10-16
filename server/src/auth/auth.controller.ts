import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Headers,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { TicketStoreService } from 'src/realtime/ticket-store.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ReqIp } from 'src/common/decorators/req-ip.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Role } from '@prisma/client';

class SocketTicketResponseDto {
  @ApiProperty({ description: 'Single-use ticket for Socket.IO handshake' })
  ticket!: string;

  @ApiProperty({ description: 'Seconds until the ticket expires', example: 30 })
  expiresInSeconds!: number;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly ticketStore: TicketStoreService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @ApiOperation({ summary: 'Login with username and password (public)' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() dto: LoginDto,
    @ReqIp() ip: string,
    @Headers('user-agent') userAgent?: string,
  ): Promise<AuthResponseDto> {
    return this.authService.login(dto, ip, userAgent);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token (public)' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async refresh(
    @Body() dto: RefreshDto,
    @ReqIp() ip: string,
    @Headers('user-agent') userAgent?: string,
  ): Promise<AuthResponseDto> {
    return this.authService.refresh(dto.refreshToken, ip, userAgent);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTION)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke all refresh tokens [A,D,R]' })
  async logout(@CurrentUser() user: JwtPayload): Promise<void> {
    return this.authService.logout(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTION)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile [A,D,R]' })
  async me(@CurrentUser() user: JwtPayload) {
    return this.authService.getMe(user.sub);
  }

  /**
   * Issue a single-use 30-second ticket for Socket.IO browser clients.
   *
   * The browser never holds a JWT. The Next.js server action calls this endpoint
   * with the bearer token (server-side httpOnly cookie), then passes the ticket
   * to the browser. The browser connects Socket.IO with auth: { ticket }.
   * The ticket is consumed on first connection and cannot be reused.
   */
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTION)
  @Post('socket-ticket')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Issue a single-use Socket.IO ticket [A,D,R]',
    description:
      'Returns a 30-second single-use ticket. Pass it in the Socket.IO handshake as `auth: { ticket }`. ' +
      'Request a new ticket on every reconnect.',
  })
  @ApiResponse({ status: 200, type: SocketTicketResponseDto })
  issueSocketTicket(@CurrentUser() user: JwtPayload): SocketTicketResponseDto {
    return this.ticketStore.issue(user.sub, user.username, user.role);
  }
}
