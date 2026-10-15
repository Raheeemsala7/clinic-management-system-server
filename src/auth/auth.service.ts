import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuditService } from 'src/audit/audit.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { hashToken, generateToken } from 'src/common/utils/crypto.util';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditService: AuditService,
  ) {}

  async login(dto: LoginDto, ip: string, userAgent?: string): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (!user || user.deletedAt || !user.isActive) {
      // Still record failed login (use a system userId placeholder)
      await this.auditService.logSystem('LOGIN_FAILED', 'User', null, ip, {
        username: dto.username,
        reason: 'User not found or inactive',
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordValid) {
      await this.auditService.log({
        userId: user.id,
        action: 'LOGIN_FAILED',
        entityType: 'User',
        entityId: user.id,
        ip,
        userAgent,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update lastLoginAt
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.username, user.role as string, ip, userAgent);

    await this.auditService.log({
      userId: user.id,
      action: 'LOGIN',
      entityType: 'User',
      entityId: user.id,
      ip,
      userAgent,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    };
  }

  async refresh(refreshToken: string, ip: string, userAgent?: string): Promise<AuthResponseDto> {
    const tokenHash = hashToken(refreshToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    // Token not found at all — could be random string
    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Token was already revoked → family attack, revoke all tokens in this family
    if (storedToken.revokedAt) {
      await this.prisma.refreshToken.updateMany({
        where: { family: storedToken.family, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new ForbiddenException('Refresh token reuse detected. Please log in again.');
    }

    // Expired
    if (storedToken.expiresAt < new Date()) {
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = storedToken.user;
    if (!user.isActive || user.deletedAt) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Revoke the used token (rotation)
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.generateTokens(
      user.id,
      user.username,
      user.role as string,
      ip,
      userAgent,
      storedToken.family, // keep same family
    );

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    };
  }

  async logout(userId: string): Promise<void> {
    // Revoke all active refresh tokens for this user
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  private async generateTokens(
    userId: string,
    username: string,
    role: string,
    ip: string,
    userAgent?: string,
    family?: string,
  ): Promise<Omit<AuthResponseDto, 'user'>> {
    const payload: JwtPayload = { sub: userId, username, role: role as never };
    const accessTtl = this.configService.get<number>('jwt.accessTtl') ?? 900;
    const refreshTtl = this.configService.get<number>('jwt.refreshTtl') ?? 604800;

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: accessTtl,
    });

    // Generate opaque refresh token
    const rawRefreshToken = generateToken(40);
    const tokenHash = hashToken(rawRefreshToken);
    const tokenFamily = family ?? uuidv4();
    const expiresAt = new Date(Date.now() + refreshTtl * 1000);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        family: tokenFamily,
        expiresAt,
        userAgent: userAgent ?? null,
        ip,
      },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: accessTtl,
    };
  }
}
