import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IntegrationService } from '../services/integration.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('integrations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class IntegrationsController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Get('providers')
  @Permissions('integrations:read')
  async getProviders() {
    return this.integrationService.getProviders();
  }

  @Post('credentials')
  @Permissions('integrations:write')
  @HttpCode(HttpStatus.OK)
  async configureCredential(
    @Body()
    body: {
      providerCode: string;
      environment: 'SANDBOX' | 'PRODUCTION';
      apiKey?: string;
      apiSecret?: string;
      endpointUrl?: string;
      configJson?: any;
    },
  ) {
    return this.integrationService.configureCredential(
      body.providerCode,
      body.environment || 'SANDBOX',
      body.apiKey,
      body.apiSecret,
      body.endpointUrl,
      body.configJson,
    );
  }

  @Post('test')
  @Permissions('integrations:write')
  @HttpCode(HttpStatus.OK)
  async testConnection(
    @Body()
    body: {
      providerCode: string;
      environment?: 'SANDBOX' | 'PRODUCTION';
    },
  ) {
    return this.integrationService.testConnection(
      body.providerCode,
      body.environment || 'SANDBOX',
    );
  }

  @Post('rotate-secret')
  @Permissions('integrations:write')
  @HttpCode(HttpStatus.OK)
  async rotateSecret(
    @Body()
    body: {
      providerCode: string;
      environment?: 'SANDBOX' | 'PRODUCTION';
    },
  ) {
    return this.integrationService.rotateSecret(
      body.providerCode,
      body.environment || 'SANDBOX',
    );
  }
}
