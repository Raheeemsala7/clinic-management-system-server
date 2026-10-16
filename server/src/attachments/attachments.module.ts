import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AttachmentsController } from './attachments.controller';
import { AttachmentsService } from './attachments.service';
import { AuditModule } from 'src/audit/audit.module';
import { STORAGE_SERVICE } from './storage/storage.interface';
import { LocalStorageService } from './storage/local-storage.service';
import { S3StorageService } from './storage/s3-storage.service';

@Module({
  imports: [AuditModule],
  controllers: [AttachmentsController],
  providers: [
    {
      provide: STORAGE_SERVICE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const driver = configService.get<string>('storage.driver', 'local');
        if (driver === 's3') {
          return new S3StorageService(configService);
        }
        return new LocalStorageService(configService);
      },
    },
    AttachmentsService,
  ],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}
