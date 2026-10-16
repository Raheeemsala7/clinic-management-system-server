import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsISO8601, IsInt, Min } from 'class-validator';

export class UpdateVisitDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  complaint?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  followUpDate?: string;

  @ApiProperty({ description: 'Current version for optimistic locking' })
  @IsInt()
  @Min(1)
  version!: number;
}
