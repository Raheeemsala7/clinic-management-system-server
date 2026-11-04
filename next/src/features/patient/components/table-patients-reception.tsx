import React from 'react';
import Link from 'next/link';
import { Users, AlertTriangle, ChevronRight, ChevronLeft } from 'lucide-react';
import { getPatientsListApi, GetPatientsParams } from '../apis/patient.api';
import { TablePatientsRowActions } from './table-patients-row-actions';

interface TablePatientsReceptionProps {
  searchParams?: Promise<GetPatientsParams> | GetPatientsParams;
}

/**
 * دالة مساعدة لتنسيق التاريخ إلى DD/MM/YYYY
 */
function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * دالة استخراج أول حرف من اسم المريض للأيقونة الدائرية
 */
function getFirstLetter(name: string): string {
  if (!name) return 'م';
  const clean = name.trim();
  return clean.charAt(0);
}

/**
 * جدول عرض المرضى لشاشة الاستقبال (Server Component)
 */
export async function TablePatientsReception({ searchParams }: TablePatientsReceptionProps = {}) {
  const resolvedParams = searchParams ? await Promise.resolve(searchParams) : {};
  const page = Number(resolvedParams.page || 1);
  const pageSize = 6;

  const response = await getPatientsListApi({
    q: resolvedParams.q,
    page,
    pageSize,
    filter: resolvedParams.filter,
  });

  const patients = response.payload || [];
  const meta = response.meta || {
    page: 1,
    pageSize: 6,
    total: patients.length,
    totalPages: Math.ceil(patients.length / pageSize) || 1,
    hasNext: false,
    hasPrevious: false,
  };

  const total = meta.total || patients.length;
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  // في حالة عدم وجود مرضى
  if (patients.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-12 text-center">
        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0040D8] mb-4 shadow-2xs">
            <Users className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h3 className="text-lg font-black text-[#0A164E] mb-2">
            {resolvedParams.q || resolvedParams.filter
              ? 'لا توجد نتائج مطابقة لبحثك'
              : 'لا يوجد مرضى مسجلون حتى الآن'}
          </h3>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            {resolvedParams.q || resolvedParams.filter
              ? 'يرجى تجربة البحث بكلمة أخرى أو إلغاء الفلتر المحدد'
              : 'قم بالضغط على زر "مريض جديد" للبدء في فتح سجل طبي لمريض جديد في العيادة'}
          </p>
        </div>
      </div>
    );
  }

  // بناء أزرار الترقيم (Pagination)
  const totalPages = meta.totalPages || 1;
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const buildPageUrl = (targetPage: number) => {
    const qp = new URLSearchParams();
    if (resolvedParams.q) qp.set('q', resolvedParams.q);
    if (resolvedParams.filter && resolvedParams.filter !== 'all') qp.set('filter', resolvedParams.filter);
    qp.set('page', String(targetPage));
    return `?${qp.toString()}`;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden select-none">
      <div className="overflow-x-auto">
        <table className="w-full text-start border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold text-xs">
              <th className="py-4 px-6 text-start">المريض</th>
              <th className="py-4 px-6 text-start">التصنيف</th>
              <th className="py-4 px-6 text-center">آخر زيارة</th>
              <th className="py-4 px-6 text-center">الزيارات</th>
              <th className="py-4 px-6 text-end">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {patients.map((patient) => {
              const hasChronic =
                patient.chronicConditions && patient.chronicConditions.length > 0;
              const isMale = patient.gender === 'MALE';

              return (
                <tr
                  key={patient.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* 1. عمود المريض: الأيقونة الدائرية الكحلية + الاسم + العمر والهاتف */}
                  <td className="py-4 px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0A164E] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-2xs">
                        {getFirstLetter(patient.fullName)}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-black text-[#0A164E] text-sm group-hover:text-[#0040D8] transition-colors">
                          {patient.fullName}
                        </h4>
                        <div className="text-xs text-slate-400 font-sans flex items-center gap-1.5 dir-ltr justify-end">
                          <span>{patient.age ? `${patient.age} سنة` : ''}</span>
                          {patient.phone && <span>·</span>}
                          <span>{patient.phone || ''}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 2. عمود التصنيف: شارة النوع + شارة المرض المزمن */}
                  <td className="py-4 px-6 text-start">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* شارة النوع */}
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                          isMale
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-pink-50 text-pink-700'
                        }`}
                      >
                        {isMale ? 'ذكر' : 'أنثى'}
                      </span>

                      {/* شارة المرض المزمن */}
                      {hasChronic && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-[#FEFCE8] text-[#B45309] border border-[#FEF08A] text-xs font-bold flex items-center gap-1 shadow-2xs">
                          <AlertTriangle className="w-3 h-3 text-[#D97706]" />
                          <span>مرض مزمن</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 3. عمود تاريخ آخر زيارة */}
                  <td className="py-4 px-6 text-center text-xs text-slate-500 font-mono">
                    {formatDate(patient.lastVisitDate)}
                  </td>

                  {/* 4. عمود عدد الزيارات */}
                  <td className="py-4 px-6 text-center">
                    <span className="text-sm font-black text-[#0A164E] font-sans">
                      {patient.visitCount ?? 0}
                    </span>
                  </td>

                  {/* 5. عمود أزرار الإجراءات */}
                  <td className="py-4 px-6 text-end">
                    <TablePatientsRowActions patient={patient} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* شريط ترقيم الصفحات (Pagination) أسفل الجدول مطابقة للصورة */}
      <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-bold bg-white">
        {/* عدد السجلات */}
        <div className="text-start">
          عرض {startItem}–{endItem} من [{total}]
        </div>

        {/* أزرار الصفحات */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5 justify-center sm:justify-end">
            {pageNumbers.map((pNum) => {
              const isCurrent = pNum === page;
              return (
                <Link
                  key={pNum}
                  href={buildPageUrl(pNum)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                    isCurrent
                      ? 'bg-[#0040D8] text-white shadow-2xs font-black'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pNum}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

