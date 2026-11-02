'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/shared/components/ui/sidebar';
import { UserRole } from '../types';
import { ROLE_CONFIG } from '../constants';

interface DashboardSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role: UserRole;
  onItemClick?: () => void;
}

/**
 * شريط التنقل الجانبي للوحة التحكم مبني على shadcn Sidebar الرسمي
 * مخصص بألوان وهوية العيادة، يتضمن أيقونات الروابط، ويميز التبويب النشط بلون brand-yellow
 */
export function DashboardSidebar({
  role,
  className,
  onItemClick,
  ...props
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const side = dir === 'rtl' ? 'right' : 'left';

  const config = ROLE_CONFIG[role] || ROLE_CONFIG.ADMIN;
  const { isMobile, setOpenMobile } = useSidebar();

  const handleItemClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
    onItemClick?.();
  };

  return (
    <Sidebar
      side={side}
      dir={dir}
      collapsible="icon"
      className={cn('border-none bg-[#091336] text-white select-none shadow-xl', className)}
      {...props}
    >
      {/* 1. رأس الشريط الجانبي: الشعار واسم العيادة */}
      <SidebarHeader className="border-b border-white/10 px-4 py-5 group-data-[collapsible=icon]:p-2 bg-[#091336]">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/dashboard" onClick={handleItemClick} />}
              className="hover:bg-white/5 active:bg-white/10 text-white hover:text-white px-2 group-data-[collapsible=icon]:justify-center"
            >
              <div className="flex items-center justify-between w-full group-data-[collapsible=icon]:justify-center">
                <span className="font-black text-base sm:text-lg text-white tracking-tight group-data-[collapsible=icon]:hidden">
                  نظام إدارة العيادة
                </span>
                {/* شعار العيادة المربّع المميّز بالألوان الأربعة */}
                <div
                  className="grid grid-cols-2 gap-1 w-6 h-6 shrink-0"
                  aria-hidden="true"
                >
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#1D4ED8]" />
                  <span className="w-2.5 h-2.5 rounded-xs bg-white" />
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#081544]" />
                  <span className="w-2.5 h-2.5 rounded-xs bg-brand-yellow" />
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* 2. محتوى الشريط: قائمة الروابط مع الأيقونات وتمييز brand-yellow */}
      <SidebarContent className="px-3 py-4 group-data-[collapsible=icon]:px-1 bg-[#091336]">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {config.navItems.map((item) => {
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard' || pathname === '/dashboard/'
                    : pathname?.startsWith(item.href);

                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      render={
                        <Link
                          href={item.href}
                          onClick={handleItemClick}
                        />
                      }
                      className={cn(
                        'h-11 px-3.5 rounded-xl font-bold transition-all text-sm group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0',
                        isActive
                          ? 'bg-brand-yellow text-slate-950 hover:bg-brand-yellow hover:text-slate-950 font-black shadow-md'
                          : 'text-slate-300 hover:text-white hover:bg-white/10 font-medium'
                      )}
                    >
                      <div className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center">
                        {/* أيقونة العنصر من lucide-react */}
                        {Icon && (
                          <Icon
                            className={cn(
                              'w-5 h-5 shrink-0 transition-transform duration-150',
                              isActive
                                ? 'text-slate-950'
                                : 'text-slate-400 group-hover:text-white'
                            )}
                          />
                        )}

                        {/* نص الرابط */}
                        <span className="truncate flex-1 group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>

                        {/* أيقونة المربع المطابقة للتصميم الأصلي */}
                        <span
                          className={cn(
                            'w-3.5 h-3.5 rounded-xs border-2 flex items-center justify-center shrink-0 transition-colors group-data-[collapsible=icon]:hidden',
                            isActive
                              ? 'border-slate-950 bg-slate-950'
                              : 'border-slate-400 group-hover:border-slate-200'
                          )}
                          aria-hidden="true"
                        />
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 3. أسفل الشريط الجانبي: رقم الإصدار ونوع اللوحة */}
      <SidebarFooter className="border-t border-white/10 p-0 bg-[#070F2B]">
        <div className="py-4 px-5 flex items-center justify-between text-xs text-slate-400 font-semibold group-data-[collapsible=icon]:justify-center">
          <span className="group-data-[collapsible=icon]:hidden">v1.0</span>
          <span>{config.roleLabel}</span>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
