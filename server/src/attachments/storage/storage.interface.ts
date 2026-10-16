export interface StorageService {
  save(key: string, buffer: Buffer, mimeType: string): Promise<void>;
  getStream(key: string): Promise<NodeJS.ReadableStream>;
  delete(key: string): Promise<void>;
}

export const STORAGE_SERVICE = 'STORAGE_SERVICE';
