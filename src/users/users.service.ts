import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuditService } from 'src/audit/audit.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { parsePagination, buildPaginatedResult } from 'src/common/utils/pagination.util';

const USER_SELECT = {
  id: true,
  name: true,
  username: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(dto: CreateUserDto, actorId: string, ip?: string) {
    const existing = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (existing) {
      throw new ConflictException({
        error: { code: 'USERNAME_TAKEN', message: 'Username is already taken' },
      });
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        username: dto.username,
        passwordHash,
        role: dto.role,
      },
      select: USER_SELECT,
    });

    await this.auditService.log({
      userId: actorId,
      action: 'CREATE',
      entityType: 'User',
      entityId: user.id,
      after: { ...user } as Record<string, unknown>,
      ip,
    });

    return user;
  }

  async findAll(page: number, pageSize: number) {
    const { skip, take } = parsePagination({ page, pageSize });
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { deletedAt: null },
        select: USER_SELECT,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: { deletedAt: null } }),
    ]);
    return buildPaginatedResult(data, total, page, pageSize);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });
    if (!user || user === null) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto, actorId: string, ip?: string) {
    const user = await this.findOne(id);

    if (dto.username && dto.username !== user.username) {
      const conflict = await this.prisma.user.findUnique({
        where: { username: dto.username },
      });
      if (conflict) throw new ConflictException({ error: { code: 'USERNAME_TAKEN', message: 'Username is already taken' } });
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: dto,
      select: USER_SELECT,
    });

    await this.auditService.log({
      userId: actorId,
      action: 'UPDATE',
      entityType: 'User',
      entityId: id,
      before: user as Record<string, unknown>,
      after: updated as Record<string, unknown>,
      ip,
    });

    return updated;
  }

  async deactivate(id: string, actorId: string, ip?: string) {
    const user = await this.findOne(id);
    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: USER_SELECT,
    });
    await this.auditService.log({
      userId: actorId,
      action: 'UPDATE',
      entityType: 'User',
      entityId: id,
      before: { isActive: user.isActive } as Record<string, unknown>,
      after: { isActive: false } as Record<string, unknown>,
      ip,
    });
    return updated;
  }

  async resetPassword(id: string, newPassword: string, actorId: string, ip?: string) {
    await this.findOne(id); // ensure exists
    const passwordHash = await argon2.hash(newPassword);
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
    // Revoke all refresh tokens after password reset
    await this.prisma.refreshToken.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await this.auditService.log({
      userId: actorId,
      action: 'UPDATE',
      entityType: 'User',
      entityId: id,
      after: { passwordReset: true } as Record<string, unknown>,
      ip,
    });
    return { message: 'Password reset successfully' };
  }
}
