import path from 'path';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';
import { BadRequestError } from '../utils/errors';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

export interface PresignedUrlResult {
  uploadUrl: string;
  fileUrl: string;
  fileKey: string;
  expiresInSeconds: number;
}

export class StorageService {
  private static s3Client: S3Client | null = null;

  private static getClient(): S3Client {
    if (!this.s3Client) {
      this.s3Client = new S3Client({
        region: config.storage.region || 'auto',
        endpoint: config.storage.endpoint || 'https://t3.storage.dev',
        credentials: {
          accessKeyId: config.storage.accessKeyId,
          secretAccessKey: config.storage.secretAccessKey,
        },
      });
    }
    return this.s3Client;
  }

  /**
   * Generates a Presigned PUT URL allowing clients to upload directly to Tigris Data (S3)
   */
  static async getPresignedUploadUrl(
    fileName: string,
    mimeType: string,
    folder = 'appointments',
  ): Promise<PresignedUrlResult> {
    if (!fileName || !mimeType) {
      throw new BadRequestError('fileName and mimeType are required');
    }

    const cleanMime = mimeType.toLowerCase().trim();
    if (!ALLOWED_MIME_TYPES.includes(cleanMime)) {
      throw new BadRequestError(
        'نوع الملف غير مدعوم، الصيغ المسموح بها هي صور (JPEG, PNG, WebP) وملفات PDF',
      );
    }

    const client = this.getClient();
    const bucket = config.storage.bucketName || 'clinic-uploads-bucket';
    const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
    const uniqueId = uuidv4();
    const fileKey = `${folder}/${uniqueId}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: fileKey,
      ContentType: cleanMime,
    });

    const expiresInSeconds = 300; // 5 minutes
    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: expiresInSeconds,
    });

    // Public readable URL on Tigris S3 endpoint
    const endpointUrl = config.storage.endpoint.replace(/\/+$/, '');
    const fileUrl = `${endpointUrl}/${bucket}/${fileKey}`;

    return {
      uploadUrl,
      fileUrl,
      fileKey,
      expiresInSeconds,
    };
  }

  /**
   * Directly uploads a binary Buffer to Tigris Data (S3)
   */
  static async uploadBuffer(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    folder = 'appointments',
  ): Promise<{ fileUrl: string; fileKey: string; id: string; fileName: string }> {
    const cleanMime = mimeType.toLowerCase().trim();
    if (!ALLOWED_MIME_TYPES.includes(cleanMime)) {
      throw new BadRequestError(
        'نوع الملف غير مدعوم، الصيغ المسموح بها هي صور (JPEG, PNG, WebP) وملفات PDF',
      );
    }

    const client = this.getClient();
    const bucket = config.storage.bucketName || 'clinic-uploads-bucket';
    const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
    const fileId = path.parse(fileName).name || uuidv4();
    const storedFileName = `${fileId}.${extension}`;
    const fileKey = `${folder}/${storedFileName}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: fileKey,
      Body: buffer,
      ContentType: cleanMime,
    });

    await client.send(command);

    const endpointUrl = config.storage.endpoint.replace(/\/+$/, '');
    const fileUrl = `${endpointUrl}/${bucket}/${fileKey}`;

    return {
      fileUrl,
      fileKey,
      id: fileId,
      fileName: storedFileName,
    };
  }

  /**
   * Fetches the S3 object from Tigris as a readable stream
   */
  static async getFileStream(
    fileKey: string,
  ): Promise<{ stream: any; contentType: string; contentLength?: number }> {
    const client = this.getClient();
    const bucket = config.storage.bucketName || 'clinic-uploads-bucket';
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: fileKey,
    });
    const res = await client.send(command);
    return {
      stream: res.Body,
      contentType: res.ContentType || 'application/octet-stream',
      contentLength: res.ContentLength,
    };
  }

  /**
   * Deletes a file from Tigris Data if needed
   */
  static async deleteFile(fileKey: string): Promise<void> {
    const client = this.getClient();
    const bucket = config.storage.bucketName || 'clinic-uploads-bucket';

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: fileKey,
    });

    await client.send(command);
  }
}

