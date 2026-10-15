import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AppointmentStatus, Role } from '@prisma/client';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ReqIp } from 'src/common/decorators/req-ip.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private service: AppointmentsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.RECEPTION)
  @ApiOperation({ summary: 'Create appointment [A,R]' })
  async create(
    @Body() dto: CreateAppointmentDto,
    @CurrentUser() user: JwtPayload,
    @ReqIp() ip: string,
  ) {
    return this.service.create(dto, user, ip);
  }

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTION)
  @ApiOperation({ summary: 'List appointments [A,D,R]' })
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'status', required: false, enum: AppointmentStatus })
  @ApiQuery({ name: 'doctorId', required: false })
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query('date') date?: string,
    @Query('status') status?: AppointmentStatus,
    @Query('doctorId') doctorId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize = 20,
  ) {
    return this.service.findAll(user, { date, status, doctorId, page, pageSize });
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTION)
  @ApiOperation({ summary: 'Get appointment [A,D,R]' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/arrive')
  @Roles(Role.ADMIN, Role.RECEPTION)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark patient arrived [A,R]' })
  async arrive(@Param('id') id: string, @CurrentUser() user: JwtPayload, @ReqIp() ip: string) {
    return this.service.transition(id, 'arrive', user, ip);
  }

  @Post(':id/start')
  @Roles(Role.ADMIN, Role.RECEPTION)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Let patient in [A,R]' })
  async start(@Param('id') id: string, @CurrentUser() user: JwtPayload, @ReqIp() ip: string) {
    return this.service.transition(id, 'start', user, ip);
  }

  @Post(':id/complete')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTION)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete appointment [A,D,R]' })
  async complete(@Param('id') id: string, @CurrentUser() user: JwtPayload, @ReqIp() ip: string) {
    return this.service.transition(id, 'complete', user, ip);
  }

  @Post(':id/cancel')
  @Roles(Role.ADMIN, Role.RECEPTION)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel appointment [A,R]' })
  async cancel(
    @Param('id') id: string,
    @Body() _dto: CancelAppointmentDto,
    @CurrentUser() user: JwtPayload,
    @ReqIp() ip: string,
  ) {
    return this.service.transition(id, 'cancel', user, ip);
  }

  @Post(':id/no-show')
  @Roles(Role.ADMIN, Role.RECEPTION)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark no-show [A,R]' })
  async noShow(@Param('id') id: string, @CurrentUser() user: JwtPayload, @ReqIp() ip: string) {
    return this.service.transition(id, 'no-show', user, ip);
  }

  @Post(':id/postpone')
  @Roles(Role.ADMIN, Role.RECEPTION)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Postpone appointment in queue [A,R]' })
  async postpone(@Param('id') id: string, @CurrentUser() user: JwtPayload, @ReqIp() ip: string) {
    return this.service.transition(id, 'postpone', user, ip);
  }
}
