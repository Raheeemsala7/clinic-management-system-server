import argon2 from 'argon2';
import { User } from '../models';
import { parsePagination, buildPaginatedResult } from '../utils/pagination';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';
import { logAudit } from '../utils/audit';

export class UsersService {
  static async getDoctors() {
    return User.find(
      { role: 'DOCTOR', isActive: true, deletedAt: null },
      { id: 1, name: 1, username: 1 },
    ).sort({ name: 1 });
  }

  static async listUsers(pageQuery?: string, pageSizeQuery?: string) {
    const { skip, take, page, pageSize } = parsePagination({
      page: pageQuery,
      pageSize: pageSizeQuery,
    });

    const filter = { deletedAt: null };
    const [users, total] = await Promise.all([
      User.find(filter, { passwordHash: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(take),
      User.countDocuments(filter),
    ]);

    return buildPaginatedResult(users, total, page, pageSize);
  }

  static async createUser(
    dto: { name: string; username: string; password?: string; role: string },
    actorId: string,
    ip = '',
  ) {
    const { name, username, password, role } = dto;
    if (!name || !username || !password || !role) {
      throw new BadRequestError('Name, username, password, and role are required');
    }

    const cleanUsername = username.toLowerCase().trim();
    const existing = await User.findOne({ username: cleanUsername });
    if (existing) {
      throw new ConflictError('Username already in use');
    }

    const passwordHash = await argon2.hash(password);
    const user = await User.create({
      name,
      username: cleanUsername,
      passwordHash,
      role,
      isActive: true,
    });

    await logAudit({
      userId: actorId,
      action: 'CREATE',
      entityType: 'User',
      entityId: user.id,
      after: { name: user.name, username: user.username, role: user.role },
      ip,
    });

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      isActive: user.isActive,
    };
  }

  static async updateUser(
    id: string,
    dto: { name?: string; username?: string; role?: string; isActive?: boolean },
    actorId: string,
    ip = '',
  ) {
    const user = await User.findById(id);
    if (!user || user.deletedAt) {
      throw new NotFoundError('User not found');
    }

    const before = { name: user.name, username: user.username, role: user.role, isActive: user.isActive };

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.role !== undefined) user.role = dto.role as any;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    if (dto.username !== undefined) {
      const clean = dto.username.toLowerCase().trim();
      if (clean !== user.username) {
        const existing = await User.findOne({ username: clean, _id: { $ne: id } });
        if (existing) throw new ConflictError('Username already in use');
        user.username = clean;
      }
    }

    await user.save();

    await logAudit({
      userId: actorId,
      action: 'UPDATE',
      entityType: 'User',
      entityId: user.id,
      before,
      after: { name: user.name, username: user.username, role: user.role, isActive: user.isActive },
      ip,
    });

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      isActive: user.isActive,
    };
  }

  static async deactivateUser(id: string, actorId: string, ip = '') {
    const user = await User.findById(id);
    if (!user || user.deletedAt) {
      throw new NotFoundError('User not found');
    }

    user.isActive = false;
    await user.save();

    await logAudit({
      userId: actorId,
      action: 'DEACTIVATE',
      entityType: 'User',
      entityId: user.id,
      ip,
    });

    return { id: user.id, isActive: false };
  }

  static async resetPassword(id: string, newPassword?: string, actorId = '', ip = '') {
    if (!newPassword) {
      throw new BadRequestError('newPassword is required');
    }

    const user = await User.findById(id);
    if (!user || user.deletedAt) {
      throw new NotFoundError('User not found');
    }

    user.passwordHash = await argon2.hash(newPassword);
    await user.save();

    await logAudit({
      userId: actorId,
      action: 'RESET_PASSWORD',
      entityType: 'User',
      entityId: user.id,
      ip,
    });

    return { success: true, message: 'Password reset successfully' };
  }
}
