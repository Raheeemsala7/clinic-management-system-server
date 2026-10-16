import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, MaxLength } from 'class-validator';

export class TemplateItemDto {
  drugName!: string;
  dose!: string;
  frequency!: string;
  duration!: string;
  instructions?: string;
  sortOrder?: number;
}

export class CreateTemplateDto {
  @ApiProperty()
  @IsString()
  @MaxLength(128)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty()
  @IsArray()
  items!: TemplateItemDto[];
}
