'use client';

import React, { useState } from 'react';
import { X, Plus, Receipt, Loader2, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useCreateExpenseMutation, useExpenseCategoriesQuery } from '../hooks/expenses.hook';
import { ExpenseBudgetStatus } from '../types/expenses';

interface CreateExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget?: ExpenseBudgetStatus;
}

export function CreateExpenseModal({ isOpen, onClose, budget }: CreateExpenseModalProps) {
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState('');
  const [spentAt, setSpentAt] = useState(() => new Date().toISOString().split('T')[0]);

  const { data: categories = [], isLoading: isLoadingCategories } = useExpenseCategoriesQuery();
  const createMutation = useCreateExpenseMutation();

  if (!isOpen) return null;

  const numAmount = Number(amount) || 0;
  const remainingBudget = Number(budget?.remainingBudget ?? 1000);
  const willBeAutoApproved = numAmount > 0 && numAmount <= remainingBudget;
  const willNeedApproval = numAmount > 0 && numAmount > remainingBudget;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !numAmount || !description.trim() || !spentAt) return;

    createMutation.mutate(
      {
        categoryId,
        amount: numAmount,
        description: description.trim(),
        spentAt: new Date(spentAt).toISOString(),
      },
      {
        onSuccess: () => {
          onClose();
          setAmount('');
          setDescription('');
          setCategoryId('');
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* رأس النافذة */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0040D8] flex items-center justify-center border border-blue-100 shadow-2xs">
              <Receipt className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#0A164E]">
                تسجيل مصروف جديد
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                إدخال بنود المصروفات ومشتريات العيادة
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* نموذج الإدخال */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 1. بند المصروف (التصنيف) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              بند / تصنيف المصروف *
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0040D8] text-sm font-medium bg-white transition-all cursor-pointer"
            >
              <option value="">اختر التصنيف المناسب...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. المبلغ وتاريخ الصرف */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                المبلغ (ج.م) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0040D8] text-sm font-bold font-sans transition-all"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  ج.م
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                تاريخ الصرف *
              </label>
              <input
                type="date"
                required
                value={spentAt}
                onChange={(e) => setSpentAt(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0040D8] text-sm font-medium transition-all"
              />
            </div>
          </div>

          {/* إشعار ذكي فوري عن حالة الاعتماد التلقائي */}
          {numAmount > 0 && (
            <div
              className={`p-3.5 rounded-2xl border text-xs font-medium transition-all ${
                willBeAutoApproved
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50/70 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {willBeAutoApproved ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block mb-0.5">
                    {willBeAutoApproved ? 'اعتماد تلقائي فوري' : 'يتطلب موافقة الإدارة'}
                  </span>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {willBeAutoApproved
                      ? `هذا المبلغ ضمن السقف الشهري المتبقي المتاح (${remainingBudget.toLocaleString()} ج.م)، وسيتم اعتماده تلقائياً بدون انتظار موافقة الإدارة.`
                      : `هذا المبلغ يتجاوز السقف الشهري المتبقي المتاح (${remainingBudget.toLocaleString()} ج.م)، لذلك سيتم حفظه وإرساله للإدارة للموافقة عليه أولاً.`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. البيان / الوصف */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              بيان المصروف وتفاصيل الشراء *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب تفاصيل ما تم شراؤه أو سبب الصرف..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0040D8] text-sm font-medium transition-all resize-none"
            />
          </div>

          {/* أزرار الإجراء */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 py-3 px-4 rounded-xl bg-[#0040D8] hover:bg-blue-700 active:scale-95 disabled:opacity-60 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري التسجيل...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>حفظ وتسجيل المصروف</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="py-3 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm transition-all cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

