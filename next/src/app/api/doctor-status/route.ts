import { HEADERS } from '@/shared/constant/api.constant';
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
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId') || '';

    const apiUrl = process.env.API_URL || 'http://localhost:4000/api/v1';
    const url = new URL(`${apiUrl}/doctor-status`);
    if (doctorId) url.searchParams.set('doctorId', doctorId);

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || 'Failed to fetch doctor status', status: false },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const token = await getToken({ req });

  if (!token?.accessToken) {
    return NextResponse.json(
      { message: 'Unauthorized', code: 401, status: false },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const apiUrl = process.env.API_URL || 'http://localhost:4000/api/v1';

    const res = await fetch(`${apiUrl}/doctor-status`, {
      method: 'PUT',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || 'Failed to update doctor status', status: false },
      { status: 500 }
    );
  }
}

