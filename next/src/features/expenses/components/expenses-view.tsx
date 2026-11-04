'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Receipt, Loader2, RotateCcw } from 'lucide-react';
import {
  useExpensesQuery,
  useExpenseBudgetQuery,
  useExpenseCategoriesQuery,
} from '../hooks/expenses.hook';
import { ExpenseFilterTab, ExpenseItem } from '../types/expenses';
import { ExpensesBudgetCard } from './expenses-budget-card';
import { ExpensesFiltersBar } from './expenses-filters-bar';
import { ExpenseCardItem } from './expense-card-item';
import { CreateExpenseModal } from './create-expense-modal';
import { RejectExpenseModal } from './reject-expense-modal';

interface ExpensesViewProps {
  isAdmin?: boolean;
}

export function ExpensesView({ isAdmin }: ExpensesViewProps) {
  const [currentTab, setCurrentTab] = useState<ExpenseFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedExpenseForReject, setSelectedExpenseForReject] = useState<ExpenseItem | null>(null);

  // استعلامات React Query
  const { data: budget, refetch: refetchBudget } = useExpenseBudgetQuery();
  const { data: categories = [] } = useExpenseCategoriesQuery();
  const {
    data: expensesResponse,
    isLoading,
    isFetching,
    error,
    refetch: refetchExpenses,
  } = useExpensesQuery();

  const rawExpenses = expensesResponse?.data || [];

  // حساب الإحصائيات والأعداد للتبويبات
  const counts = useMemo(() => {
    let approved = 0;
    let pending = 0;
    let rejected = 0;

    rawExpenses.forEach((e) => {
      if (e.status === 'APPROVED') approved++;
      else if (e.status === 'PENDING') pending++;
      else if (e.status === 'REJECTED') rejected++;
    });

    return {
      all: rawExpenses.length,
      approved,
      pending,
      rejected,
    };
  }, [rawExpenses]);

  // تطبيق فلاتر التبويب والبحث والتصنيف
  const filteredExpenses = useMemo(() => {
    return rawExpenses.filter((e) => {
      // فلتر التبويب
      if (currentTab === 'approved' && e.status !== 'APPROVED') return false;
      if (currentTab === 'pending' && e.status !== 'PENDING') return false;
      if (currentTab === 'rejected' && e.status !== 'REJECTED') return false;

      // فلتر التصنيف
      if (selectedCategory && e.categoryId !== selectedCategory) return false;

      // فلتر البحث بالوصف
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const desc = (e.description || '').toLowerCase();
        const cat = (e.category?.name || '').toLowerCase();
        const rec = (e.recordedBy?.name || '').toLowerCase();
        return desc.includes(q) || cat.includes(q) || rec.includes(q);
      }

      return true;
    });
  }, [rawExpenses, currentTab, selectedCategory, searchQuery]);

  const handleRefresh = () => {
    refetchBudget();
    refetchExpenses();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. رأس الصفحة وزر تسجيل المصروف */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-start">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A164E] tracking-tight">
            سجل وإدارة المصروفات
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            تسجيل مشتريات العيادة، متابعة السقف المالي الشهري، ومراجعة اعتمادات المصروفات
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isFetching}
            className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all cursor-pointer shadow-2xs active:scale-95"
            title="تحديث البيانات"
          >
            <RotateCcw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0040D8] hover:bg-blue-700 active:scale-95 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>تسجيل مصروف جديد</span>
          </button>
        </div>
      </div>

      {/* 2. بطاقة سقف وميزانية المصروفات الشهرية */}
      <ExpensesBudgetCard budget={budget} isAdmin={isAdmin} />

      {/* 3. شريط التبويبات والبحث */}
      <ExpensesFiltersBar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        counts={counts}
      />

      {/* 4. قائمة بطاقات المصروفات */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-xs">
          <Loader2 className="w-8 h-8 text-[#0040D8] animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-bold">جاري تحميل سجل المصروفات...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-3xl border border-rose-100 p-8 text-center text-rose-600 shadow-xs">
          <p className="text-sm font-bold">حدث خطأ أثناء جلب المصروفات، يرجى المحاولة مرة أخرى.</p>
          <button
            type="button"
            onClick={handleRefresh}
            className="mt-3 px-4 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 cursor-pointer"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0040D8] mx-auto mb-4 shadow-2xs">
            <Receipt className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h3 className="text-base font-black text-[#0A164E] mb-1">
            لا توجد أي مصروفات مطابقة للفلتر
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
            لم يتم العثور على أي مصروفات مسجلة بهذه الشروط. يمكنك تسجيل مصروف جديد في أي وقت.
          </p>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0040D8] text-white text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>تسجيل مصروف جديد</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExpenses.map((expense) => (
            <ExpenseCardItem
              key={expense.id}
              expense={expense}
              isAdmin={isAdmin}
              onReject={(exp) => setSelectedExpenseForReject(exp)}
            />
          ))}
        </div>
      )}

      {/* نوافذ الحوار (Modals) */}
      <CreateExpenseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        budget={budget}
      />

      <RejectExpenseModal
        isOpen={Boolean(selectedExpenseForReject)}
        onClose={() => setSelectedExpenseForReject(null)}
        expense={selectedExpenseForReject}
      />
    </div>
  );
}

