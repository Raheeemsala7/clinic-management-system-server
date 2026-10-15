import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum DoctorStatusInput {
  AVAILABLE = 'AVAILABLE',
  BREAK = 'BREAK',
}

export class SetDoctorStatusDto {
  @ApiProperty({ enum: DoctorStatusInput })
  @IsEnum(DoctorStatusInput)
  status: DoctorStatusInput;
}
