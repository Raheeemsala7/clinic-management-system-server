'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ClosingPreview } from '../types/closing';
import { useCloseDayMutation } from '../hooks/closing.hook';
import { Lock, CheckCircle2, Loader2 } from 'lucide-react';

interface ClosingFormCardProps {
  preview?: ClosingPreview;
}

export function ClosingFormCard({ preview }: ClosingFormCardProps) {
  const t = useTranslations('Closing');
  const expectedCash = Number(preview?.expectedCash ?? 0);
  const isClosed = Boolean(preview?.isClosed);
  const closingRecord = preview?.closing;

  const [actualCashStr, setActualCashStr] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // تهيئة القيمة الفعلية لتطابق المتوقع تلقائياً
  useEffect(() => {
    if (preview && actualCashStr === '') {
      if (isClosed && closingRecord) {
        setActualCashStr(String(closingRecord.actualCash));
        setNotes(closingRecord.notes || '');
      } else {
        setActualCashStr(String(expectedCash));
      }
    }
  }, [preview, expectedCash, isClosed, closingRecord, actualCashStr]);

  const closeMutation = useCloseDayMutation();

  const actualCash = Number(actualCashStr) || 0;
  const diff = actualCash - expectedCash;

  const formatMoney = (val: number) => {
    return Number(Math.abs(val) || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isClosed || closeMutation.isPending) return;

    closeMutation.mutate({
      actualCash,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-black text-[#0A164E] mb-6">{t('formTitle')}</h3>

        {/* حالة الصندوق إذا كان مغلقاً بالفعل */}
        {isClosed && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-start gap-2.5 shadow-2xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="block text-sm font-black mb-1">
                {t('alreadyClosed')}
              </span>
              <p className="font-normal opacity-90">
                {t('closedAt', {
                  time: closingRecord?.closedAt
                    ? new Date(closingRecord.closedAt).toLocaleTimeString('ar-EG')
                    : '',
                  name: closingRecord?.closedBy?.name || '',
                })}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. النقد الفعلي في الصندوق */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              {t('actualCash')}
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                required
                disabled={isClosed}
                value={actualCashStr}
                onChange={(e) => setActualCashStr(e.target.value)}
                placeholder="0.00"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0040D8] text-base font-bold font-sans transition-all disabled:bg-slate-50 disabled:text-slate-500"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                {t('currency')}
              </span>
            </div>
          </div>

          {/* 2. مؤشر الفرق عن المتوقع (مطابق / عجز / زيادة) */}
          <div>
            {diff === 0 ? (
              <div className="w-full py-3 px-4 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-between shadow-2xs">
                <span>{t('diffLabel')}</span>
                <span className="font-sans font-black flex items-center gap-1.5">
                  {t('diffMatched')}
                </span>
              </div>
            ) : diff > 0 ? (
              <div className="w-full py-3 px-4 rounded-xl bg-blue-50/90 border border-blue-200 text-blue-800 text-xs font-bold flex items-center justify-between shadow-2xs">
                <span>{t('diffLabel')}</span>
                <span className="font-sans font-black flex items-center gap-1.5">
                  {t('diffSurplus', { amount: formatMoney(diff) })}
                </span>
              </div>
            ) : (
              <div className="w-full py-3 px-4 rounded-xl bg-rose-50/90 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-between shadow-2xs">
                <span>{t('diffLabel')}</span>
                <span className="font-sans font-black flex items-center gap-1.5">
                  {t('diffDeficit', { amount: formatMoney(diff) })}
                </span>
              </div>
            )}
          </div>

          {/* 3. ملاحظات إضافية */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              {t('notes')}
            </label>
            <textarea
              rows={3}
              disabled={isClosed}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('notesPlaceholder')}
              className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0040D8] text-xs font-medium resize-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          {/* 4. زر إغلاق الصندوق */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isClosed || closeMutation.isPending}
              className="w-full py-3.5 px-6 rounded-xl bg-[#0A164E] hover:bg-[#070F2B] active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {closeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('submitting')}</span>
                </>
              ) : isClosed ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('submitBtn')}</span>
                </>
              ) : (
                <>
                  <span>{t('submitBtn')}</span>
                  <Lock className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
