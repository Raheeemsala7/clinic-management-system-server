import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { ar } from '@/messages/ar';
import { VisitEditor } from './visit-editor';
import { PrescriptionManager, type Prescription } from './prescription-manager';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { computeAge } from '@/lib/utils';
import { AlertCircle, HeartPulse, Stethoscope, ArrowRight, UserCheck, FileText } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export interface Visit {
  id: string;
  appointmentId: string;
  patientId: string;
  complaint: string | null;
  diagnosis: string | null;
  notes: string | null;
  instructions: string | null;
  followUpDate: string | null;
  status: 'OPEN' | 'CLOSED';
  version: number;
  patient: {
    fullName: string;
    dateOfBirth: string | null;
    gender: string;
    allergies: string[];
    chronicConditions: string[];
    generalNotes: string | null;
  };
  doctor?: {
    id: string;
    name: string;
  };
  prescriptions?: Prescription[];
}

export default async function VisitPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(['DOCTOR', 'ADMIN']);
  const { id } = await params;

  const visit = await api.get<Visit>(`/visits/${id}`);
  const age = visit.patient.dateOfBirth ? computeAge(visit.patient.dateOfBirth) : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Bar with Back Link */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Link href="/doctor">
            <ArrowRight className="size-4" />
            العودة لشاشة كشف اليوم
          </Link>
        </Button>
        <Badge variant={visit.status === 'OPEN' ? 'default' : 'outline'} className={visit.status === 'OPEN' ? 'bg-blue-600' : ''}>
          {visit.status === 'OPEN' ? 'كشف جارٍ (مفتوح)' : 'كشف منتهٍ (مغلق)'}
        </Badge>
      </div>

      {/* Patient Header Card */}
      <Card className="shadow-sm border-2 border-primary/20">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <Link
              href={`/doctor/patients/${visit.patientId}`}
              className="flex items-center gap-3.5 group hover:opacity-90 transition-opacity"
            >
              <div className="size-12 rounded-full bg-primary/10 text-primary font-bold text-lg flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {visit.patient.fullName.slice(0, 2)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {visit.patient.fullName}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {visit.patient.gender === 'MALE' ? ar.patients.male : ar.patients.female}
                  {age !== null && ` • ${age} ${ar.patients.years}`}
                </p>
              </div>
            </Link>

            {/* Medical Alerts & Patient Record Link */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-1.5 font-bold text-xs border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm"
              >
                <Link href={`/doctor/patients/${visit.patientId}`}>
                  <FileText className="size-3.5" />
                  زيارات وتقرير المريض
                </Link>
              </Button>

              {visit.patient.allergies && visit.patient.allergies.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-100 text-red-900 border border-red-300 text-xs font-bold">
                  <AlertCircle className="size-3.5 text-red-600 shrink-0" />
                  <span>حساسية: {visit.patient.allergies.join('، ')}</span>
                </div>
              )}

              {visit.patient.chronicConditions && visit.patient.chronicConditions.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold">
                  <HeartPulse className="size-3.5 text-amber-600 shrink-0" />
                  <span>أمراض مزمنة: {visit.patient.chronicConditions.join('، ')}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 1: Clinical Notes & Examination */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Stethoscope className="size-5 text-primary" />
            الفحص السريري والملاحظات الطبية
          </CardTitle>
          <CardDescription className="text-xs">
            تسجيل الشكوى والتشخيص والملاحظات والتعليمات الطبية للمريض
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <VisitEditor visit={visit} />
        </CardContent>
      </Card>

      {/* Section 2: Prescription Manager (Writing & Printing) */}
      <PrescriptionManager
        visitId={visit.id}
        patientName={visit.patient.fullName}
        patientAge={age}
        patientGender={visit.patient.gender}
        doctorName={user.name}
        initialPrescriptions={visit.prescriptions ?? []}
        isClosed={visit.status === 'CLOSED'}
      />
    </div>
  );
}
