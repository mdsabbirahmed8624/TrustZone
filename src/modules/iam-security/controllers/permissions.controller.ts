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
import { PermissionService } from '../services/permission.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class IamPermissionsController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post('groups')
  @Permissions('permissions:write')
  @HttpCode(HttpStatus.CREATED)
  async createPermissionGroup(
    @Body() body: { name: string; permissions: string[]; description?: string },
  ) {
    return this.permissionService.createPermissionGroup(
      body.name,
      body.permissions,
      body.description,
    );
  }

  @Post('roles/assign')
  @Permissions('permissions:write')
  @HttpCode(HttpStatus.CREATED)
  async assignRole(
    @Body()
    body: {
      userId: string;
      roleName: string;
      department?: string;
      expiresInDays?: number;
    },
    @Request() req: any,
  ) {
    return this.permissionService.assignRole(
      body.userId,
      body.roleName,
      body.department,
      req.user?.id,
      body.expiresInDays,
    );
  }

  @Get('user')
  @Permissions('permissions:read')
  async getUserPermissions(@Request() req: any) {
    return this.permissionService.getUserPermissions(req.user?.id);
  }
}
