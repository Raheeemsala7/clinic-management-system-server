import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsISO8601, IsUUID } from 'class-validator';
import { AppointmentSource, AppointmentType } from '@prisma/client';

export class CreateAppointmentDto {
  @ApiProperty()
  @IsUUID()
  patientId: string;

  @ApiProperty()
  @IsUUID()
  doctorId: string;

  @ApiProperty({ enum: AppointmentSource })
  @IsEnum(AppointmentSource)
  source: AppointmentSource;

  @ApiProperty({ enum: AppointmentType })
  @IsEnum(AppointmentType)
  type: AppointmentType;

  @ApiPropertyOptional({ description: 'ISO 8601 datetime, required for SCHEDULED' })
  @IsOptional()
  @IsISO8601()
  scheduledAt?: string;
}
