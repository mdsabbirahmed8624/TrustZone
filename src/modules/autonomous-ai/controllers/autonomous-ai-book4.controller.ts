import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  AutonomousAIBook4Service,
  ScheduleMaintenanceDto,
} from '../services/autonomous-ai-book4.service';

@ApiTags('Autonomous AI Predictive Maintenance')
@ApiBearerAuth()
@Controller('autonomous-ai')
export class AutonomousAIBook4Controller {
  constructor(private readonly book4Service: AutonomousAIBook4Service) {}

  @Post('predictive-maintenance')
  @ApiOperation({
    summary: 'Schedule AI autonomous predictive equipment maintenance',
  })
  async schedulePredictiveMaintenance(@Body() dto: ScheduleMaintenanceDto) {
    return this.book4Service.schedulePredictiveMaintenance(dto);
  }

  @Get('predictive-maintenance')
  @ApiOperation({ summary: 'List scheduled predictive maintenance jobs' })
  async getMaintenanceSchedules(@Query('branchId') branchId?: string) {
    return this.book4Service.getMaintenanceSchedules(branchId);
  }

  @Patch('predictive-maintenance/complete/:id')
  @ApiOperation({ summary: 'Mark predictive maintenance job as COMPLETED' })
  async completeMaintenance(@Param('id') id: string) {
    return this.book4Service.completeMaintenance(id);
  }
}
