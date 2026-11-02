import { getPresignedUploadUrlAction } from './upload.action';

export interface UploadResult {
  fileUrl: string;
  fileKey: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

/**
 * Uploads a file directly from browser to Tigris Data S3 using a Presigned URL.
 * Server bandwidth/memory is preserved since bytes go straight to Tigris storage.
 */
export async function uploadFileToTigris(
  file: File,
  folder = 'appointments',
  onProgress?: (progressPercent: number) => void,
): Promise<UploadResult> {
  // 1. Get presigned URL via Next.js Server Action
  const presigned = await getPresignedUploadUrlAction({
    fileName: file.name,
    mimeType: file.type,
    folder,
  });

  if (!presigned.success || !presigned.uploadUrl || !presigned.fileUrl) {
    throw new Error(presigned.error || 'تعذر الحصول على إذن رفع الملف');
  }

  // 2. Upload file directly to Tigris Data via PUT request
  if (onProgress) {
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', presigned.uploadUrl!);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`فشل رفع الملف إلى التخزين السحابي (رمز الخطأ: ${xhr.status})`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('خطأ في الاتصال أثناء رفع الملف إلى التخزين السحابي'));
      };

      xhr.send(file);
    });
  } else {
    const uploadRes = await fetch(presigned.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error(`فشل رفع الملف إلى التخزين السحابي (رمز الخطأ: ${uploadRes.status})`);
    }
  }

  return {
    fileUrl: presigned.fileUrl,
    fileKey: presigned.fileKey || '',
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  };
}

