import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ForecastService } from './services/forecast.service';

@Controller('forecast')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ForecastController {
  constructor(private readonly forecastService: ForecastService) {}

  @Get('project')
  @Permissions('read:reports')
  @HttpCode(HttpStatus.OK)
  async getProjection(
    @Query('type') type: 'REVENUE' | 'INVENTORY' | 'PROCUREMENT' | 'WORKLOAD',
    @Query('branchId') branchId?: string,
    @CurrentUser() staff?: any,
  ) {
    const enforcedBranchId =
      staff?.role === 'Branch Manager' ? staff.branchId : branchId;

    return {
      success: true,
      data: await this.forecastService.generateForecast(type, enforcedBranchId),
    };
  }
}
