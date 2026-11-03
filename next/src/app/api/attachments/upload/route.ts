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

    const res = await fetch(`${process.env.API_URL}/attachments/upload`, {
      method: 'POST',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.status === 401 || data.code === 401) {
      return NextResponse.json(data, { status: 401 });
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error?.message || 'Failed to upload attachments',
        status: false,
      },
      { status: 500 }
    );
  }
}

