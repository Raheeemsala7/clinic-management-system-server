import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { VisitsService } from './visits.service';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ReqIp } from 'src/common/decorators/req-ip.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@ApiTags('Visits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('visits')
export class VisitsController {
  constructor(private visitsService: VisitsService) {}

  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Get visit [A,D]' })
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.visitsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Autosave visit [A,D]' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateVisitDto,
    @CurrentUser() user: JwtPayload,
    @ReqIp() ip: string,
  ) {
    return this.visitsService.update(id, dto, user, ip);
  }

  @Post(':id/close')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Close visit [A,D]' })
  async close(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @ReqIp() ip: string,
  ) {
    return this.visitsService.close(id, user, ip);
  }

  @Post(':id/reopen')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reopen visit [A,D]' })
  async reopen(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @ReqIp() ip: string,
  ) {
    return this.visitsService.reopen(id, user, ip);
  }
}
