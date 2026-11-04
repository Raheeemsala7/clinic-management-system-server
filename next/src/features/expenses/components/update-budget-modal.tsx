'use client';

import React, { useState, useEffect } from 'react';
import { X, Settings2, Loader2, Coins } from 'lucide-react';
import { useUpdateExpenseBudgetMutation } from '../hooks/expenses.hook';

interface UpdateBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLimit: number;
}

export function UpdateBudgetModal({ isOpen, onClose, currentLimit }: UpdateBudgetModalProps) {
  const [limit, setLimit] = useState<number>(currentLimit);
  const updateMutation = useUpdateExpenseBudgetMutation();

  useEffect(() => {
    if (isOpen) {
      setLimit(currentLimit);
    }
  }, [isOpen, currentLimit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (limit === undefined || limit < 0) return;

    updateMutation.mutate(Number(limit), {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* رأس النافذة */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0040D8] flex items-center justify-center border border-blue-100 shadow-2xs">
              <Settings2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#0A164E]">
                تعديل سقف المصروفات الشهري
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تحديد المبلغ الأقصى المسموح للاستقبال بصرفه شهرياً بدون موافقة
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

        {/* محتوى النموذج */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              سقف المصروفات المسموح به شهرياً (ج.م) *
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="50"
                required
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#0040D8] focus:ring-2 focus:ring-[#0040D8]/10 text-sm font-bold font-sans transition-all"
                placeholder="1000"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                ج.م
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              * أي مصروف يقوم الاستقبال بتسجيله ضمن هذا السقف الشهري يُعتمد تلقائياً، وما يتجاوزه ينتظر موافقتك.
            </p>
          </div>

          {/* اختصارات سريعة */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 block mb-2">
              مبالغ شائعة:
            </span>
            <div className="flex gap-2">
              {[500, 1000, 1500, 2000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setLimit(val)}
                  className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    limit === val
                      ? 'border-[#0040D8] bg-blue-50 text-[#0040D8]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {val} ج.م
                </button>
              ))}
            </div>
          </div>

          {/* أزرار الإجراء */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 py-3 px-4 rounded-xl bg-[#0040D8] hover:bg-blue-700 active:scale-95 disabled:opacity-60 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <span>حفظ التعديل</span>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={updateMutation.isPending}
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

