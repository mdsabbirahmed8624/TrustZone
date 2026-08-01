import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('export')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('jobs')
  @Permissions('read:support')
  async getExportJobs(@CurrentUser() user: any) {
    const data = await this.exportService.listJobs(user.id);
    return { success: true, data };
  }

  @Post('trigger')
  @HttpCode(HttpStatus.ACCEPTED)
  @Permissions('write:support')
  async triggerExport(
    @CurrentUser() user: any,
    @Body('module') module: string,
    @Body('format') format: 'CSV' | 'EXCEL' | 'PDF',
  ) {
    const data = await this.exportService.triggerExport(
      user.id,
      module,
      format,
    );
    return { success: true, data, message: 'Export job queued in background.' };
  }

  @Get('download/:id')
  @Permissions('read:support')
  async downloadExportFile(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const { filePath, fileName } = await this.exportService.getFilePath(
      id,
      user.id,
    );
    return res.download(filePath, fileName);
  }
}
