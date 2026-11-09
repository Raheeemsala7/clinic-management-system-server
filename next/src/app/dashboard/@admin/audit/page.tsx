'use client';

import React, { useState } from 'react';
import {
  History,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Lock,
  User,
} from 'lucide-react';

interface AuditLogItem {
  id: string;
  action: string;
  actor: string;
  actorRole: string;
  details: string;
  timestamp: string;
  status: 'SUCCESS' | 'WARNING' | 'INFO';
}

const INITIAL_LOGS: AuditLogItem[] = [
  { id: '1', action: 'إنهاء كشف طبي وكتابة روشتة', actor: 'د. إسلام عبدالله كريمة', actorRole: 'DOCTOR', details: 'فحص مريض (محمد السيد) واعتماد روشتة 3 أصناف علاجية', timestamp: 'منذ 10 دقائق', status: 'SUCCESS' },
  { id: '2', action: 'تحصيل باقي مبلغ الكشف', actor: 'موظف الاستقبال', actorRole: 'RECEPTIONIST', details: 'تحصيل 270 ج.م نقداً إيصال رقم #8493', timestamp: 'منذ 25 دقيقة', status: 'SUCCESS' },
  { id: '3', action: 'تسجيل حجز كشف جديد', actor: 'موظف الاستقبال', actorRole: 'RECEPTIONIST', details: 'حجز كشف أنف وأذن وحنجرة للمريض (أحمد حسن) مع سداد عربون 50 ج.م', timestamp: 'منذ 40 دقيقة', status: 'SUCCESS' },
  { id: '4', action: 'اعتماد مصروف عيادة', actor: 'المدير العام (Admin)', actorRole: 'ADMIN', details: 'اعتماد شراء مستلزمات طبية وشاش بقيمة 350 ج.م', timestamp: 'منذ ساعتين', status: 'SUCCESS' },
  { id: '5', action: 'الإغلاق اليومي للصندوق', actor: 'موظف الاستقبال', actorRole: 'RECEPTIONIST', details: 'إغلاق الخزينة ومطابقة النقد الفعلي (1,500 ج.م) بنجاح', timestamp: 'أمس 09:30 م', status: 'SUCCESS' },
  { id: '6', action: 'محاولة تسجيل دخول', actor: 'admin@clinic.com', actorRole: 'ADMIN', details: 'تسجيل دخول ناجح إلى لوحة تحكم المدير', timestamp: 'أمس 08:00 ص', status: 'INFO' },
];

export default function AdminAuditPage() {
  const [logs] = useState<AuditLogItem[]>(INITIAL_LOGS);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(
    (l) =>
      l.action.includes(searchTerm) ||
      l.actor.includes(searchTerm) ||
      l.details.includes(searchTerm)
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6" dir="rtl">
      {/* 1. الترويسة الرئيسية */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-blue-50 text-[#0040D8]">
              <History className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0A164E] tracking-tight">
              سجل العمليات والأنشطة (Audit Log)
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-400">
            تتبع دقيق لكافة الحركات والعمليات المالية والطبية المنفذة في النظام
          </p>
        </div>
      </div>

      {/* 2. شريط البحث */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث في سجل العمليات (العملية، المستخدم، التفاصيل)..."
            className="w-full h-10 pr-10 pl-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs font-bold focus:outline-none focus:border-[#0040D8]"
          />
        </div>
      </div>

      {/* 3. قائمة الأنشطة التتابعية */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-black text-[#0A164E] pb-3 border-b border-slate-100">
          أحدث الحركات والعمليات المسجلة
        </h2>

        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-blue-50/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-[#0A164E]">{log.action}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#0040D8]">
                    {log.actorRole}
                  </span>
                </div>
                <p className="text-slate-600 font-bold">{log.details}</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>المستخدم: <strong className="text-slate-700">{log.actor}</strong></span>
                  <span>•</span>
                  <span>{log.timestamp}</span>
                </div>
              </div>

              <div className="shrink-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تمت بنجاح</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

