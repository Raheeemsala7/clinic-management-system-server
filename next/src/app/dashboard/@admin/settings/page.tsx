'use client';

import React, { useState } from 'react';
import {
  Settings,
  Building2,
  DollarSign,
  Printer,
  Shield,
  Save,
  CheckCircle2,
  Bell,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [clinicName, setClinicName] = useState('عيادة الأنف والأذن والحنجرة - د. إسلام عبدالله كريمة');
  const [phone, setPhone] = useState('01018566478');
  const [address, setAddress] = useState('جمهورية مصر العربية');
  const [checkupPrice, setCheckupPrice] = useState(300);
  const [consultationPrice, setConsultationPrice] = useState(100);
  const [expenseAutoApproveLimit, setExpenseAutoApproveLimit] = useState(1000);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('تم حفظ إعدادات العيادة بنجاح');
    }, 600);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6" dir="rtl">
      {/* 1. الترويسة الرئيسية */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-blue-50 text-[#0040D8]">
              <Settings className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0A164E] tracking-tight">
              إعدادات العيادة والنظام العامة
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-400">
            تخصيص بيانات المنشأة، التسعير، حدود المصروفات التلقائية، وإعدادات الطباعة
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#0040D8] hover:bg-blue-700 text-white font-black text-xs transition-all shadow-md active:scale-95 disabled:opacity-60 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. بيانات العيادة الأساسية */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-[#0040D8]" />
            <h2 className="text-base font-black text-[#0A164E]">بيانات المنشأة والترويسة</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-600 block">اسم العيادة الرسمي (يظهر في الإيصالات والروشتة):</label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-2xl border border-slate-200 font-bold focus:outline-none focus:border-[#0040D8]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-600 block">رقم هاتف العيادة:</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-10 px-3.5 rounded-2xl border border-slate-200 font-mono font-bold focus:outline-none focus:border-[#0040D8]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-600 block">عنوان العيادة:</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full h-10 px-3.5 rounded-2xl border border-slate-200 font-bold focus:outline-none focus:border-[#0040D8]"
              />
            </div>
          </div>
        </div>

        {/* 3. الإعدادات المالية والتسعير */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-black text-[#0A164E]">التسعير والمصروفات</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-600 block">سعر الكشف الافتراضي (ج.م):</label>
              <input
                type="number"
                value={checkupPrice}
                onChange={(e) => setCheckupPrice(Number(e.target.value))}
                className="w-full h-10 px-3.5 rounded-2xl border border-slate-200 font-black text-sm text-[#0040D8] focus:outline-none focus:border-[#0040D8]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-600 block">سعر الاستشارة / المتابعة (ج.م):</label>
              <input
                type="number"
                value={consultationPrice}
                onChange={(e) => setConsultationPrice(Number(e.target.value))}
                className="w-full h-10 px-3.5 rounded-2xl border border-slate-200 font-black text-sm text-[#0040D8] focus:outline-none focus:border-[#0040D8]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-600 block">حد المصروف المعتمد تلقائياً للاستقبال شهرياً (ج.م):</label>
              <input
                type="number"
                value={expenseAutoApproveLimit}
                onChange={(e) => setExpenseAutoApproveLimit(Number(e.target.value))}
                className="w-full h-10 px-3.5 rounded-2xl border border-slate-200 font-black text-sm text-emerald-600 focus:outline-none focus:border-[#0040D8]"
              />
              <span className="text-[11px] text-slate-400 font-bold block pt-0.5">
                أي مصروف يسجله الاستقبال تحت هذا المبلغ يُعتمد تلقائياً دون انتظار موافقة المدير
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

