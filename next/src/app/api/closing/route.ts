import { HEADERS } from '@/shared/constant/api.constant';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
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

    const res = await fetch(`${apiUrl}/closing`, {
      method: 'POST',
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
      {
        message: error?.message || 'Failed to close day',
        status: false,
      },
      { status: 500 }
    );
  }
}
