import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ReportsService } from './reports.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get('summary')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Summary report [A]' })
  async getSummary(@Query('from') from: string, @Query('to') to: string) {
    return this.service.getSummary(from, to);
  }

  @Get('income-by-day')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Income by day [A]' })
  async getIncomeByDay(@Query('from') from: string, @Query('to') to: string) {
    return this.service.getIncomeByDay(from, to);
  }

  @Get('expenses-by-category')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Expenses by category [A]' })
  async getExpensesByCategory(@Query('from') from: string, @Query('to') to: string) {
    return this.service.getExpensesByCategory(from, to);
  }

  @Get('payments-by-method')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Payments by method [A]' })
  async getPaymentsByMethod(@Query('from') from: string, @Query('to') to: string) {
    return this.service.getPaymentsByMethod(from, to);
  }
}
