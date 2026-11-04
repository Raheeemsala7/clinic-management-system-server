'use client';

import React, { useState, useMemo } from 'react';
import { usePaymentsQuery } from '../hooks/payments.hook';
import { PaymentFilterTab, PaymentItem, PaymentsSummary } from '../types/payments';
import { PaymentsSummaryCards } from './payments-summary-cards';
import { PaymentsFiltersBar } from './payments-filters-bar';
import { PaymentCardItem } from './payment-card-item';
import { PayRemainingModal } from './pay-remaining-modal';
import { Loader2, Receipt, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

/**
 * دالة مساعدة للحصول على تاريخ اليوم بصيغة YYYY-MM-DD
 */
function getTodayIsoDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function PaymentsView() {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayIsoDate);
  const [currentTab, setCurrentTab] = useState<PaymentFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPaymentForPay, setSelectedPaymentForPay] = useState<PaymentItem | null>(null);

  // استعلام المدفوعات باستخدام React Query كاش حسب التاريخ المختار
  const {
    data: paymentsResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = usePaymentsQuery(selectedDate);

  const rawPayments = paymentsResponse?.data || [];
  const backendSummary = paymentsResponse?.meta?.summary;

  // 1. حساب الملخص الإحصائي إذا لم يأتِ من الباك إند
  const summary: PaymentsSummary = useMemo(() => {
    if (backendSummary) return backendSummary;

    const recorded = rawPayments.filter((p) => p.status === 'RECORDED');
    const totalCollected = recorded.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const totalDeposits = recorded
      .filter((p) => p.paymentType === 'DEPOSIT')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    // حساب المتبقي من المواعيد الفريدة
    const apptMap = new Map<string, number>();
    rawPayments.forEach((p) => {
      if (p.appointment?.id && !p.appointment.isExempt) {
        apptMap.set(p.appointment.id, Number(p.appointment.remainingAmount || 0));
      }
    });

    const totalRemaining = Array.from(apptMap.values()).reduce((sum, rem) => sum + rem, 0);
    const remainingCount = Array.from(apptMap.values()).filter((rem) => rem > 0).length;
    const depositCount = recorded.filter((p) => p.paymentType === 'DEPOSIT').length;
    const paidCount = recorded.filter(
      (p) => p.paymentType === 'FULL' || p.paymentType === 'REMAINING'
    ).length;

    return {
      totalCollected,
      totalDeposits,
      totalRemaining,
      counts: {
        all: rawPayments.length,
        paid: paidCount,
        deposit: depositCount,
        remaining: remainingCount,
      },
    };
  }, [backendSummary, rawPayments]);

  // 2. تطبيق فلتر البحث والتبويبات
  const filteredPayments = useMemo(() => {
    return rawPayments.filter((p) => {
      // فلتر التبويب (Tab)
      if (currentTab === 'paid') {
        const isPaid = p.paymentType === 'FULL' || p.paymentType === 'REMAINING';
        if (!isPaid) return false;
      } else if (currentTab === 'deposit') {
        if (p.paymentType !== 'DEPOSIT') return false;
      } else if (currentTab === 'remaining') {
        const remaining = p.appointment?.remainingAmount ?? 0;
        if (remaining <= 0 || p.appointment?.isExempt) return false;
      }

      // فلتر البحث (Search Query)
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const patientName = (p.patient?.fullName || '').toLowerCase();
        const patientPhone = (p.patient?.phone || '').toLowerCase();
        const doctorName = (p.doctor?.name || '').toLowerCase();
        const notes = (p.notes || '').toLowerCase();

        return (
          patientName.includes(q) ||
          patientPhone.includes(q) ||
          doctorName.includes(q) ||
          notes.includes(q)
        );
      }

      return true;
    });
  }, [rawPayments, currentTab, searchQuery]);

  // 3. تصدير كشف المدفوعات بصيغة CSV تدعم اللغة العربية
  const handleExportCsv = () => {
    if (filteredPayments.length === 0) {
      toast.warning('لا توجد مدفوعات لتصديرها في هذا اليوم');
      return;
    }

    const headers = [
      'رقم الإيصال',
      'المريض',
      'الهاتف',
      'المبلغ المسدد',
      'إجمالي الكشف',
      'المتبقي',
      'نوع الدفعة',
      'طريقة الدفع',
      'الطبيب',
      'وقت العملية',
      'المحصل',
      'الملاحظات',
    ];

    const rows = filteredPayments.map((p) => [
      p.id,
      p.patient?.fullName || 'غير مسجل',
      p.patient?.phone || '',
      p.amount,
      p.appointment?.totalAmount ?? p.amount,
      p.appointment?.remainingAmount ?? 0,
      p.paymentType === 'DEPOSIT'
        ? 'عربون'
        : p.paymentType === 'REMAINING'
        ? 'سداد متبقي'
        : 'سداد كامل',
      p.method === 'CARD' ? 'فيزا' : p.method === 'WALLET' ? 'محفظة' : 'نقدي',
      p.doctor?.name || '',
      new Date(p.createdAt).toLocaleTimeString('ar-EG'),
      p.receivedBy?.name || '',
      `"${(p.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `كشف_مدفوعات_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('تم تصدير كشف المدفوعات بنجاح');
  };

  // 4. طباعة إيصال دفع مفرد
  const handlePrintReceipt = (payment: PaymentItem) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('يرجى السماح بالنوافذ المنبثقة لطباعة الإيصال');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <title>إيصال سداد - ${payment.patient?.fullName || ''}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; color: #0A164E; }
            .header { text-align: center; border-bottom: 2px dashed #CBD5E1; padding-bottom: 16px; margin-bottom: 20px; }
            .clinic-name { font-size: 20px; font-weight: 900; }
            .title { font-size: 15px; color: #64748B; margin-top: 4px; }
            .details { line-height: 2; font-size: 14px; margin-bottom: 24px; }
            .amount-box { background: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 12px; text-align: center; margin-bottom: 24px; }
            .amount { font-size: 26px; font-weight: 900; color: #16A34A; }
            .footer { text-align: center; font-size: 12px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="clinic-name">عيادة د. إسلام عبدالله كريمة</div>
            <div class="title">إيصال سداد رسوم طبية</div>
          </div>
          <div class="details">
            <div><strong>اسم المريض:</strong> ${payment.patient?.fullName || 'غير مسجل'}</div>
            <div><strong>الهاتف:</strong> ${payment.patient?.phone || '-'}</div>
            <div><strong>الطبيب المعالج:</strong> ${payment.doctor?.name || 'د. إسلام'}</div>
            <div><strong>نوع الحجز:</strong> ${payment.appointment?.type || 'كشف'}</div>
            <div><strong>طريقة الدفع:</strong> ${payment.method}</div>
            <div><strong>تاريخ وتوقيت العملية:</strong> ${new Date(payment.createdAt).toLocaleString('ar-EG')}</div>
            <div><strong>المحصل:</strong> ${payment.receivedBy?.name || '-'}</div>
          </div>
          <div class="amount-box">
            <div style="font-size: 13px; color: #64748B;">المبلغ المسدد في هذا الإيصال</div>
            <div class="amount">${payment.amount} ج.م</div>
            ${
              (payment.appointment?.remainingAmount ?? 0) > 0
                ? `<div style="color: #D97706; font-size: 13px; margin-top: 6px;">المتبقي بعد هذا الإيصال: ${payment.appointment?.remainingAmount} ج.م</div>`
                : '<div style="color: #16A34A; font-size: 13px; margin-top: 6px;">تم سداد كامل الحساب ✓</div>'
            }
          </div>
          <div class="footer">
            شكراً لزيارتكم ونتمنى لكم دوام الصحة والعافية
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 1. رأس الصفحة: العنوان والوصف والتاريخ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0A164E] tracking-tight">
            سجل المدفوعات والتحصيل اليومي
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            تفاصيل المبالغ المحصلة، العربون، والمبالغ المتبقية لكل مريض ({selectedDate})
          </p>
        </div>

        {/* زر التحديث اليدوي إذا احتاج المستخدم */}
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          title="تحديث البيانات من الخادم"
          className="h-10 px-3.5 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-2xs"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-blue-600 ${isFetching ? 'animate-spin' : ''}`}
          />
          <span>تحديث</span>
        </button>
      </div>

      {/* 2. بطاقات الإحصائيات الثلاث في الأعلى (KPI Cards) */}
      <PaymentsSummaryCards summary={summary} dateLabel={selectedDate} />

      {/* 3. شريط الفلاتر والبحث والتحكم */}
      <PaymentsFiltersBar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        counts={summary.counts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onExport={handleExportCsv}
      />

      {/* 4. قائمة المدفوعات */}
      <div className="space-y-3.5">
        {isLoading ? (
          /* حالة التحميل */
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#1D4ED8] animate-spin" />
            <p className="text-sm font-bold text-[#0A164E]">جاري تحميل سجل المدفوعات...</p>
            <p className="text-xs text-slate-400">يرجى الانتظار لحظات</p>
          </div>
        ) : error ? (
          /* حالة الخطأ */
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-3">
            <AlertCircle className="w-8 h-8 text-rose-500" />
            <p className="text-sm font-bold text-rose-800">
              {(error as any)?.message || 'فشل جلب سجل المدفوعات'}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : filteredPayments.length === 0 ? (
          /* حالة عدم وجود مدفوعات */
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-14 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
              <Receipt className="w-7 h-7" />
            </div>
            <h4 className="text-base font-black text-[#0A164E]">
              {searchQuery ? 'لا توجد نتائج تطابق بحثك' : 'لا توجد مدفوعات مسجلة لهذا اليوم'}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm">
              {searchQuery
                ? 'جرب البحث بكلمة أخرى أو تغيير معايير الفلترة'
                : 'سيتم ظهور جميع المبالغ المحصلة وعربون الحجوزات تلقائياً هنا فور إتمامها'}
            </p>
          </div>
        ) : (
          /* عرض بطاقات المدفوعات */
          filteredPayments.map((payment) => (
            <PaymentCardItem
              key={payment.id}
              payment={payment}
              onPayRemaining={(p) => setSelectedPaymentForPay(p)}
              onPrintReceipt={(p) => handlePrintReceipt(p)}
            />
          ))
        )}
      </div>

      {/* 5. نافذة سداد المبلغ المتبقي (Pay Remaining Modal) */}
      {selectedPaymentForPay && selectedPaymentForPay.appointment && (
        <PayRemainingModal
          isOpen={Boolean(selectedPaymentForPay)}
          onClose={() => setSelectedPaymentForPay(null)}
          appointmentId={selectedPaymentForPay.appointment.id}
          patientName={selectedPaymentForPay.patient?.fullName || 'المريض'}
          totalAmount={selectedPaymentForPay.appointment.totalAmount}
          paidAmount={selectedPaymentForPay.appointment.paidAmount}
          remainingAmount={selectedPaymentForPay.appointment.remainingAmount}
        />
      )}
    </div>
  );
}

