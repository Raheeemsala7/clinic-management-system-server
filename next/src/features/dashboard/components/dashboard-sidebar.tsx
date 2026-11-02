'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from 'cn';
import { UserRole } from '../types';
import { ROLE_CONFIG } from '../constants';

interface DashboardSidebarProps {
  role: UserRole;
  className?: string;
  onItemClick?: () => void;
}

/**
 * شريط التنقل الجانبي للوحة التحكم - مطابق للتصميم في جميع الأدوار
 */
export const DashboardSidebar = ({
  role,
  className,
  onItemClick,
}: DashboardSidebarProps) => {
  const pathname = usePathname();
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.ADMIN;

  return (
    <aside
      className={cn(
        'w-64 sm:w-72 bg-[#091336] text-white flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none shadow-xl border-l border-white/5',
        className
      )}
    >
      {/* الجزء العلوي: الشعار وقائمة الروابط */}
      <div className="flex flex-col flex-1 overflow-y-auto py-6 px-4">
        {/* رأس الشريط: شعار عيادة الأنف والأذن والحنجرة */}
        <div className="flex items-center justify-between pb-6 mb-4 border-b border-white/10 px-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 group"
            onClick={onItemClick}
          >
            <span className="font-black text-lg text-white tracking-tight">
              نظام إدارة العيادة
            </span>
            <div className="grid grid-cols-2 gap-1 w-6 h-6 shrink-0" aria-hidden="true">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#1D4ED8]" />
              <span className="w-2.5 h-2.5 rounded-xs bg-white" />
              <span className="w-2.5 h-2.5 rounded-xs bg-[#081544]" />
              <span className="w-2.5 h-2.5 rounded-xs bg-[#F5B800]" />
            </div>
          </Link>
        </div>

        {/* قائمة الروابط بحسب الدور */}
        <nav className="space-y-1.5 flex-1" aria-label="Dashboard Navigation">
          {config.navItems.map((item) => {
            // نعتبر أول رابط نشط في الصفحة الرئيسية للوحة
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard' || pathname === '/dashboard/'
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150',
                  isActive
                    ? 'bg-[#F5B800] text-slate-950 shadow-md font-black'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 font-medium'
                )}
              >
                <span>{item.title}</span>

                {/* أيقونة المربع الصغير المطابقة للتصميم في الصورة */}
                <span
                  className={cn(
                    'w-4 h-4 rounded-xs border-2 flex items-center justify-center shrink-0 transition-colors',
                    isActive
                      ? 'border-slate-950 bg-slate-950'
                      : 'border-slate-400 group-hover:border-slate-200'
                  )}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* أسفل الشريط: رقم الإصدار ونوع اللوحة */}
      <div className="py-4 px-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-semibold bg-[#070F2B]">
        <span>v1.0</span>
        <span>{config.roleLabel}</span>
      </div>
    </aside>
  );
};

