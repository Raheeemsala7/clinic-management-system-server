import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ReqIp } from 'src/common/decorators/req-ip.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@ApiTags('Patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients')
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTION)
  @ApiOperation({ summary: 'Create patient [A,D,R]' })
  async create(
    @Body() dto: CreatePatientDto,
    @CurrentUser() user: JwtPayload,
    @ReqIp() ip: string,
  ) {
    return this.patientsService.create(dto, user, ip);
  }

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTION)
  @ApiOperation({ summary: 'Search patients [A,D,R]' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async search(
    @Query('q') q = '',
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.patientsService.search(q, user, page, pageSize);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTION)
  @ApiOperation({ summary: 'Get patient by ID [A,D,R] (R: basic fields only)' })
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.patientsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTION)
  @ApiOperation({ summary: 'Update patient [A,D,R] (R cannot update medical fields)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
    @CurrentUser() user: JwtPayload,
    @ReqIp() ip: string,
  ) {
    return this.patientsService.update(id, dto, user, ip);
  }

  @Get(':id/history')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Get patient visit history [A,D]' })
  async getHistory(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    return this.patientsService.getHistory(id, user, page, pageSize);
  }

  @Get(':id/summary')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Get patient summary card [A,D]' })
  async getSummary(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.patientsService.getSummary(id, user);
  }
}
