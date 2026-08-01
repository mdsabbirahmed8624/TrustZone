import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { SecurityMonitoringService } from '../services/security-monitoring.service';
import { RiskEngineService } from '../services/risk-engine.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('security')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SecurityController {
  constructor(
    private readonly monitoringService: SecurityMonitoringService,
    private readonly riskEngineService: RiskEngineService,
  ) {}

  @Get('dashboard')
  @Permissions('security:read')
  async getDashboardMetrics() {
    return this.monitoringService.getSecurityDashboardMetrics();
  }

  @Post('risk/eval')
  @Permissions('security:write')
  @HttpCode(HttpStatus.OK)
  async evaluateRisk(
    @Body() body: { ipAddress: string; deviceFingerprint: string },
    @Request() req: any,
  ) {
    return this.riskEngineService.evaluateLoginRisk(
      req.user?.id,
      body.ipAddress,
      body.deviceFingerprint,
    );
  }
}
