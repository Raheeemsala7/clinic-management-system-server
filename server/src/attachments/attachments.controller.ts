import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { Role } from '@prisma/client';
import { AttachmentsService } from './attachments.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ReqIp } from 'src/common/decorators/req-ip.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@ApiTags('Attachments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class AttachmentsController {
  constructor(private service: AttachmentsService) {}

  @Post('visits/:visitId/attachments')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @UseInterceptors(FileInterceptor('file', { storage: undefined, limits: { fileSize: 10 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload attachment [A,D]' })
  async upload(
    @Param('visitId') visitId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
    @ReqIp() ip: string,
  ) {
    return this.service.upload(visitId, file, user, ip);
  }

  @Get('attachments/:id')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiOperation({ summary: 'Stream attachment [A,D]' })
  async stream(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ) {
    const { stream, attachment } = await this.service.stream(id, user);
    res.setHeader('Content-Type', attachment.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${attachment.fileName}"`);
    (stream as NodeJS.ReadableStream).pipe(res);
  }

  @Delete('attachments/:id')
  @Roles(Role.ADMIN, Role.DOCTOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete attachment [A,D]' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @ReqIp() ip: string,
  ) {
    return this.service.softDelete(id, user, ip);
  }
}
