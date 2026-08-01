import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ReportService, CreateReportDto } from './services/report.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportsController {
  constructor(private readonly reportService: ReportService) {}

  @Post('schedule')
  @Permissions('write:reports')
  @HttpCode(HttpStatus.CREATED)
  async createSchedule(
    @Body() dto: CreateReportDto,
    @CurrentUser('branchId') branchId?: string,
    @CurrentUser('role') role?: string,
  ) {
    const enforcedBranchId =
      role === 'Branch Manager' ? branchId : dto.branchId;

    return {
      success: true,
      data: await this.reportService.createScheduledReport({
        ...dto,
        branchId: enforcedBranchId,
      }),
    };
  }

  @Get('schedule')
  @Permissions('read:reports')
  @HttpCode(HttpStatus.OK)
  async getSchedules() {
    return {
      success: true,
      data: await this.reportService.getScheduledReports(),
    };
  }

  @Post(':id/trigger')
  @Permissions('write:reports')
  @HttpCode(HttpStatus.CREATED)
  async triggerReport(
    @Param('id') id: string,
    @Body('format') format: 'PDF' | 'EXCEL' | 'CSV' | 'JSON',
    @CurrentUser('id') userId: string,
  ) {
    return {
      success: true,
      data: await this.reportService.triggerReportGeneration(
        id,
        format,
        userId,
      ),
    };
  }
}
