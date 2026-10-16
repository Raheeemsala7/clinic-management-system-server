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
import { ExpenseStatus, Role } from '@prisma/client';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { RejectExpenseDto } from './dto/reject-expense.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ReqIp } from 'src/common/decorators/req-ip.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ExpensesController {
  constructor(private service: ExpensesService) {}

  @Post('expenses')
  @Roles(Role.ADMIN, Role.RECEPTION)
  @ApiOperation({ summary: 'Create expense [A,R]' })
  async create(
    @Body() dto: CreateExpenseDto,
    @CurrentUser() user: JwtPayload,
    @ReqIp() ip: string,
  ) {
    return this.service.create(dto, user, ip);
  }

  @Get('expenses')
  @Roles(Role.ADMIN, Role.RECEPTION)
  @ApiOperation({ summary: 'List expenses [A: all, R: own today only]' })
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('status') status?: ExpenseStatus,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.findAll(user, {
      from,
      to,
      status,
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 20,
    });
  }

  @Post('expenses/:id/approve')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve expense [A]' })
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @ReqIp() ip: string,
  ) {
    return this.service.approve(id, user, ip);
  }

  @Post('expenses/:id/reject')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject expense [A]' })
  async reject(
    @Param('id') id: string,
    @Body() dto: RejectExpenseDto,
    @CurrentUser() user: JwtPayload,
    @ReqIp() ip: string,
  ) {
    return this.service.reject(id, dto, user, ip);
  }

  @Get('expense-categories')
  @Roles(Role.ADMIN, Role.RECEPTION)
  @ApiOperation({ summary: 'List expense categories [A,R]' })
  async getCategories() {
    return this.service.getCategories();
  }

  @Post('expense-categories')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create expense category [A]' })
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.service.createCategory(dto);
  }
}
