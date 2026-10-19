import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { User, RefreshToken } from '../models';
import { config } from '../config/env';
import { hashToken, generateToken, verifyPassword } from '../utils/crypto';
import { UnauthorizedError, ForbiddenError, BadRequestError } from '../utils/errors';
import { logAudit, logAuditSystem } from '../utils/audit';

export class AuthService {
  private static async createTokenPair(
    userId: string,
    username: string,
    role: string,
    ip?: string,
    userAgent?: string,
    family?: string,
  ) {
    const accessToken = jwt.sign(
      { sub: userId, username, role },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessTtl },
    );

    const rawRefreshToken = generateToken(40);
    const tokenHash = hashToken(rawRefreshToken);
    const tokenFamily = family || uuidv4();
    const expiresAt = new Date(Date.now() + config.jwt.refreshTtl * 1000);

    await RefreshToken.create({
      userId,
      tokenHash,
      family: tokenFamily,
      expiresAt,
      userAgent: userAgent || null,
      ip: ip || null,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: config.jwt.accessTtl,
    };
  }

  static async login(username?: string, password?: string, ip = '', userAgent?: string) {
    if (!username || !password) {
      throw new BadRequestError('Username and password are required');
    }

    const cleanUsername = username.toLowerCase().trim();
    const user = await User.findOne({ username: cleanUsername });

    if (!user || user.deletedAt || !user.isActive) {
      logAuditSystem('LOGIN_FAILED', 'User', null, ip, {
        username: cleanUsername,
        reason: 'User not found or inactive',
      });
      throw new UnauthorizedError('Invalid credentials');
    }

    const passwordValid = await verifyPassword(user.passwordHash, password);
    if (!passwordValid) {
      await logAudit({
        userId: user.id,
        action: 'LOGIN_FAILED',
        entityType: 'User',
        entityId: user.id,
        ip,
        userAgent,
      });
      throw new UnauthorizedError('Invalid credentials');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const tokens = await this.createTokenPair(user.id, user.username, user.role, ip, userAgent);

    await logAudit({
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

  static async refresh(refreshToken?: string, ip = '', userAgent?: string) {
    if (!refreshToken) {
      throw new BadRequestError('refreshToken is required');
    }

    const tokenHash = hashToken(refreshToken);
    const storedToken = await RefreshToken.findOne({ tokenHash });

    if (!storedToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (storedToken.revokedAt) {
      await RefreshToken.updateMany(
        { family: storedToken.family, revokedAt: null },
        { revokedAt: new Date() },
      );
      throw new ForbiddenError('Refresh token reuse detected. Please log in again.');
    }

    if (storedToken.expiresAt < new Date()) {
      storedToken.revokedAt = new Date();
      await storedToken.save();
      throw new UnauthorizedError('Refresh token expired');
    }

    const user = await User.findById(storedToken.userId);
    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedError('User account is inactive');
    }

    storedToken.revokedAt = new Date();
    await storedToken.save();

    const tokens = await this.createTokenPair(
      user.id,
      user.username,
      user.role,
      ip,
      userAgent,
      storedToken.family,
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

  static async logout(userId: string) {
    await RefreshToken.updateMany(
      { userId, revokedAt: null },
      { revokedAt: new Date() },
    );
  }

  static async getMe(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new UnauthorizedError('User not found');
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  static getSocketTicket() {
    return {
      ticket: uuidv4(),
      expiresInSeconds: 30,
    };
  }
}

export const authService = AuthService;
