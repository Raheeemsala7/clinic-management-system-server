import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ReqIp } from 'src/common/decorators/req-ip.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create user [ADMIN]' })
  async create(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: JwtPayload,
    @ReqIp() ip: string,
  ) {
    return this.usersService.create(dto, user.sub, ip);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List users [ADMIN]' })
  async findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.usersService.findAll(Number(page) || 1, Number(pageSize) || 20);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update user [ADMIN]' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: JwtPayload,
    @ReqIp() ip: string,
  ) {
    return this.usersService.update(id, dto, user.sub, ip);
  }

  @Post(':id/deactivate')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate user [ADMIN]' })
  async deactivate(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @ReqIp() ip: string,
  ) {
    return this.usersService.deactivate(id, user.sub, ip);
  }

  @Post(':id/reset-password')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset user password [ADMIN]' })
  async resetPassword(
    @Param('id') id: string,
    @Body() dto: ResetPasswordDto,
    @CurrentUser() user: JwtPayload,
    @ReqIp() ip: string,
  ) {
    return this.usersService.resetPassword(id, dto.newPassword, user.sub, ip);
  }
}
