'use client';

import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  Save,
  Coffee,
  AlertCircle,
  Stethoscope,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface DaySchedule {
  id: string;
  nameAr: string;
  nameEn: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  breakStart?: string;
  breakEnd?: string;
}

const DEFAULT_SCHEDULE: DaySchedule[] = [
  { id: 'saturday', nameAr: 'السبت', nameEn: 'Saturday', enabled: true, startTime: '10:00', endTime: '18:00', slotDurationMinutes: 20, breakStart: '14:00', breakEnd: '15:00' },
  { id: 'sunday', nameAr: 'الأحد', nameEn: 'Sunday', enabled: true, startTime: '10:00', endTime: '18:00', slotDurationMinutes: 20, breakStart: '14:00', breakEnd: '15:00' },
  { id: 'monday', nameAr: 'الاثنين', nameEn: 'Monday', enabled: true, startTime: '10:00', endTime: '18:00', slotDurationMinutes: 20, breakStart: '14:00', breakEnd: '15:00' },
  { id: 'tuesday', nameAr: 'الثلاثاء', nameEn: 'Tuesday', enabled: true, startTime: '10:00', endTime: '18:00', slotDurationMinutes: 20, breakStart: '14:00', breakEnd: '15:00' },
  { id: 'wednesday', nameAr: 'الأربعاء', nameEn: 'Wednesday', enabled: true, startTime: '10:00', endTime: '18:00', slotDurationMinutes: 20, breakStart: '14:00', breakEnd: '15:00' },
  { id: 'thursday', nameAr: 'الخميس', nameEn: 'Thursday', enabled: true, startTime: '10:00', endTime: '16:00', slotDurationMinutes: 20, breakStart: '13:00', breakEnd: '13:30' },
  { id: 'friday', nameAr: 'الجمعة', nameEn: 'Friday', enabled: false, startTime: '14:00', endTime: '18:00', slotDurationMinutes: 20 },
];

