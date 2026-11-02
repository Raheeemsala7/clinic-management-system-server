'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, CreditCard, Clock, CheckCheck, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationItem {
  id: string;
  type: 'booking' | 'payment' | 'waiting';
  titleKey: string;
  descKey: string;
  timeKey: string;
  unread: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    type: 'booking',
    titleKey: 'items.booking.title',
    descKey: 'items.booking.desc',
    timeKey: 'items.booking.time',
    unread: true,
  },
  {
    id: 'n-2',
    type: 'payment',
    titleKey: 'items.payment.title',
    descKey: 'items.payment.desc',
    timeKey: 'items.payment.time',
    unread: true,
  },
  {
    id: 'n-3',
    type: 'waiting',
    titleKey: 'items.waiting.title',
    descKey: 'items.waiting.desc',
    timeKey: 'items.waiting.time',
    unread: true,
  },
];

export function DashboardNotifications() {
  const t = useTranslations('Dashboard.notificationMenu');
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // إغلاق القائمة عند النقر خارجها أو الضغط على زر Esc
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  // تحديد الكل كمقروء
  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // تحديد إشعار محدد كمقروء
  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'waiting':
        return <Clock className="w-4 h-4 text-amber-600" />;
    }
  };

  const getIconBg = (type: NotificationItem['type']) => {
    switch (type) {
      case 'booking':
        return 'bg-blue-50';
      case 'payment':
        return 'bg-emerald-50';
      case 'waiting':
        return 'bg-amber-50';
    }
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* زر التنبيه الدائري الكحلي مع علامة التعجب الصفراء وشارة عدد الإشعارات */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0A164E] text-brand-yellow flex items-center justify-center font-black text-sm shadow-xs hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        aria-label={t('title')}
        title={t('title')}
        aria-expanded={open}
      >
        <span>!</span>

        {/* شارة عدد الإشعارات غير المقروءة */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {/* القائمة المنبثقة لعرض الإشعارات */}
      {open && (
        <div className="fixed sm:absolute inset-x-4 sm:inset-x-auto top-16 sm:top-full sm:mt-2 sm:ltr:right-0 sm:rtl:left-0 w-auto sm:w-88 bg-white rounded-2xl shadow-xl border border-slate-200/80 z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* رأس القائمة */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#0A164E]">{t('title')}</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-xs font-bold">
                  {t('newCount', { count: unreadCount })}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{t('markAllRead')}</span>
              </button>
            )}
          </div>

          {/* محتوى الإشعارات */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">
                {t('empty')}
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleMarkAsRead(item.id)}
                  className={cn(
                    'flex items-start gap-3 p-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer text-start',
                    item.unread && 'bg-blue-50/30'
                  )}
                >
                  {/* أيقونة نوع الإشعار */}
                  <div
                    className={cn(
                      'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                      getIconBg(item.type)
                    )}
                  >
                    {getIcon(item.type)}
                  </div>

                  {/* نصوص الإشعار */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-[#0A164E] truncate">
                        {t(item.titleKey)}
                      </p>
                      {item.unread && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {t(item.descKey)}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                      {t(item.timeKey)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* أسفل القائمة */}
          <div className="p-2 border-t border-slate-100 bg-slate-50/50 text-center">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-slate-600 hover:text-[#0A164E] font-bold py-1 w-full rounded-lg hover:bg-white transition-colors cursor-pointer"
            >
              {t('viewAll')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
