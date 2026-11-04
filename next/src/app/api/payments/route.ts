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
    const date = searchParams.get('date') || '';
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '50';

    const apiUrl = process.env.API_URL || 'http://localhost:4000/api/v1';
    const url = new URL(`${apiUrl}/payments`);
    if (date) url.searchParams.set('date', date);
    url.searchParams.set('page', page);
    url.searchParams.set('pageSize', pageSize);

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      cache: 'no-store',
    });

    const data = await res.json();

    if (res.status === 401 || data.code === 401) {
      return NextResponse.json(data, { status: 401 });
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error?.message || 'Failed to fetch payments',
        status: false,
      },
      { status: 500 }
    );
  }
}

