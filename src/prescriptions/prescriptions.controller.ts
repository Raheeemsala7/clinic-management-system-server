import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ReqIp } from 'src/common/decorators/req-ip.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@ApiTags('Prescriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class PrescriptionsController {
  constructor(private service: PrescriptionsService) {}

  @Post('visits/:visitId/prescriptions')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Create prescription for visit [A,D]' })
  async create(
    @Param('visitId') visitId: string,
    @Body() dto: CreatePrescriptionDto,
    @CurrentUser() user: JwtPayload,
    @ReqIp() ip: string,
  ) {
    return this.service.createForVisit(visitId, dto, user, ip);
  }

  @Get('prescriptions/:id')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Get prescription (print-ready) [A,D]' })
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.service.findOne(id, user);
  }

  @Post('prescriptions/:id/mark-printed')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark prescription as printed [A,D]' })
  async markPrinted(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.service.markPrinted(id, user);
  }

  @Get('patients/:patientId/prescriptions')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'List patient prescriptions [A,D]' })
  async findByPatient(
    @Param('patientId') patientId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    return this.service.findByPatient(patientId, page, pageSize);
  }

  @Get('prescription-templates')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'List prescription templates [A,D]' })
  async getTemplates(@CurrentUser() user: JwtPayload) {
    return this.service.getTemplates(user.sub);
  }

  @Post('prescription-templates')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Create prescription template [A,D]' })
  async createTemplate(
    @Body() dto: CreateTemplateDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.createTemplate(dto, user);
  }

  @Delete('prescription-templates/:id')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete prescription template [A,D]' })
  async deleteTemplate(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.service.deleteTemplate(id, user);
  }
}
