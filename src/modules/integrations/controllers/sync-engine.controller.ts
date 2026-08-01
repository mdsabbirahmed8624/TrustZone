import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SyncEngineService } from '../services/sync-engine.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('sync')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SyncEngineController {
  constructor(private readonly syncEngineService: SyncEngineService) {}

  @Post('trigger')
  @Permissions('sync:write')
  @HttpCode(HttpStatus.CREATED)
  async triggerSync(
    @Body()
    body: {
      providerCode: 'QUICKBOOKS' | 'XERO' | 'SHOPIFY' | 'WOOCOMMERCE';
      syncType: 'FULL' | 'INCREMENTAL';
      entityType: 'CUSTOMER' | 'INVOICE' | 'PRODUCT' | 'ORDER';
      environment?: 'SANDBOX' | 'PRODUCTION';
    },
  ) {
    return this.syncEngineService.triggerSync(
      body.providerCode,
      body.syncType || 'INCREMENTAL',
      body.entityType,
      body.environment || 'SANDBOX',
    );
  }

  @Post('resolve')
  @Permissions('sync:write')
  @HttpCode(HttpStatus.OK)
  async resolveConflict(
    @Body()
    body: {
      jobId: string;
      resolutionRule: 'OVERWRITE_ERP' | 'OVERWRITE_EXTERNAL';
    },
  ) {
    return this.syncEngineService.resolveConflict(
      body.jobId,
      body.resolutionRule,
    );
  }

  @Get('dashboard')
  @Permissions('sync:read')
  async getSyncDashboard() {
    return this.syncEngineService.getSyncDashboard();
  }
}
