'use client';

import React, { useState } from 'react';
import {
  UserCog,
  UserPlus,
  Search,
  Shield,
  Stethoscope,
  KeyRound,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

const INITIAL_USERS: SystemUser[] = [
  { id: '1', name: 'المدير العام (Admin)', email: 'admin@clinic.com', phone: '01018566478', role: 'ADMIN', status: 'ACTIVE', createdAt: '2026-01-01' },
  { id: '2', name: 'د. إسلام عبدالله كريمة', email: 'doctor@clinic.com', phone: '01018566479', role: 'DOCTOR', status: 'ACTIVE', createdAt: '2026-01-01' },
  { id: '3', name: 'موظف الاستقبال (Reception Staff)', email: 'reception@clinic.com', phone: '01018566480', role: 'RECEPTIONIST', status: 'ACTIVE', createdAt: '2026-02-15' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<SystemUser[]>(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm);
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
          : u
      )
    );
    toast.success('تم تحديث حالة المستخدم بنجاح');
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-black text-xs border border-purple-200">
            <Shield className="w-3.5 h-3.5" />
            <span>مدير النظام (Admin)</span>
          </span>
        );
      case 'DOCTOR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-[#0040D8] font-black text-xs border border-blue-200">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>طبيب (Doctor)</span>
          </span>
        );
      case 'RECEPTIONIST':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-black text-xs border border-amber-200">
            <KeyRound className="w-3.5 h-3.5" />
            <span>موظف استقبال (Reception)</span>
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6" dir="rtl">
      {/* 1. الترويسة الرئيسية */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-blue-50 text-[#0040D8]">
              <UserCog className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0A164E] tracking-tight">
              إدارة مستخدمي النظام والصلاحيات
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-400">
            التحكم بحسابات الأطباء وموظفي الاستقبال والمديرين وضبط صلاحيات الوصول
          </p>
        </div>

        <button
          type="button"
          onClick={() => toast.info('يمكنك إضافة حساب جديد عبر لوحة إدارة قاعدة البيانات أو التواصل مع الدعم الفني')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0040D8] hover:bg-blue-700 text-white font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة مستخدم جديد</span>
        </button>
      </div>

      {/* 2. شريط البحث والفلترة */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم، البريد الإلكتروني، أو رقم الهاتف..."
            className="w-full h-10 pr-10 pl-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs font-bold focus:outline-none focus:border-[#0040D8]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['ALL', 'DOCTOR', 'RECEPTIONIST', 'ADMIN'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setFilterRole(r)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterRole === r
                  ? 'bg-[#0040D8] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r === 'ALL' ? 'الكل' : r === 'DOCTOR' ? 'الأطباء' : r === 'RECEPTIONIST' ? 'الاستقبال' : 'المدير'}
            </button>
          ))}
        </div>
      </div>

      {/* 3. جدول المستخدمين */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-black">
              <tr>
                <th className="p-4">اسم المستخدم</th>
                <th className="p-4">الدور الوظيفي</th>
                <th className="p-4">بيانات الاتصال</th>
                <th className="p-4">تاريخ الإنشاء</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4">
                    <span className="font-black text-sm text-[#0A164E] block">{u.name}</span>
                    <span className="text-[11px] text-slate-600">{u.email}</span>
                  </td>
                  <td className="p-4">{getRoleBadge(u.role)}</td>
                  <td className="p-4 font-mono text-slate-700">{u.phone}</td>
                  <td className="p-4 text-slate-600 font-mono">{u.createdAt}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      <span>{u.status === 'ACTIVE' ? 'نشط' : 'معطل'}</span>
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      type="button"
                      onClick={() => toggleUserStatus(u.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        u.status === 'ACTIVE'
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {u.status === 'ACTIVE' ? 'إيقاف الحساب' : 'تفعيل الحساب'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

