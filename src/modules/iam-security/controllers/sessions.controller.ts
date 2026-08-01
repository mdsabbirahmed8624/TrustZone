import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { SessionService } from '../services/session.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('sessions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SessionsController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('active')
  @Permissions('sessions:read')
  async getActiveSessions(@Request() req: any) {
    return this.sessionService.getUserActiveSessions(req.user?.id);
  }

  @Post(':id/revoke')
  @Permissions('sessions:write')
  @HttpCode(HttpStatus.OK)
  async revokeSession(@Param('id') id: string) {
    return this.sessionService.revokeSession(id);
  }

  @Post('revoke-all')
  @Permissions('sessions:write')
  @HttpCode(HttpStatus.OK)
  async revokeAllSessions(@Request() req: any) {
    return this.sessionService.revokeAllUserSessions(req.user?.id);
  }
}
