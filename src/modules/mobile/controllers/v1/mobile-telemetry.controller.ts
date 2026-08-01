import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import {
  TelemetryTrackerService,
  RecordTelemetryDto,
} from '../../services/telemetry-tracker.service';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { MobileResponseInterceptor } from '../../interceptors/mobile-response.interceptor';
import { MobileExceptionFilter } from '../../filters/mobile-exception.filter';

@ApiTags('Technician Telemetry Logs')
@ApiBearerAuth()
@Controller('mobile/telemetry')
@UseGuards(JwtAuthGuard)
@UseInterceptors(MobileResponseInterceptor)
@UseFilters(MobileExceptionFilter)
export class MobileTelemetryController {
  constructor(private readonly telemetryService: TelemetryTrackerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Log a technician task action' })
  async recordAction(
    @CurrentUser('id') technicianId: string,
    @Body() dto: RecordTelemetryDto,
  ) {
    const log = await this.telemetryService.recordTelemetry(technicianId, dto);
    return {
      message: 'Telemetry log registered successfully.',
      data: log,
    };
  }

  @Get('metrics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieve technician performance analytics metrics',
  })
  async getMetrics(@CurrentUser('id') technicianId: string) {
    const metrics =
      await this.telemetryService.getTechnicianPerformanceMetrics(technicianId);
    return {
      message: 'Technician performance metrics calculated.',
      data: metrics,
    };
  }
}
