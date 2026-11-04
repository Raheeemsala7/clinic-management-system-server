import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getPatientDetailsApi } from '@/features/patient/apis/patient.api';
import { PatientProfileView } from '@/features/patient/components/patient-profile-view';
import { ErrorBoundary } from '@/shared/components/error-boundary';
import { TablePatientsError } from '@/features/patient/components/table-patients-error';
import { Loader2 } from 'lucide-react';

interface PatientPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PatientPageProps) {
  const { id } = await params;
  try {
    const details = await getPatientDetailsApi(id);
    return {
      title: `ملف المريض ${details.patient.fullName} | العيادة`,
    };
  } catch {
    return {
      title: 'ملف المريض | العيادة',
    };
  }
}

async function PatientProfileContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let details;
  try {
    details = await getPatientDetailsApi(id);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('NEXT_REDIRECT') ||
        (error as any).digest?.startsWith('NEXT_REDIRECT'))
    ) {
      throw error;
    }
    return notFound();
  }

  return <PatientProfileView details={details} />;
}

export default function ReceptionistPatientDetailsPage({ params }: PatientPageProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <ErrorBoundary errorComponent={TablePatientsError}>
        <Suspense
          fallback={
            <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#0040D8]" />
              <p className="text-sm font-bold text-[#0A164E]">جاري تحميل ملف المريض...</p>
            </div>
          }
        >
          <PatientProfileContent params={params} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

