import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { PredictionService } from '../services/prediction.service';
import { MaintenancePredictionService } from '../services/maintenance-prediction.service';
import { CustomerInsightService } from '../services/customer-insight.service';

@Controller('predictions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PredictionsController {
  constructor(
    private readonly predictionService: PredictionService,
    private readonly maintenanceService: MaintenancePredictionService,
    private readonly customerService: CustomerInsightService,
  ) {}

  @Post('fault/:ticketId')
  @Permissions('read:reports')
  @HttpCode(HttpStatus.OK)
  async predictFault(@Param('ticketId') ticketId: string) {
    return {
      success: true,
      data: await this.predictionService.predictFault(ticketId),
    };
  }

  @Post('failures/:deviceId')
  @Permissions('read:reports')
  @HttpCode(HttpStatus.OK)
  async predictDeviceFailures(@Param('deviceId') deviceId: string) {
    return {
      success: true,
      data: await this.maintenanceService.predictDeviceFailures(deviceId),
    };
  }

  @Get('customer/:customerId')
  @Permissions('read:reports')
  @HttpCode(HttpStatus.OK)
  async getCustomerInsight(@Param('customerId') customerId: string) {
    return {
      success: true,
      data: await this.customerService.calculateInsights(customerId),
    };
  }
}
