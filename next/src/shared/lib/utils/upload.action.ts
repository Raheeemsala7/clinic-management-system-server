'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export interface PresignedUrlResponse {
  success: boolean;
  uploadUrl?: string;
  fileUrl?: string;
  fileKey?: string;
  error?: string;
}

export async function getPresignedUploadUrlAction(params: {
  fileName: string;
  mimeType: string;
  folder?: string;
}): Promise<PresignedUrlResponse> {
  try {
    const session = await getServerSession(authOptions);
    const token = (session as { accessToken?: string } | null)?.accessToken;

    const apiUrl = process.env.API_URL || 'http://localhost:4000/api/v1';
    const res = await fetch(`${apiUrl}/attachments/presigned-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        fileName: params.fileName,
        mimeType: params.mimeType,
        folder: params.folder || 'appointments',
      }),
      cache: 'no-store',
    });

    const json = await res.json();
    if (!res.ok || !json.status) {
      return {
        success: false,
        error: json.message || 'فشل توليد رابط رفع الملف',
      };
    }

    return {
      success: true,
      uploadUrl: json.payload.uploadUrl,
      fileUrl: json.payload.fileUrl,
      fileKey: json.payload.fileKey,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'خطأ أثناء الاتصال بالخادم';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

