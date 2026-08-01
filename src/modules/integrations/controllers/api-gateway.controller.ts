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
import { ApiGatewayService } from '../services/api-gateway.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('gateway')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Post('keys')
  @Permissions('integrations:write')
  @HttpCode(HttpStatus.CREATED)
  async createApiKey(
    @Body() body: { name: string; scopes?: string[]; rateLimit?: number },
    @Request() req: any,
  ) {
    return this.apiGatewayService.createApiKey(
      body.name,
      req.user?.id || 'sys-user',
      body.scopes || ['read', 'write'],
      body.rateLimit || 100,
    );
  }

  @Get('health')
  @Permissions('integrations:read')
  async getHealthStatus() {
    return this.apiGatewayService.getHealthStatus();
  }

  @Get('analytics')
  @Permissions('integrations:read')
  async getUsageAnalytics() {
    return this.apiGatewayService.getUsageAnalytics();
  }
}
