import {
  Controller,
  Get,
  Put,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { QueueService } from './queue.service';
import { SetDoctorStatusDto } from './dto/set-doctor-status.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@ApiTags('Queue')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class QueueController {
  constructor(private queueService: QueueService) {}

  @Get('queue/today')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTION)
  @ApiOperation({ summary: "Get today's queue [A,D,R]" })
  async getTodayQueue(
    @Query('doctorId') doctorId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.queueService.getTodayQueue(doctorId, user);
  }

  @Get('doctor-status')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.RECEPTION)
  @ApiOperation({ summary: 'Get doctor status [A,D,R]' })
  async getDoctorStatus(@Query('doctorId') doctorId: string) {
    return this.queueService.getDoctorStatus(doctorId);
  }

  @Put('doctor-status')
  @Roles(Role.DOCTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set doctor status [D] (AVAILABLE or BREAK only)' })
  async setDoctorStatus(
    @Body() dto: SetDoctorStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.queueService.setDoctorStatus(user.sub, dto.status);
  }
}
