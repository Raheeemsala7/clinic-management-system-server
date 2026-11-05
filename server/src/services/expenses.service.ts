import { Expense, ExpenseCategory, Setting, User } from '../models';
import { getTodayClinicDate } from '../utils/clinic-date';
import { parsePagination, buildPaginatedResult } from '../utils/pagination';
import { NotFoundError, ConflictError, BadRequestError, ValidationError } from '../utils/errors';
import { logAudit } from '../utils/audit';

export class ExpensesService {
  /**
   * حساب ملخص الميزانية وسقف المصروفات الشهري للاستقبال
   */
  static async getMonthlyBudgetStatus(date?: Date | string) {
    let year: number;
    let month: number;

    if (date) {
      if (typeof date === 'string' && /^\d{4}-\d{2}$/.test(date)) {
        const [yStr, mStr] = date.split('-');
        year = parseInt(yStr, 10);
        month = parseInt(mStr, 10) - 1;
      } else {
        const targetDate = new Date(date);
        year = targetDate.getFullYear();
        month = targetDate.getMonth();
      }
    } else {
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
    }

    const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

    const settingDoc = await Setting.findById('receptionMonthlyExpenseLimit');
    const monthlyLimit = settingDoc ? Number(settingDoc.value) || 1000 : 1000;

    const [approvedAgg, pendingAgg] = await Promise.all([
      Expense.aggregate([
        {
          $match: {
            status: 'APPROVED',
            spentAt: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
      Expense.aggregate([
        {
          $match: {
            status: 'PENDING',
            spentAt: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totalApprovedSpent = approvedAgg[0]?.total || 0;
    const approvedCount = approvedAgg[0]?.count || 0;

    const totalPendingSpent = pendingAgg[0]?.total || 0;
    const pendingCount = pendingAgg[0]?.count || 0;

    const remainingBudget = Math.max(0, monthlyLimit - totalApprovedSpent);
    const usagePercentage =
      monthlyLimit > 0 ? Math.min(100, Math.round((totalApprovedSpent / monthlyLimit) * 100)) : 100;

    return {
      monthlyLimit,
      totalApprovedSpent,
      approvedCount,
      totalPendingSpent,
      pendingCount,
      remainingBudget,
      usagePercentage,
      isExceeded: totalApprovedSpent >= monthlyLimit,
      month: `${year}-${String(month + 1).padStart(2, '0')}`,
      startOfMonth,
      endOfMonth,
    };
  }

  /**
   * تعديل الحد الأقصى للمصروفات الشهرية التلقائية من جانب المدير
   */
  static async updateMonthlyBudgetLimit(limit: number, actorId: string, ip = '') {
    if (limit === undefined || limit === null || isNaN(limit) || Number(limit) < 0) {
      throw new BadRequestError('قيمة سقف المصروفات غير صالحة');
    }

    const numLimit = Number(limit);
    await Setting.findByIdAndUpdate(
      'receptionMonthlyExpenseLimit',
      { _id: 'receptionMonthlyExpenseLimit', value: String(numLimit) },
      { upsert: true, returnDocument: 'after' },
    );

    await logAudit({
      userId: actorId,
      action: 'UPDATE',
      entityType: 'Setting',
      entityId: 'receptionMonthlyExpenseLimit',
      after: { receptionMonthlyExpenseLimit: numLimit },
      ip,
    });

    return this.getMonthlyBudgetStatus();
  }

  static async createExpense(dto: any, actor: { id: string; role: string }, ip = '') {
    const { categoryId, amount, description, spentAt } = dto;

    if (!categoryId || !amount || !description || !spentAt) {
      const errors = [];
      if (!categoryId) errors.push({ path: 'categoryId', message: 'categoryId is required' });
      if (!amount) errors.push({ path: 'amount', message: 'amount is required' });
      if (!description) errors.push({ path: 'description', message: 'description is required' });
      if (!spentAt) errors.push({ path: 'spentAt', message: 'spentAt is required' });
      throw new ValidationError('Validation failed', errors);
    }

    const category = await ExpenseCategory.findOne({ _id: categoryId, isActive: true });
    if (!category) throw new NotFoundError('Expense category not found');

    const now = new Date();
    const expenseAmount = Number(amount);

    let status: 'APPROVED' | 'PENDING' = 'PENDING';
    let isAutoApproved = false;

    if (actor.role === 'ADMIN') {
      status = 'APPROVED';
    } else if (actor.role === 'RECEPTION') {
      const budget = await this.getMonthlyBudgetStatus(spentAt);
      if (budget.totalApprovedSpent + expenseAmount <= budget.monthlyLimit) {
        // تحت التكلفة المحددة شهرياً -> يعتمد تلقائياً دون انتظار موافقة الإدارة
        status = 'APPROVED';
        isAutoApproved = true;
      } else {
        // فوق التكلفة المحددة شهرياً -> ينتظر موافقة الإدارة
        status = 'PENDING';
      }
    }

    const expense = await Expense.create({
      categoryId,
      amount: expenseAmount,
      description,
      spentAt: new Date(spentAt),
      recordedById: actor.id,
      status,
      ...(status === 'APPROVED' && {
        reviewedById: actor.role === 'ADMIN' ? actor.id : undefined,
        reviewedAt: now,
      }),
    });

    await logAudit({
      userId: actor.id,
      action: 'CREATE',
      entityType: 'Expense',
      entityId: expense.id,
      after: { amount: expense.amount, status: expense.status, isAutoApproved },
      ip,
    });

    const populatedRecorder = await User.findById(actor.id).select('id name role');

    return {
      ...expense.toJSON(),
      category: { id: category.id, name: category.name },
      recordedBy: populatedRecorder
        ? { id: populatedRecorder.id, name: populatedRecorder.name, role: populatedRecorder.role }
        : null,
      isAutoApproved,
    };
  }

  static async listExpenses(query: any, actor: { id: string; role: string }) {
    const { from, to, status, page: pageQuery, pageSize: pageSizeQuery, categoryId, recordedById, month } = query;
    const { skip, take, page, pageSize } = parsePagination({
      page: pageQuery,
      pageSize: pageSizeQuery,
    });

    let filter: any = {};

    if (actor.role === 'RECEPTION') {
      filter.recordedById = actor.id;
    } else if (recordedById) {
      filter.recordedById = recordedById;
    }

    if (status && status !== 'all') filter.status = status;
    if (categoryId) filter.categoryId = categoryId;

    if (from || to) {
      filter.spentAt = {};
      if (from) filter.spentAt.$gte = new Date(from as string);
      if (to) filter.spentAt.$lte = new Date(to as string);
    } else if (month && typeof month === 'string' && /^\d{4}-\d{2}$/.test(month)) {
      const [yStr, mStr] = month.split('-');
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10);
      const startOfMonth = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
      const endOfMonth = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
      filter.spentAt = { $gte: startOfMonth, $lte: endOfMonth };
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
        const [cat, recorder, reviewer] = await Promise.all([
          ExpenseCategory.findById(e.categoryId).select('id name'),
          User.findById(e.recordedById).select('id name role username'),
          e.reviewedById ? User.findById(e.reviewedById).select('id name role username') : null,
        ]);
        return {
          ...e.toJSON(),
          category: cat ? { id: cat.id, name: cat.name } : { name: 'Unknown' },
          recordedBy: recorder ? { id: recorder.id, name: recorder.name, role: recorder.role } : null,
          reviewedBy: reviewer ? { id: reviewer.id, name: reviewer.name, role: reviewer.role } : null,
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
