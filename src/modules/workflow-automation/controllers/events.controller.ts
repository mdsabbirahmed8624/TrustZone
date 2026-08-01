import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EventAutomationService } from '../services/event-automation.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('events')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EventsController {
  constructor(
    private readonly eventAutomationService: EventAutomationService,
  ) {}

  @Get('supported')
  @Permissions('events:read')
  getSupportedEvents() {
    return this.eventAutomationService.getSupportedEvents();
  }

  @Post('emit')
  @Permissions('events:write')
  @HttpCode(HttpStatus.OK)
  async emitEvent(
    @Body() body: { event: string; payload: Record<string, any> },
  ) {
    return this.eventAutomationService.emitEvent(
      body.event,
      body.payload || {},
    );
  }
}
