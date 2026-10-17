import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireRole } from '@/lib/session';
import { getPatient, getPatientHistory, type PatientFull, type PatientVisitHistoryItem } from '@/features/patients/queries';
import { ar } from '@/messages/ar';
import { formatDate, formatTime, computeAge } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  AlertCircle,
  HeartPulse,
  FileText,
  Calendar,
  Phone,
  MapPin,
  Pill,
  Stethoscope,
  Activity,
  Clock,
  CheckCircle2,
  ExternalLink,
  User,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PatientProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientProfilePage({ params }: PatientProfilePageProps) {
  await requireRole(['DOCTOR', 'ADMIN']);
  const { id } = await params;

  let patient: PatientFull;
  let historyItems: PatientVisitHistoryItem[] = [];

  try {
    const [patientData, historyData] = await Promise.all([
      getPatient(id),
      getPatientHistory(id, 1, 50).catch(() => ({ data: [], meta: { page: 1, pageSize: 50, total: 0, totalPages: 1 } })),
    ]);
    patient = patientData;
    historyItems = historyData.data;
  } catch (error) {
    notFound();
  }

  const age = computeAge(patient.dateOfBirth, patient.age);
  const totalVisits = historyItems.length;
  const latestVisit = historyItems[0] ?? null;

  // Calculate all prescribed medications count
  const totalPrescriptions = historyItems.reduce((acc, v) => acc + (v.prescriptions?.length || 0), 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Link href="/doctor/patients">
              <ArrowRight className="size-4" />
              العودة لقائمة المرضى
            </Link>
          </Button>
          <span className="text-muted-foreground text-xs">•</span>
          <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Link href="/doctor">
              شاشة كشف اليوم
            </Link>
          </Button>
        </div>

        <Badge variant="outline" className="text-xs font-mono">
          رقم المريض: {patient.id.slice(0, 8)}
        </Badge>
      </div>

      {/* Patient Header Card */}
      <Card className="border-2 border-primary/25 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-l from-primary/10 via-primary/5 to-transparent p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="size-16 rounded-2xl bg-primary text-primary-foreground font-black text-2xl flex items-center justify-center shadow-md shrink-0">
                {patient.fullName.slice(0, 2)}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-foreground">{patient.fullName}</h1>
                  <Badge variant="secondary" className="font-semibold text-xs">
                    {patient.gender === 'MALE' ? ar.patients.male : ar.patients.female}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground flex-wrap">
                  {patient.phone && (
                    <a
                      href={`tel:${patient.phone}`}
                      className="flex items-center gap-1.5 font-medium hover:text-primary transition-colors text-foreground"
                    >
                      <Phone className="size-3.5 text-primary" />
                      <span dir="ltr">{patient.phone}</span>
                    </a>
                  )}

                  {age !== null && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-primary" />
                      {age} {ar.patients.years}
                      {patient.dateOfBirth && (
                        <span className="text-muted-foreground font-mono">({formatDate(patient.dateOfBirth)})</span>
                      )}
                    </span>
                  )}

                  {patient.address && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-primary" />
                      {patient.address}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-background/80 text-xs px-3 py-1 font-semibold">
                مسجل منذ: {formatDate(patient.createdAt)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Medical Alerts (Allergies & Chronic Diseases) */}
        <div className="border-t bg-card p-5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Allergies Alert */}
            <div
              className={`rounded-xl border p-3.5 transition-colors ${
                patient.allergies && patient.allergies.length > 0
                  ? 'bg-red-50/90 border-red-300 text-red-950 dark:bg-red-950/20'
                  : 'bg-muted/30 border-muted text-muted-foreground'
              }`}
            >
              <div className="flex items-center gap-2 mb-2 font-bold text-sm">
                <AlertCircle
                  className={`size-4 shrink-0 ${
                    patient.allergies && patient.allergies.length > 0 ? 'text-red-600' : 'text-muted-foreground'
                  }`}
                />
                <span className={patient.allergies && patient.allergies.length > 0 ? 'text-red-700' : ''}>
                  حساسية الأدوية والمواد (تحذير سريري)
                </span>
              </div>
              {patient.allergies && patient.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {patient.allergies.map((allergy, i) => (
                    <Badge key={i} variant="destructive" className="bg-red-600 text-white font-bold text-xs shadow-sm">
                      ⚠ {allergy}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground font-medium">لا توجد أي حساسيات مسجلة للمريض</p>
              )}
            </div>

            {/* Chronic Conditions Alert */}
            <div
              className={`rounded-xl border p-3.5 transition-colors ${
                patient.chronicConditions && patient.chronicConditions.length > 0
                  ? 'bg-amber-50/90 border-amber-300 text-amber-950 dark:bg-amber-950/20'
                  : 'bg-muted/30 border-muted text-muted-foreground'
              }`}
            >
              <div className="flex items-center gap-2 mb-2 font-bold text-sm">
                <HeartPulse
                  className={`size-4 shrink-0 ${
                    patient.chronicConditions && patient.chronicConditions.length > 0
                      ? 'text-amber-600'
                      : 'text-muted-foreground'
                  }`}
                />
                <span className={patient.chronicConditions && patient.chronicConditions.length > 0 ? 'text-amber-800' : ''}>
                  الأمراض المزمنة
                </span>
              </div>
              {patient.chronicConditions && patient.chronicConditions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {patient.chronicConditions.map((cond, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="bg-amber-100 border-amber-300 text-amber-900 font-semibold text-xs shadow-sm"
                    >
                      {cond}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground font-medium">لا توجد أمراض مزمنة مسجلة</p>
              )}
            </div>
          </div>

          {/* General Notes */}
          {patient.generalNotes && (
            <div className="rounded-xl border bg-muted/20 p-3 text-xs text-muted-foreground">
              <span className="font-bold text-foreground">ملاحظات عامة حول المريض: </span>
              {patient.generalNotes}
            </div>
          )}
        </div>
      </Card>

      {/* Quick KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Activity className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">إجمالي الزيارات والفحوصات</p>
              <p className="text-2xl font-black text-foreground">{totalVisits}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
              <Pill className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">الروشتات الطبية المصروفة</p>
              <p className="text-2xl font-black text-foreground">{totalPrescriptions}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">آخر كشف / زيارة</p>
              <p className="text-sm font-bold text-foreground mt-0.5 truncate">
                {latestVisit ? formatDate(latestVisit.createdAt) : 'لا توجد زيارات سابقة'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clinical Visits & History Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="size-5 text-primary" />
            <h2 className="text-xl font-bold">السجل الطبي والزيارات السابقة ({totalVisits})</h2>
          </div>
        </div>

        {historyItems.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground border-dashed">
            <FileText className="size-10 mx-auto text-muted-foreground/60 mb-2" />
            <p className="font-bold text-base text-foreground">لا يوجد سجل زيارات سابق لهذا المريض</p>
            <p className="text-xs text-muted-foreground mt-1">
              عند إتمام أول كشف طبي للمريض ستظهر كافة التشخيصات والملاحظات والروشتات هنا تلقائياً.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {historyItems.map((visit, index) => {
              const visitPrescriptions = visit.prescriptions || [];
              const isOpen = visit.status === 'OPEN';

              return (
                <Card key={visit.id} className="border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <CardHeader className="py-3 px-5 bg-muted/30 border-b flex flex-row items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <span className="size-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                        {totalVisits - index}
                      </span>
                      <div>
                        <span className="font-bold text-sm text-foreground">
                          كشف طبي — {formatDate(visit.createdAt)}
                        </span>
                        <span className="text-xs text-muted-foreground ms-2 font-mono">
                          {formatTime(visit.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={isOpen ? 'default' : 'secondary'} className={isOpen ? 'bg-blue-600' : ''}>
                        {isOpen ? 'كشف جارٍ (مفتوح)' : 'مكتمل ومغلق'}
                      </Badge>

                      <Button size="sm" variant="outline" asChild className="h-8 gap-1 text-xs">
                        <Link href={`/doctor/visits/${visit.id}`}>
                          <ExternalLink className="size-3.5" />
                          فتح شاشة الكشف
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 space-y-4">
                    {/* Complaint & Diagnosis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-lg bg-muted/20 border p-3.5 space-y-1">
                        <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                          <FileText className="size-3.5 text-primary" />
                          الشكوى الرئيسية (Complaint)
                        </p>
                        <p className="text-sm text-foreground font-medium">
                          {visit.complaint || '— لا توجد شكوى مسجلة —'}
                        </p>
                      </div>

                      <div className="rounded-lg bg-primary/5 border border-primary/20 p-3.5 space-y-1">
                        <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                          <CheckCircle2 className="size-3.5 text-primary" />
                          التشخيص الطبي (Diagnosis)
                        </p>
                        <p className="text-sm text-foreground font-bold">
                          {visit.diagnosis || '— لا يوجد تشخيص مسجل —'}
                        </p>
                      </div>
                    </div>

                    {/* Examination Notes & Instructions */}
                    {(visit.notes || visit.instructions || visit.followUpDate) && (
                      <div className="space-y-2 text-xs pt-1 border-t">
                        {visit.notes && (
                          <div className="flex items-start gap-2 text-muted-foreground">
                            <span className="font-bold text-foreground shrink-0">ملاحظات الفحص:</span>
                            <span className="text-foreground/90">{visit.notes}</span>
                          </div>
                        )}
                        {visit.instructions && (
                          <div className="flex items-start gap-2 text-muted-foreground">
                            <span className="font-bold text-emerald-700 shrink-0">تعليمات للمريض:</span>
                            <span className="text-emerald-900">{visit.instructions}</span>
                          </div>
                        )}
                        {visit.followUpDate && (
                          <div className="flex items-center gap-2 text-primary font-bold">
                            <Calendar className="size-3.5" />
                            <span>موعد الاستشارة / المتابعة: {formatDate(visit.followUpDate)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Prescriptions under this visit */}
                    {visitPrescriptions.length > 0 && (
                      <div className="pt-3 border-t space-y-2.5">
                        <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Pill className="size-4 text-emerald-600" />
                          الروشتة والعلاج المصروف ({visitPrescriptions.length} روشتة)
                        </p>

                        <div className="space-y-2">
                          {visitPrescriptions.map((rx) => (
                            <div key={rx.id} className="rounded-lg border bg-emerald-50/30 p-3 text-xs space-y-2">
                              <div className="flex items-center justify-between text-muted-foreground border-b pb-1.5">
                                <span className="font-bold text-emerald-900">
                                  روشتة إصدار (v{rx.versionNumber})
                                </span>
                                <span>{formatDate(rx.createdAt)}</span>
                              </div>

                              <div className="divide-y divide-emerald-100">
                                {rx.items.map((item, idx) => (
                                  <div key={item.id || idx} className="py-1.5 first:pt-0 last:pb-0 flex items-start justify-between gap-2">
                                    <div>
                                      <span className="font-bold text-foreground text-sm">{item.drugName}</span>
                                      <span className="text-muted-foreground ms-2 font-mono">
                                        ({item.dose} — {item.frequency} — {item.duration})
                                      </span>
                                      {item.instructions && (
                                        <p className="text-emerald-700 text-[11px] mt-0.5">ℹ {item.instructions}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {rx.notes && (
                                <p className="text-muted-foreground text-[11px] pt-1 border-t border-emerald-100">
                                  <span className="font-semibold text-foreground">توصيات: </span>
                                  {rx.notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
