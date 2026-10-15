import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { StorageService } from './storage.interface';
import { Readable } from 'stream';

@Injectable()
export class LocalStorageService implements StorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly basePath: string;

  constructor(private configService: ConfigService) {
    this.basePath = path.resolve(
      configService.get<string>('storage.localPath', './uploads'),
    );
    fs.mkdirSync(this.basePath, { recursive: true });
  }

  async save(key: string, buffer: Buffer, _mimeType: string): Promise<void> {
    const filePath = path.join(this.basePath, key);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, buffer);
  }

  async getStream(key: string): Promise<NodeJS.ReadableStream> {
    const filePath = path.join(this.basePath, key);
    return fs.createReadStream(filePath);
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.basePath, key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
