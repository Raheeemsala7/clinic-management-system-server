import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'Dr. Ahmed Hassan' })
  @IsString()
  @MaxLength(128)
  name!: string;

  @ApiProperty({ example: 'doctor1' })
  @IsString()
  @MaxLength(64)
  username!: string;

  @ApiProperty({ example: 'Secure@12345' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role!: Role;
}
