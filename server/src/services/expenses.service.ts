import { Expense, ExpenseCategory } from '../models';
import { getTodayClinicDate } from '../utils/clinic-date';
import { parsePagination, buildPaginatedResult } from '../utils/pagination';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';
import { logAudit } from '../utils/audit';

export class ExpensesService {
  static async createExpense(dto: any, actor: { id: string; role: string }, ip = '') {
    const { categoryId, amount, description, spentAt } = dto;

    if (!categoryId || !amount || !description || !spentAt) {
      throw new BadRequestError('categoryId, amount, description, and spentAt are required');
    }

    const category = await ExpenseCategory.findOne({ _id: categoryId, isActive: true });
    if (!category) throw new NotFoundError('Expense category not found');

    const status = actor.role === 'ADMIN' ? 'APPROVED' : 'PENDING';
    const now = new Date();

    const expense = await Expense.create({
      categoryId,
      amount: Number(amount),
      description,
      spentAt: new Date(spentAt),
      recordedById: actor.id,
      status,
      ...(status === 'APPROVED' && {
        reviewedById: actor.id,
        reviewedAt: now,
      }),
    });

    await logAudit({
      userId: actor.id,
      action: 'CREATE',
      entityType: 'Expense',
      entityId: expense.id,
      after: { amount: expense.amount, status: expense.status },
      ip,
    });

    return {
      ...expense.toJSON(),
      category: { id: category.id, name: category.name },
    };
  }

  static async listExpenses(query: any, actor: { id: string; role: string }) {
    const { from, to, status, page: pageQuery, pageSize: pageSizeQuery } = query;
    const { skip, take, page, pageSize } = parsePagination({
      page: pageQuery,
      pageSize: pageSizeQuery,
    });

    let filter: any = {};

    if (actor.role === 'RECEPTION') {
      const today = getTodayClinicDate();
      const startOfDay = new Date(`${today}T00:00:00.000Z`);
      const endOfDay = new Date(`${today}T23:59:59.999Z`);
      filter = {
        recordedById: actor.id,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      };
    } else {
      if (status) filter.status = status;
      if (from || to) {
        filter.spentAt = {};
        if (from) filter.spentAt.$gte = new Date(from as string);
        if (to) filter.spentAt.$lte = new Date(to as string);
      }
    }

    const [expenses, total] = await Promise.all([
      Expense.find(filter)
        .sort({ spentAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(take),
      Expense.countDocuments(filter),
    ]);

    const populated = await Promise.all(
      expenses.map(async (e) => {
        const cat = await ExpenseCategory.findById(e.categoryId).select('id name');
        return {
          ...e.toJSON(),
          category: cat ? { id: cat.id, name: cat.name } : { name: 'Unknown' },
        };
      }),
    );

    return buildPaginatedResult(populated, total, page, pageSize);
  }

  static async approveExpense(id: string, actorId: string, ip = '') {
    const expense = await Expense.findById(id);
    if (!expense) throw new NotFoundError('Expense not found');

    if (expense.status !== 'PENDING') {
      throw new ConflictError('Only pending expenses can be approved', 'INVALID_STATUS');
    }

    expense.status = 'APPROVED';
    expense.reviewedById = actorId;
    expense.reviewedAt = new Date();
    await expense.save();

    await logAudit({
      userId: actorId,
      action: 'APPROVE',
      entityType: 'Expense',
      entityId: id,
      ip,
    });

    return expense.toJSON();
  }

  static async rejectExpense(id: string, reason?: string, actorId = '', ip = '') {
    const expense = await Expense.findById(id);
    if (!expense) throw new NotFoundError('Expense not found');

    if (expense.status !== 'PENDING') {
      throw new ConflictError('Only pending expenses can be rejected', 'INVALID_STATUS');
    }

    expense.status = 'REJECTED';
    expense.reviewedById = actorId;
    expense.reviewedAt = new Date();
    expense.rejectionReason = reason || null;
    await expense.save();

    await logAudit({
      userId: actorId,
      action: 'REJECT',
      entityType: 'Expense',
      entityId: id,
      after: { reason },
      ip,
    });

    return expense.toJSON();
  }

  static async getCategories() {
    const categories = await ExpenseCategory.find({ isActive: true }).sort({ name: 1 });
    return categories.map((c) => c.toJSON());
  }

  static async createCategory(name?: string) {
    if (!name) throw new BadRequestError('Category name is required');

    const clean = name.trim();
    const existing = await ExpenseCategory.findOne({ name: clean });
    if (existing) {
      throw new ConflictError('Category already exists', 'CATEGORY_EXISTS');
    }

    const category = await ExpenseCategory.create({ name: clean });
    return category.toJSON();
  }
}
