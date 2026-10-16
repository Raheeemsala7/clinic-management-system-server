import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { DrugsService } from './drugs.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('Drugs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('drugs')
export class DrugsController {
  constructor(private drugsService: DrugsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Search drug catalog (autocomplete) [A,D]' })
  @ApiQuery({ name: 'q', required: false })
  async search(@Query('q') q = '') {
    return this.drugsService.search(q);
  }
}
