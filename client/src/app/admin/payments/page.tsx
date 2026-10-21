import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { ar } from '@/i18n/messages/ar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatMoney, formatTime, todayClinicDate } from '@/lib/utils';
import { PayRemainingDialog } from '@/components/payments/pay-remaining-dialog';
import { AppointmentTypeBadge } from '@/components/appointments/appointment-type-badge';
import {
  CreditCard,
  Calendar,
  User,
  Clock,
  Coins,
  ShieldCheck,
  Receipt,
  Phone,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface DetailedPayment {
  id: string;
  amount: number;
  method: 'CASH' | 'CARD' | 'WALLET' | string;
  kind: 'CONSULTATION' | 'FOLLOW_UP' | 'OTHER' | string;
  paymentType?: 'FULL' | 'DEPOSIT' | 'REMAINING' | 'OTHER';
  notes?: string | null;
  status: 'RECORDED' | 'VOIDED';
  voidReason?: string | null;
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

interface AdminPaymentsPageProps {
  searchParams?: Promise<{ date?: string; page?: string }>;
}

export default async function AdminPaymentsPage({ searchParams }: AdminPaymentsPageProps) {
  await requireRole(['ADMIN']);

  const resolved = searchParams ? await searchParams : {};
  const params = new URLSearchParams();
  if (resolved.date) params.set('date', resolved.date);
  params.set('page', resolved.page ?? '1');
  params.set('pageSize', '50');

  const result = await api
    .get<{ data: DetailedPayment[]; meta: { total: number } }>(`/payments?${params}`)
    .catch(() => ({ data: [], meta: { total: 0 } }));

  const payments = result.data || [];

  const totalAmountSum = payments
    .filter((p) => p.status === 'RECORDED')
    .reduce((acc, p) => acc + Number(p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="size-6 text-primary" />
            {ar.payments.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            مراجعة كافة العمليات المالية والعربين وسدادات الحجز بالعيادة
          </p>
        </div>

        {/* Date filter */}
        <form method="GET" className="flex gap-2 items-center bg-card p-1.5 rounded-lg border shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pr-2">
            <Calendar className="size-3.5 text-primary" />
            <span>التاريخ:</span>
          </div>
          <input
            type="date"
            name="date"
            defaultValue={resolved.date ?? ''}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            className="px-4 h-9 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm"
          >
            {ar.reports.apply}
          </button>
        </form>
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border text-xs font-mono">
        <span>إجمالي العمليات: <strong className="text-foreground">{result.meta?.total || payments.length}</strong> حركة</span>
        <span>إجمالي المبالغ المحصلة: <strong className="text-emerald-700 font-bold">{formatMoney(totalAmountSum)}</strong></span>
      </div>

      {/* List */}
      <div className="space-y-3">
        {payments.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground border-dashed">
            <Receipt className="size-8 mx-auto mb-2 text-muted-foreground/60" />
            لا توجد مدفوعات مسجلة لهذا التاريخ
          </Card>
        ) : (
          payments.map((p) => {
            const hasRemaining = (p.appointment?.remainingAmount ?? 0) > 0;
            const isDeposit = p.paymentType === 'DEPOSIT' || (hasRemaining && p.paymentType !== 'REMAINING');

            return (
              <Card key={p.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left Column: Details */}
                  <div className="space-y-1.5 flex-1">
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

                      {/* Payment type badge */}
                      {isDeposit ? (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                          عربون حجز
                        </Badge>
                      ) : p.paymentType === 'REMAINING' ? (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                          سداد متبقي
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
                          سداد كامل
                        </Badge>
                      )}

                      <Badge variant="outline" className="text-xs">
                        {ar.payments[p.method as keyof typeof ar.payments] || p.method}
                      </Badge>

                      <Badge variant={p.status === 'VOIDED' ? 'destructive' : 'default'} className="text-xs">
                        {ar.payments[p.status as keyof typeof ar.payments] || p.status}
                      </Badge>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <span>نوع الحجز:</span>
                          <AppointmentTypeBadge type={p.appointment?.type || p.kind} size="sm" />
                        </span>
                        {p.doctor && <span>• الطبيب: <strong className="text-foreground">د. {p.doctor.name}</strong></span>}
                      </div>

                      {p.notes && (
                        <p className="text-foreground font-medium bg-muted/40 px-2 py-0.5 rounded border inline-block">
                          {p.notes}
                        </p>
                      )}

                      <p className="text-[11px] text-muted-foreground flex items-center gap-2 pt-0.5">
                        <Clock className="size-3" />
                        <span>{formatTime(p.createdAt)}</span>
                        {p.receivedBy && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="size-3 text-primary" />
                              المستلم: {p.receivedBy.name}
                            </span>
                          </>
                        )}
                        {p.voidReason && (
                          <span className="text-destructive font-semibold">
                            • ملغى: {p.voidReason}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Amount & Remaining */}
                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 sm:border-r pt-3 sm:pt-0 pr-0 sm:pr-4 shrink-0">
                    <div className="text-left">
                      <span className="text-xs text-muted-foreground block">المسدد بالإيصال</span>
                      <span className="text-2xl font-bold font-mono text-emerald-700">
                        {formatMoney(p.amount)}
                      </span>
                    </div>

                    {p.appointment && (
                      <div className="text-left space-y-1 font-mono text-xs">
                        <span className="text-muted-foreground text-[11px] block">
                          إجمالي الحجز: {formatMoney(p.appointment.totalAmount)}
                        </span>
                        {hasRemaining ? (
                          <div className="space-y-1">
                            <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200">
                              متبقي: {formatMoney(p.appointment.remainingAmount)}
                            </span>
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
                          <span className="text-emerald-700 font-semibold text-[11px]">
                            تم السداد بالكامل ✓
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
