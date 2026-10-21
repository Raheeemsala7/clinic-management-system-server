'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AppointmentTypeBadge } from './appointment-type-badge';
import type { PatientBookingSummary } from '@/features/patients/actions';
import { formatDate, formatTime, formatMoney } from '@/lib/utils';
import {
  UserCheck,
  Calendar,
  CreditCard,
  History,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Phone,
  MapPin,
  Clock,
  Stethoscope,
  Receipt,
} from 'lucide-react';

interface PatientSummaryPanelProps {
  summary: PatientBookingSummary;
  onClearPatient: () => void;
  locale?: string;
}

export function PatientSummaryPanel({
  summary,
  onClearPatient,
  locale = 'ar',
}: PatientSummaryPanelProps) {
  const isAr = locale === 'ar';
  const [openSection, setOpenSection] = useState<'all' | 'clinical' | 'financial' | 'history'>('all');

  const { patient, lastVisit, financialSummary, previousAppointments } = summary;
  const hasOutstanding = financialSummary.outstandingBalance > 0;

  return (
    <Card className="border-2 border-primary/20 bg-card shadow-sm overflow-hidden transition-all animate-in fade-in-50 duration-300">
      {/* Header Bar */}
      <div className="bg-muted/40 p-3 sm:p-4 border-b flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
            <UserCheck className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-base text-foreground">{patient.fullName}</span>
              <Badge variant="outline" className="text-2xs font-mono">
                {patient.gender === 'MALE' ? (isAr ? 'ذكر' : 'Male') : (isAr ? 'أنثى' : 'Female')}
                {patient.age !== null && ` • ${patient.age} ${isAr ? 'سنة' : 'yrs'}`}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1">
                <Phone className="size-3 text-muted-foreground" />
                <span dir="ltr">{patient.phone}</span>
              </span>
              {patient.address && (
                <span className="hidden sm:inline-flex items-center gap-1 truncate max-w-xs">
                  <MapPin className="size-3 text-muted-foreground" />
                  {patient.address}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasOutstanding && (
            <Badge variant="destructive" className="animate-pulse text-2xs font-bold gap-1">
              <AlertCircle className="size-3" />
              {isAr ? 'متبقي سابق:' : 'Balance Due:'}{' '}
              {formatMoney(financialSummary.outstandingBalance)}
            </Badge>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearPatient}
            className="text-xs text-muted-foreground hover:text-destructive gap-1 h-8"
          >
            <X className="size-4" />
            <span>{isAr ? 'تغيير المريض' : 'Change Patient'}</span>
          </Button>
        </div>
      </div>

      <CardContent className="p-3 sm:p-4 space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card 1: Last Examination / Visit */}
          <div className="p-3 rounded-lg border bg-background/50 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground pb-1 border-b">
              <span className="flex items-center gap-1.5">
                <Stethoscope className="size-3.5 text-primary" />
                {isAr ? 'آخر زيارة وفحص' : 'Last Examination'}
              </span>
              {lastVisit && <AppointmentTypeBadge type={lastVisit.appointmentType} locale={locale} />}
            </div>

            {lastVisit ? (
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {formatDate(lastVisit.date)}
                  </span>
                  {lastVisit.doctorName && (
                    <span className="font-medium text-foreground">{lastVisit.doctorName}</span>
                  )}
                </div>
                {lastVisit.diagnosis ? (
                  <p className="text-foreground font-medium line-clamp-2 bg-muted/30 p-1.5 rounded">
                    <span className="text-muted-foreground font-normal">
                      {isAr ? 'التشخيص: ' : 'Diagnosis: '}
                    </span>
                    {lastVisit.diagnosis}
                  </p>
                ) : (
                  <p className="text-muted-foreground italic text-2xs">
                    {isAr ? 'لا يوجد تشخيص مسجل' : 'No diagnosis recorded'}
                  </p>
                )}
              </div>
            ) : (
              <div className="py-3 text-center text-xs text-muted-foreground italic">
                {isAr ? 'لا توجد زيارات سابقة مسجلة' : 'No prior visits on record'}
              </div>
            )}
          </div>

          {/* Card 2: Financial Summary & Outstanding Balance */}
          <div
            className={`p-3 rounded-lg border space-y-2 ${
              hasOutstanding
                ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                : 'bg-background/50'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground pb-1 border-b">
              <span className="flex items-center gap-1.5">
                <CreditCard className="size-3.5 text-primary" />
                {isAr ? 'الملخص المالي والمدفوعات' : 'Financial Summary'}
              </span>
              <Badge
                variant={
                  financialSummary.paymentStatus === 'PAID'
                    ? 'default'
                    : financialSummary.paymentStatus === 'PARTIAL'
                      ? 'outline'
                      : 'destructive'
                }
                className="text-2xs"
              >
                {financialSummary.paymentStatus === 'PAID'
                  ? isAr ? 'خالص' : 'Settled'
                  : financialSummary.paymentStatus === 'PARTIAL'
                    ? isAr ? 'سداد جزئي' : 'Partial'
                    : isAr ? 'مستحق' : 'Unpaid'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <div className="p-1.5 rounded bg-muted/20">
                <span className="text-2xs text-muted-foreground block">
                  {isAr ? 'إجمالي الرسوم' : 'Total Fees'}
                </span>
                <span className="font-semibold">{formatMoney(financialSummary.totalCharged)}</span>
              </div>
              <div className="p-1.5 rounded bg-muted/20">
                <span className="text-2xs text-muted-foreground block">
                  {isAr ? 'المدفوع سابقاً' : 'Paid to date'}
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatMoney(financialSummary.totalPaid)}
                </span>
              </div>
            </div>

            <div
              className={`p-1.5 rounded text-xs flex items-center justify-between font-bold ${
                hasOutstanding
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200'
                  : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
              }`}
            >
              <span>{isAr ? 'الرصيد المتبقي:' : 'Outstanding:'}</span>
              <span className="font-mono text-sm">
                {formatMoney(financialSummary.outstandingBalance)}
              </span>
            </div>
          </div>

          {/* Card 3: Previous Appointments History */}
          <div className="p-3 rounded-lg border bg-background/50 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground pb-1 border-b">
              <span className="flex items-center gap-1.5">
                <History className="size-3.5 text-primary" />
                {isAr ? 'سجل المواعيد السابقة' : 'Past Appointments'}
              </span>
              <span className="text-2xs text-muted-foreground font-mono">
                {previousAppointments.length} {isAr ? 'موعد' : 'appts'}
              </span>
            </div>

            {previousAppointments.length > 0 ? (
              <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                {previousAppointments.slice(0, 3).map((appt) => (
                  <div
                    key={appt.id}
                    className="flex items-center justify-between text-2xs p-1 rounded bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-mono text-muted-foreground">{appt.clinicDate}</span>
                      <AppointmentTypeBadge type={appt.type} locale={locale} showDot={false} className="text-3xs py-0 px-1.5" />
                    </div>
                    <Badge variant="outline" className="text-3xs font-mono shrink-0">
                      {appt.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-3 text-center text-xs text-muted-foreground italic">
                {isAr ? 'لا توجد مواعيد سابقة' : 'No prior appointments'}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
