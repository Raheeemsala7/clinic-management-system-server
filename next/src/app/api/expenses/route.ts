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
    const status = searchParams.get('status') || '';
    const from = searchParams.get('from') || '';
    const to = searchParams.get('to') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '50';

    const apiUrl = process.env.API_URL || 'http://localhost:4000/api/v1';
    const url = new URL(`${apiUrl}/expenses`);
    if (status && status !== 'all') url.searchParams.set('status', status);
    if (from) url.searchParams.set('from', from);
    if (to) url.searchParams.set('to', to);
    if (categoryId) url.searchParams.set('categoryId', categoryId);
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
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error?.message || 'Failed to fetch expenses',
        status: false,
      },
      { status: 500 }
    );
  }
}

