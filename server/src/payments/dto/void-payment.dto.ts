import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class VoidPaymentDto {
  @ApiProperty()
  @IsString()
  @MaxLength(512)
  reason!: string;
}
