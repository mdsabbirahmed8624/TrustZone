import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EscalationService } from '../services/escalation.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('support/escalations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EscalationsController {
  constructor(private readonly escalationService: EscalationService) {}

  @Post(':id')
  @Permissions('support:write')
  @HttpCode(HttpStatus.OK)
  async escalateTicket(
    @Param('id') ticketId: string,
    @Body() body: { escalatedTo: string; reason: string; level?: number },
  ) {
    return this.escalationService.escalateTicket(
      ticketId,
      body.escalatedTo,
      body.reason,
      body.level,
    );
  }
}
