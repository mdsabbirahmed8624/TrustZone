import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MaintenanceService } from '../services/maintenance.service';
import { WorkOrderService } from '../services/work-order.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('assets/maintenance')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MaintenanceController {
  constructor(
    private readonly maintenanceService: MaintenanceService,
    private readonly workOrderService: WorkOrderService,
  ) {}

  @Post('log')
  @Permissions('assets:write')
  @HttpCode(HttpStatus.CREATED)
  async logMaintenance(
    @Body()
    body: {
      assetId: string;
      description: string;
      maintenanceType?: string;
      cost?: number;
      downtimeHours?: number;
      performedBy: string;
    },
  ) {
    return this.maintenanceService.logMaintenance(body);
  }

  @Post('schedules')
  @Permissions('assets:write')
  @HttpCode(HttpStatus.CREATED)
  async createSchedule(
    @Body() body: { assetId: string; taskName: string; frequencyDays?: number },
  ) {
    return this.maintenanceService.createSchedule(
      body.assetId,
      body.taskName,
      body.frequencyDays,
    );
  }

  @Post('technicians')
  @Permissions('assets:write')
  @HttpCode(HttpStatus.CREATED)
  async registerTechnician(
    @Body() body: { name: string; specialization: string; phone?: string },
  ) {
    return this.workOrderService.registerTechnician(
      body.name,
      body.specialization,
      body.phone,
    );
  }

  @Post('work-orders')
  @Permissions('assets:write')
  @HttpCode(HttpStatus.CREATED)
  async createWorkOrder(
    @Body()
    body: {
      assetId: string;
      description: string;
      priority?: string;
      technicianId?: string;
      partsCost?: number;
      laborCost?: number;
    },
  ) {
    return this.workOrderService.createWorkOrder(body);
  }
}
