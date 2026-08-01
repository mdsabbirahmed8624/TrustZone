import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommunicationService } from '../services/communication.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('crm/communications')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CommunicationsController {
  constructor(private readonly communicationService: CommunicationService) {}

  @Post('log')
  @Permissions('crm:write')
  @HttpCode(HttpStatus.CREATED)
  async logCommunication(
    @Body()
    body: {
      customerId?: string;
      channel: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'CALL' | 'MEETING';
      direction?: 'INBOUND' | 'OUTBOUND';
      subject?: string;
      content: string;
      staffName?: string;
    },
  ) {
    return this.communicationService.logCommunication(body);
  }

  @Get('history')
  @Permissions('crm:read')
  async getHistory(
    @Query('customerId') customerId?: string,
    @Query('channel') channel?: string,
  ) {
    return this.communicationService.getHistory(customerId, channel);
  }
}
