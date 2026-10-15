import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { Role, ExpenseStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuditService } from 'src/audit/audit.service';
import { BusinessException } from 'src/common/filters/business-exception';
import { getTodayClinicDate } from 'src/common/utils/clinic-date.util';
import { parsePagination, buildPaginatedResult } from 'src/common/utils/pagination.util';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { RejectExpenseDto } from './dto/reject-expense.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Injectable()
export class ExpensesService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private configService: ConfigService,
  ) {}

  async create(dto: CreateExpenseDto, actor: JwtPayload, ip?: string) {
    const category = await this.prisma.expenseCategory.findUnique({ where: { id: dto.categoryId, isActive: true } });
    if (!category) throw new NotFoundException('Expense category not found');

    // Admin-created start as APPROVED; reception as PENDING
    const status = actor.role === Role.ADMIN ? ExpenseStatus.APPROVED : ExpenseStatus.PENDING;

    const expense = await this.prisma.expense.create({
      data: {
        categoryId: dto.categoryId,
        amount: new Decimal(dto.amount),
        description: dto.description,
        spentAt: new Date(dto.spentAt),
        recordedById: actor.sub,
        status,
        ...(status === ExpenseStatus.APPROVED && {
          reviewedById: actor.sub,
          reviewedAt: new Date(),
        }),
      },
    });

    await this.auditService.log({
      userId: actor.sub,
      action: 'CREATE',
      entityType: 'Expense',
      entityId: expense.id,
      after: { amount: dto.amount, status } as Record<string, unknown>,
      ip,
    });

    return expense;
  }

  async findAll(
    actor: JwtPayload,
    query: { from?: string; to?: string; status?: ExpenseStatus; page: number; pageSize: number },
  ) {
    const tz = this.configService.get<string>('clinic.timezone', 'Africa/Cairo');
    const { skip, take } = parsePagination({ page: query.page, pageSize: query.pageSize });

    if (actor.role === Role.RECEPTION) {
      // Reception sees only their own expenses created today
      const today = getTodayClinicDate(tz);
      const startOfDay = new Date(`${today}T00:00:00.000Z`);
      const endOfDay = new Date(`${today}T23:59:59.999Z`);
      const [data, total] = await Promise.all([
        this.prisma.expense.findMany({
          where: { recordedById: actor.sub, createdAt: { gte: startOfDay, lte: endOfDay } },
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.expense.count({
          where: { recordedById: actor.sub, createdAt: { gte: startOfDay, lte: endOfDay } },
        }),
      ]);
      return buildPaginatedResult(data, total, query.page, query.pageSize);
    }

    const where = {
      ...(query.from && { spentAt: { gte: new Date(query.from) } }),
      ...(query.to && { spentAt: { ...(query.from ? { gte: new Date(query.from) } : {}), lte: new Date(query.to) } }),
      ...(query.status && { status: query.status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.expense.findMany({ where, skip, take, orderBy: { spentAt: 'desc' } }),
      this.prisma.expense.count({ where }),
    ]);
    return buildPaginatedResult(data, total, query.page, query.pageSize);
  }

  async approve(id: string, actor: JwtPayload, ip?: string) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundException('Expense not found');
    if (expense.status !== ExpenseStatus.PENDING) {
      throw new BusinessException('INVALID_STATUS', 'Only pending expenses can be approved');
    }
    const updated = await this.prisma.expense.update({
      where: { id },
      data: { status: ExpenseStatus.APPROVED, reviewedById: actor.sub, reviewedAt: new Date() },
    });
    await this.auditService.log({
      userId: actor.sub, action: 'APPROVE', entityType: 'Expense', entityId: id, ip,
    });
    return updated;
  }

  async reject(id: string, dto: RejectExpenseDto, actor: JwtPayload, ip?: string) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundException('Expense not found');
    if (expense.status !== ExpenseStatus.PENDING) {
      throw new BusinessException('INVALID_STATUS', 'Only pending expenses can be rejected');
    }
    const updated = await this.prisma.expense.update({
      where: { id },
      data: {
        status: ExpenseStatus.REJECTED,
        reviewedById: actor.sub,
        reviewedAt: new Date(),
        rejectionReason: dto.reason,
      },
    });
    await this.auditService.log({
      userId: actor.sub, action: 'UPDATE', entityType: 'Expense', entityId: id,
      after: { status: 'REJECTED', reason: dto.reason } as Record<string, unknown>, ip,
    });
    return updated;
  }

  async getCategories() {
    return this.prisma.expenseCategory.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }

  async createCategory(dto: CreateCategoryDto) {
    const existing = await this.prisma.expenseCategory.findUnique({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException({ error: { code: 'CATEGORY_EXISTS', message: 'Category already exists' } });
    }
    return this.prisma.expenseCategory.create({ data: { name: dto.name } });
  }
}