export default function DoctorSchedulePage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>(DEFAULT_SCHEDULE);
  const [isSaving, setIsSaving] = useState(false);
  const [isDoctorAvailable, setIsDoctorAvailable] = useState(true);

  const toggleDay = (id: string) => {
    setSchedule((prev) =>
      prev.map((day) => (day.id === id ? { ...day, enabled: !day.enabled } : day))
    );
  };

  const updateDayTime = (id: string, field: 'startTime' | 'endTime', value: string) => {
    setSchedule((prev) =>
      prev.map((day) => (day.id === id ? { ...day, [field]: value } : day))
    );
  };

  const updateDuration = (id: string, mins: number) => {
    setSchedule((prev) =>
      prev.map((day) => (day.id === id ? { ...day, slotDurationMinutes: mins } : day))
    );
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('تم حفظ جدول أوقات العمل الأسبوعية بنجاح');
    }, 600);
  };

  const activeDaysCount = schedule.filter((d) => d.enabled).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6" dir="rtl">
      {/* 1. الترويسة الرئيسية */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-blue-50 text-[#0040D8]">
              <Clock className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0A164E] tracking-tight">
              أوقات العمل الأسبوعية والورديات
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-400">
            تحديد مواعيد الحضور وساعات الكشف اليومية وفترات الحجز المتاحة للمرضى
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setIsDoctorAvailable(!isDoctorAvailable);
              toast.success(
                !isDoctorAvailable
                  ? 'تم تغيير الحالة إلى: متاح لاستقبال المرضى'
                  : 'تم تغيير الحالة إلى: غير متاح حالياً'
              );
            }}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs transition-all shadow-xs cursor-pointer ${
              isDoctorAvailable
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                : 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isDoctorAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span>{isDoctorAvailable ? 'الطبيب: متاح بالعيادة' : 'الطبيب: غير متاح الآن'}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0040D8] hover:bg-blue-700 text-white font-black text-xs transition-all shadow-md active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ الجدول'}</span>
          </button>
        </div>
      </div>

      {/* 2. كروت الإحصائيات السريعة */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 block">أيام العمل النشطة</span>
          <span className="text-2xl font-black text-[#0A164E]">{activeDaysCount} أيام / أسبوع</span>
          <span className="text-[11px] text-emerald-600 font-bold block">
            {7 - activeDaysCount} أيام عطلة أسبوعية
          </span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 block">متوسط مدة الكشف</span>
          <span className="text-2xl font-black text-[#0040D8]">20 دقيقة</span>
          <span className="text-[11px] text-slate-500 font-bold block">
            قابلة للتعديل لكل يوم بشكل منفصل
          </span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 block">الطاقة الاستيعابية التقديرية</span>
          <span className="text-2xl font-black text-emerald-600">~24 مريض / يوم</span>
          <span className="text-[11px] text-slate-500 font-bold block">
            بناءً على ساعات العمل وفترات الراحة
          </span>
        </div>
      </div>

      {/* 3. جدول أيام الأسبوع التفصيلي */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0040D8]" />
            <h2 className="text-base font-black text-[#0A164E]">
              جدول الحضور اليومي وتوزيع الفترات
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-bold">
            يمكن تفعيل أو تعطيل أي يوم وضبط ساعات البدء والانتهاء
          </span>
        </div>

        <div className="space-y-3">
          {schedule.map((day) => (
            <div
              key={day.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                day.enabled
                  ? 'bg-slate-50/70 border-slate-200'
                  : 'bg-slate-100/40 border-slate-200/50 opacity-60'
              }`}
            >
              {/* اسم اليوم ومفتاح التفعيل */}
              <div className="flex items-center gap-3 min-w-[160px]">
                <button
                  type="button"
                  onClick={() => toggleDay(day.id)}
                  className={`p-1 rounded-xl transition-all cursor-pointer ${
                    day.enabled ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                  title={day.enabled ? 'اضغط للتعطيل' : 'اضغط للتفعيل'}
                >
                  {day.enabled ? (
                    <ToggleRight className="w-7 h-7" />
                  ) : (
                    <ToggleLeft className="w-7 h-7" />
                  )}
                </button>

                <div>
                  <span className="font-black text-sm text-[#0A164E] block">
                    {day.nameAr}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 block" dir="ltr">
                    {day.nameEn}
                  </span>
                </div>
              </div>

              {/* ساعات العمل */}
              {day.enabled ? (
                <div className="flex items-center gap-4 flex-wrap text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">من:</span>
                    <input
                      type="time"
                      value={day.startTime}
                      onChange={(e) => updateDayTime(day.id, 'startTime', e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-xs focus:outline-none focus:border-[#0040D8]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">إلى:</span>
                    <input
                      type="time"
                      value={day.endTime}
                      onChange={(e) => updateDayTime(day.id, 'endTime', e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-xs focus:outline-none focus:border-[#0040D8]"
                    />
                  </div>

                  {/* مدة الكشف */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">مدة الكشف:</span>
                    <select
                      value={day.slotDurationMinutes}
                      onChange={(e) => updateDuration(day.id, Number(e.target.value))}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-xs focus:outline-none focus:border-[#0040D8] cursor-pointer"
                    >
                      <option value={15}>15 دقيقة</option>
                      <option value={20}>20 دقيقة</option>
                      <option value={30}>30 دقيقة</option>
                      <option value={45}>45 دقيقة</option>
                    </select>
                  </div>

                  {/* فترة الراحة */}
                  {day.breakStart && (
                    <div className="flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                      <Coffee className="w-3.5 h-3.5 text-amber-600" />
                      <span>راحة: {day.breakStart} - {day.breakEnd}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs font-bold text-slate-400 flex items-center gap-2">
                  <span>عطلة أسبوعية - العيادة مغلقة في هذا اليوم</span>
                </div>
              )}

              {/* حالة اليوم */}
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black ${
                    day.enabled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {day.enabled ? 'متاح للحجز ✓' : 'مغلق'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

