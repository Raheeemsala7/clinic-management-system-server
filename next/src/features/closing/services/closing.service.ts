import { ClosingPreview, DailyClosingItem } from '../types/closing';

export async function fetchClosingPreviewService(date?: string): Promise<ClosingPreview> {
  const queryStr = date ? `?date=${encodeURIComponent(date)}` : '';
  const res = await fetch(`/api/closing/preview${queryStr}`, { method: 'GET' });

  if (!res.ok) {
    if (res.status === 401) throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول');
    throw new Error('فشل جلب ملخص الإغلاق');
  }

  const json = await res.json();
  return json?.payload || json?.data;
}

export async function fetchClosingStatusService(date?: string): Promise<DailyClosingItem | null> {
  const queryStr = date ? `?date=${encodeURIComponent(date)}` : '';
  const res = await fetch(`/api/closing/preview${queryStr}`, { method: 'GET' });

  if (!res.ok) {
    throw new Error('فشل جلب حالة الإغلاق');
  }

  const json = await res.json();
  const preview: ClosingPreview = json?.payload || json?.data;
  return preview?.closing || null;
}

