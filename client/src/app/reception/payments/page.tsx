import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { ar } from '@/messages/ar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatMoney, formatTime, todayClinicDate } from '@/lib/utils';
import { PayRemainingDialog } from '@/components/payments/pay-remaining-dialog';
import { AppointmentTypeBadge } from '@/components/appointments/appointment-type-badge';
import {
  CreditCard,
  User,
  Clock,
  Coins,
  CheckCircle,
  AlertCircle,
  Gift,
  Receipt,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import type { PaginatedResult } from '@/features/patients/queries';

export const dynamic = 'force-dynamic';

interface DetailedPayment {
  id: string;
  amount: number;
  method: 'CASH' | 'CARD' | 'WALLET';
  kind: 'CONSULTATION' | 'FOLLOW_UP' | 'OTHER' | string;
  paymentType?: 'FULL' | 'DEPOSIT' | 'REMAINING' | 'OTHER';
  notes?: string | null;
  status: 'RECORDED' | 'VOIDED';
  createdAt: string;
  patient?: {
    id: string;
    fullName: string;
    phone: string;
  } | null;
  doctor?: {
    id: string;
    name: string;
  } | null;
  receivedBy?: {
    id: string;
    name: string;
    username: string;
  } | null;
  appointment?: {
    id: string;
    clinicDate: string;
    type: string;
    startTime?: string | null;
    endTime?: string | null;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID' | 'EXEMPT';
    isExempt: boolean;
    exemptionReason?: string | null;
  } | null;
}

export default async function ReceptionPaymentsPage() {
  await requireRole(['RECEPTION', 'ADMIN']);

  const today = todayClinicDate();
  const result = await api
    .get<PaginatedResult<DetailedPayment>>(`/payments?date=${today}&pageSize=50`)
    .catch(() => ({ data: [], total: 0 }));

  const payments = result.data || [];

  // Summary statistics
  const totalRecorded = payments
    .filter((p) => p.status === 'RECORDED')
    .reduce((acc, p) => acc + Number(p.amount || 0), 0);

  const totalDeposits = payments
    .filter((p) => p.status === 'RECORDED' && (p.paymentType === 'DEPOSIT' || (p.appointment?.remainingAmount ?? 0) > 0))
    .reduce((acc, p) => acc + Number(p.amount || 0), 0);

  const totalOutstanding = payments
    .filter((p) => p.status === 'RECORDED' && (p.appointment?.remainingAmount ?? 0) > 0)
    .reduce((acc, p) => acc + Number(p.appointment?.remainingAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="size-6 text-primary" />
            سجل المدفوعات والتحصيل اليومي
          </h1>
          <p className="text-sm text-muted-foreground">
            تفاصيل المبالغ المحصلة، العربين، والمبالغ المتبقية لكل مريض ({today})
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="bg-emerald-50/70 border-emerald-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Coins className="size-6" />
            </div>
            <div>
              <span className="text-xs text-emerald-800 font-semibold block">إجمالي التحصيل اليوم</span>
              <span className="text-2xl font-bold text-emerald-950 font-mono">{formatMoney(totalRecorded)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50/70 border-amber-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-11 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
              <Receipt className="size-6" />
            </div>
            <div>
              <span className="text-xs text-amber-800 font-semibold block">عربين وحجوزات جزئية</span>
              <span className="text-2xl font-bold text-amber-950 font-mono">{formatMoney(totalDeposits)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/70 border-blue-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Clock className="size-6" />
            </div>
            <div>
              <span className="text-xs text-blue-800 font-semibold block">مبالغ متبقية للتحصيل</span>
              <span className="text-2xl font-bold text-blue-950 font-mono">{formatMoney(totalOutstanding)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      <div className="space-y-3">
        {payments.length === 0 ? (
          <div className="text-center py-16 bg-muted/20 border-2 border-dashed rounded-xl space-y-2">
            <Receipt className="size-10 text-muted-foreground mx-auto" />
            <p className="font-semibold text-muted-foreground">لا توجد مدفوعات مسجلة اليوم حتى الآن</p>
            <p className="text-xs text-muted-foreground">سيظهر هنا أي إيصال أو عربون يتم تحصيله عند الحجز</p>
          </div>
        ) : (
          payments.map((p) => {
            const hasRemaining = (p.appointment?.remainingAmount ?? 0) > 0;
            const isDeposit = p.paymentType === 'DEPOSIT' || (hasRemaining && p.paymentType !== 'REMAINING');

            return (
              <Card key={p.id} className="hover:shadow-md transition-shadow border-muted">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left Column: Transaction Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg font-bold text-foreground">
                        {p.patient?.fullName || 'مريض غير مسجل'}
                      </span>
                      {p.patient?.phone && (
                        <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                          <Phone className="size-3" />
                          {p.patient.phone}
                        </span>
                      )}

                      {/* Payment Type Badge */}
                      {isDeposit ? (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                          عربون حجز موعد
                        </Badge>
                      ) : p.paymentType === 'REMAINING' ? (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                          سداد متبقي الحجز
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
                          سداد كامل للحجز
                        </Badge>
                      )}

                      <Badge variant="outline" className="text-xs">
                        {ar.payments[p.method] || p.method}
                      </Badge>

                      <Badge variant={p.status === 'VOIDED' ? 'destructive' : 'default'} className="text-xs">
                        {ar.payments[p.status] || p.status}
                      </Badge>
                    </div>

                    {/* What is this payment for? */}
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <span>نوع الحجز:</span>
                          <AppointmentTypeBadge type={p.appointment?.type || p.kind} size="sm" />
                        </span>
                        {p.doctor && <span>• الطبيب: <strong className="text-foreground">د. {p.doctor.name}</strong></span>}
                        {p.appointment?.startTime && (
                          <span>• الموعد: <strong className="text-foreground font-mono">{p.appointment.startTime}</strong></span>
                        )}
                      </div>

                      {p.notes && (
                        <p className="text-foreground font-medium bg-muted/30 px-2 py-1 rounded border inline-block">
                          {p.notes}
                        </p>
                      )}

                      <p className="text-[11px] text-muted-foreground flex items-center gap-2 pt-0.5">
                        <Clock className="size-3" />
                        <span>وقت العملية: {formatTime(p.createdAt)}</span>
                        {p.receivedBy && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="size-3 text-primary" />
                              تم التحصيل بواسطة: {p.receivedBy.name}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Financial Breakdown & Actions */}
                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 sm:border-r pt-3 sm:pt-0 pr-0 sm:pr-4 shrink-0">
                    <div className="text-left">
                      <span className="text-xs text-muted-foreground block">المسدد في هذا الإيصال</span>
                      <span className="text-2xl font-bold font-mono text-emerald-700">
                        {formatMoney(p.amount)}
                      </span>
                    </div>

                    {/* Remaining Balance Indicator and Quick Pay Button */}
                    {p.appointment && (
                      <div className="text-left space-y-1.5 font-mono text-xs">
                        <div className="text-muted-foreground text-[11px]">
                          إجمالي الكشف: {formatMoney(p.appointment.totalAmount)}
                        </div>

                        {hasRemaining ? (
                          <div className="space-y-1.5">
                            <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200">
                              متبقي: {formatMoney(p.appointment.remainingAmount)}
                            </span>

                            {/* Quick Pay Dialog Button */}
                            <div>
                              <PayRemainingDialog
                                appointmentId={p.appointment.id}
                                patientName={p.patient?.fullName || 'المريض'}
                                totalAmount={p.appointment.totalAmount}
                                remainingAmount={p.appointment.remainingAmount}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                            تم سداد كامل الحساب ✓
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
