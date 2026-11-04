'use client';

import React from 'react';
import { PatientVisitItem } from '../types/patient';

interface PatientVisitsTableProps {
  visits: PatientVisitItem[];
}

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

export function PatientVisitsTable({ visits }: PatientVisitsTableProps) {
  if (!visits || visits.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs bg-slate-50/50 rounded-2xl">
        لا توجد زيارات أو كشوفات مسجلة سابقة لهذا المريض
      </div>
    );
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'FOLLOW_UP':
        return (
          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">
            إعادة
          </span>
        );
      case 'LAB_TESTS_IMAGING':
        return (
          <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 text-xs font-bold">
            تحليل وأشعة
          </span>
        );
      case 'CONSULTATION':
        return (
          <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold">
            استشارة
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold">
            كشف
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WAITING':
        return (
          <span className="px-2.5 py-0.5 rounded-lg bg-[#FEF08A] text-[#854D0E] text-xs font-bold shadow-2xs">
            في الانتظار
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold">
            في الكشف
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">
            تم الكشف
          </span>
        );
      case 'BOOKED':
        return (
          <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold">
            مؤكد
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="overflow-x-auto select-none">
      <table className="w-full text-start border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold">
            <th className="py-3 px-4 text-start">التاريخ</th>
            <th className="py-3 px-4 text-center">النوع</th>
            <th className="py-3 px-4 text-center">الطبيب</th>
            <th className="py-3 px-4 text-center">الحالة</th>
            <th className="py-3 px-4 text-end">الرسوم</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-bold">
          {visits.map((v) => (
            <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
              {/* التاريخ */}
              <td className="py-3 px-4 text-start font-mono text-slate-600">
                {formatDate(v.clinicDate || v.createdAt)}
              </td>

              {/* النوع */}
              <td className="py-3 px-4 text-center">
                {getTypeBadge(v.type)}
              </td>

              {/* الطبيب */}
              <td className="py-3 px-4 text-center text-slate-700">
                {v.doctorName || 'د. إسلام'}
              </td>

              {/* الحالة */}
              <td className="py-3 px-4 text-center">
                {getStatusBadge(v.status)}
              </td>

              {/* الرسوم */}
              <td className="py-3 px-4 text-end">
                {v.paymentStatus === 'EXEMPT' ? (
                  <span className="text-emerald-600 font-black">معفي</span>
                ) : (
                  <span className="text-[#0A164E] font-sans font-black">
                    {v.totalAmount} ج.م
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

