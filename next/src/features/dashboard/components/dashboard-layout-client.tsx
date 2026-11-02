'use client';

import React, { useState } from 'react';
import { DashboardSidebar } from './dashboard-sidebar';
import { DashboardHeader } from './dashboard-header';
import { UserRole } from '../types';
import { X } from 'lucide-react';
import { cn } from 'cn';

interface DashboardLayoutClientProps {
  role: UserRole;
  children: React.ReactNode;
}

/**
 * غلاف لوحة التحكم الموحد - يجمع الشريط الجانبي الثابت والهيدر والمحتوى المتغير حسب الدور
 */
export const DashboardLayoutClient = ({
  role,
  children,
}: DashboardLayoutClientProps) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex text-slate-900 selection:bg-[#F5B800] selection:text-slate-950">
      {/* 1. الشريط الجانبي الثابت على الشاشات الكبيرة */}
      <div className="hidden lg:block shrink-0">
        <DashboardSidebar role={role} />
      </div>

      {/* 2. القائمة الجانبية المنبثقة للشاشات الصغيرة (Mobile Drawer) */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* خلفية معتمة */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* محتوى الشريط الجانبي المنزلق */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#091336] z-10 animate-in slide-in-from-right duration-200">
            <div className="absolute top-4 left-4 z-20">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-xl text-white/80 hover:text-white bg-white/10"
                aria-label="إغلاق القائمة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <DashboardSidebar
              role={role}
              className="h-full border-none w-full shadow-none"
              onItemClick={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 3. منطقة المحتوى الرئيسية مع الهيدر الثابت */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <DashboardHeader
          role={role}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-7 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

