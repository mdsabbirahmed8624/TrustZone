import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SLAService } from '../services/sla.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('support/sla')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SLAController {
  constructor(private readonly slaService: SLAService) {}

  @Post()
  @Permissions('support:write')
  @HttpCode(HttpStatus.OK)
  async upsertSLA(
    @Body()
    body: {
      priority: string;
      targetResponseHours: number;
      targetResolutionHours: number;
    },
  ) {
    return this.slaService.upsertSLA(
      body.priority,
      body.targetResponseHours,
      body.targetResolutionHours,
    );
  }

  @Post('evaluate/:id')
  @Permissions('support:write')
  @HttpCode(HttpStatus.OK)
  async evaluateSLA(@Param('id') ticketId: string) {
    return this.slaService.evaluateTicketSLA(ticketId);
  }
}
