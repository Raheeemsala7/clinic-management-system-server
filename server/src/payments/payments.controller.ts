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
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VoidPaymentDto } from './dto/void-payment.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ReqIp } from 'src/common/decorators/req-ip.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class PaymentsController {
  constructor(private service: PaymentsService) {}

  @Post('appointments/:id/payments')
  @Roles(Role.ADMIN, Role.RECEPTION)
  @ApiOperation({ summary: 'Record payment for appointment [A,R]' })
  async create(
    @Param('id') id: string,
    @Body() dto: CreatePaymentDto,
    @CurrentUser() user: JwtPayload,
    @ReqIp() ip: string,
  ) {
    return this.service.create(id, dto, user, ip);
  }

  @Get('payments')
  @Roles(Role.ADMIN, Role.RECEPTION)
  @ApiOperation({ summary: 'List payments [A: any date, R: today only]' })
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query('date') date?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.findAll(user, date, Number(page) || 1, Number(pageSize) || 20);
  }

  @Post('payments/:id/void')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Void payment [A]' })
  async voidPayment(
    @Param('id') id: string,
    @Body() dto: VoidPaymentDto,
    @CurrentUser() user: JwtPayload,
    @ReqIp() ip: string,
  ) {
    return this.service.voidPayment(id, dto, user, ip);
  }
}
