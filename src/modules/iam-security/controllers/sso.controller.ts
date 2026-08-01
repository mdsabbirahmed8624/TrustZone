import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SSOService } from '../services/sso.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('sso')
export class SsoController {
  constructor(private readonly ssoService: SSOService) {}

  @Post('providers')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('sso:write')
  @HttpCode(HttpStatus.CREATED)
  async configureProvider(
    @Body()
    body: {
      code: string;
      name: string;
      clientId: string;
      clientSecret: string;
      redirectUri: string;
      issuerUrl?: string;
    },
  ) {
    return this.ssoService.configureProvider(
      body.code,
      body.name,
      body.clientId,
      body.clientSecret,
      body.redirectUri,
      body.issuerUrl,
    );
  }

  @Post('callback')
  @HttpCode(HttpStatus.OK)
  async processSsoCallback(
    @Body()
    body: {
      code: string;
      externalUser: { id: string; email: string; name: string };
    },
  ) {
    return this.ssoService.processSsoCallback(body.code, body.externalUser);
  }
}
