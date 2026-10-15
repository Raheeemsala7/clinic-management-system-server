import { Module } from '@nestjs/common';
import { PrescriptionsController } from './prescriptions.controller';
import { PrescriptionsService } from './prescriptions.service';
import { AuditModule } from 'src/audit/audit.module';
import { SettingsModule } from 'src/settings/settings.module';

@Module({
  imports: [AuditModule, SettingsModule],
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService],
  exports: [PrescriptionsService],
})
export class PrescriptionsModule {}
