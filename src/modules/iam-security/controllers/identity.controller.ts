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
import { IdentityService } from '../services/identity.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('identity')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Post('profile')
  @Permissions('identity:write')
  @HttpCode(HttpStatus.OK)
  async upsertProfile(
    @Body()
    body: {
      department?: string;
      organizationUnit?: string;
      jobTitle?: string;
      employeeId?: string;
      identityProvider?: string;
    },
    @Request() req: any,
  ) {
    return this.identityService.upsertProfile(
      req.user?.id,
      body.department,
      body.organizationUnit,
      body.jobTitle,
      body.employeeId,
      body.identityProvider || 'LOCAL',
    );
  }

  @Get('profile')
  @Permissions('identity:read')
  async getProfile(@Request() req: any) {
    return this.identityService.getProfile(req.user?.id);
  }

  @Post('link')
  @Permissions('identity:write')
  @HttpCode(HttpStatus.OK)
  async linkExternalIdentity(
    @Body() body: { provider: string; externalSubjectId: string },
    @Request() req: any,
  ) {
    return this.identityService.linkExternalIdentity(
      req.user?.id,
      body.provider,
      body.externalSubjectId,
    );
  }
}
