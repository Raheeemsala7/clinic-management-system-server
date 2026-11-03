import { signOut } from 'next-auth/react';

export interface UploadedAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

/**
 * تحويل كائن الملف في المتصفح (File) إلى صيغة Base64 Data URL
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
  });
}

/**
 * إرسال الملفات المحولة إلى مسار الرفع في الخادم
 */
export async function uploadAttachmentsApi(
  files: Array<{ name: string; data: string }>
): Promise<UploadedAttachment[]> {
  if (!files || files.length === 0) return [];

  const response = await fetch('/api/attachments/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ files }),
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      await signOut({ callbackUrl: '/auth/login?expired=true' });
    }
    throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
  }

  const data: ApiResponse<{ attachments: UploadedAttachment[] }> = await response.json();

  if (
    data.code === 401 ||
    data.message === 'Invalid or expired access token' ||
    data.message === 'No token provided.' ||
    data.message === 'Unauthorized'
  ) {
    if (typeof window !== 'undefined') {
      await signOut({ callbackUrl: '/auth/login?expired=true' });
    }
    throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
  }

  if (!data.status) {
    throw new Error(data.message || 'فشل رفع الملفات');
  }

  return data.payload?.attachments || [];
}

