import { fetchDoctorSlotsFromBackend } from '@/features/appointments/apis/doctors.api';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ doctorId: string }> }
) {
  const { doctorId } = await context.params;
  const date = req.nextUrl.searchParams.get('date')?.trim() ?? '';

  if (!doctorId || !date) {
    return NextResponse.json(
      { message: 'doctorId and date are required', status: false },
      { status: 400 }
    );
  }

  const token = await getToken({ req });

  if (!token?.accessToken) {
    return NextResponse.json(
      { message: 'Unauthorized', code: 401, status: false },
      { status: 401 }
    );
  }

  try {
    const result = await fetchDoctorSlotsFromBackend(doctorId, date, token.accessToken);

    if (result && typeof result === 'object' && 'code' in result && result.code === 401) {
      return NextResponse.json(result, { status: 401 });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { message: 'Failed to fetch doctor slots', status: false },
      { status: 500 }
    );
  }
}
