import { fetchDoctorsFromBackend } from '@/features/appointments/apis/doctors.api';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = await getToken({ req });

  if (!token?.accessToken) {
    return NextResponse.json(
      { message: 'Unauthorized', code: 401, status: false },
      { status: 401 }
    );
  }

  try {
    const result = await fetchDoctorsFromBackend(token.accessToken);

    if (result && typeof result === 'object' && 'code' in result && result.code === 401) {
      return NextResponse.json(result, { status: 401 });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { message: 'Failed to fetch doctors', status: false },
      { status: 500 }
    );
  }
}
