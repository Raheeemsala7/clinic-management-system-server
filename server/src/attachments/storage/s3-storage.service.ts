import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { StorageService } from './storage.interface';
import { Readable } from 'stream';

@Injectable()
export class S3StorageService implements StorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private configService: ConfigService) {
    const cfg = configService.get<{
      endpoint?: string;
      region: string;
      bucket: string;
      accessKey?: string;
      secretKey?: string;
      forcePathStyle: boolean;
    }>('storage.s3')!;

    this.bucket = cfg.bucket;
    this.s3 = new S3Client({
      endpoint: cfg.endpoint,
      region: cfg.region,
      forcePathStyle: cfg.forcePathStyle,
      credentials: cfg.accessKey
        ? { accessKeyId: cfg.accessKey, secretAccessKey: cfg.secretKey ?? '' }
        : undefined,
    });
  }

  async save(key: string, buffer: Buffer, mimeType: string): Promise<void> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );
  }

  async getStream(key: string): Promise<NodeJS.ReadableStream> {
    const response = await this.s3.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    return response.Body as NodeJS.ReadableStream;
  }

  async delete(key: string): Promise<void> {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
