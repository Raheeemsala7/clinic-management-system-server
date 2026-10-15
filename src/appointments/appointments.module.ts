import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { AuditModule } from 'src/audit/audit.module';
import { RealtimeModule } from 'src/realtime/realtime.module';

@Module({
  imports: [AuditModule, RealtimeModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
