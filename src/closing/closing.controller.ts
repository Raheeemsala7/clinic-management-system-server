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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ClosingService } from './closing.service';
import { CreateClosingDto } from './dto/create-closing.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ReqIp } from 'src/common/decorators/req-ip.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@ApiTags('Closing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('closing')
export class ClosingController {
  constructor(private service: ClosingService) {}

  @Get('preview')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Preview closing for a date [A]' })
  async preview(@Query('date') date: string) {
    return this.service.getPreview(date);
  }

  @Post()
  @Roles(Role.ADMIN, Role.RECEPTION)
  @ApiOperation({ summary: 'Submit daily closing [A,R]' })
  async close(
    @Body() dto: CreateClosingDto,
    @CurrentUser() user: JwtPayload,
    @ReqIp() ip: string,
  ) {
    return this.service.close(dto, user, ip);
  }

  @Post(':id/reopen')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reopen a closed day [A]' })
  async reopen(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @ReqIp() ip: string,
  ) {
    return this.service.reopen(id, user, ip);
  }
}
