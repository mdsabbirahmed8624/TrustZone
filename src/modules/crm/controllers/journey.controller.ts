import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CustomerJourneyService } from '../services/customer-journey.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('crm/journey')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class JourneyController {
  constructor(private readonly journeyService: CustomerJourneyService) {}

  @Get('customer/:id')
  @Permissions('crm:read')
  async getCustomerJourney(@Param('id') customerId: string) {
    return this.journeyService.getCustomerJourney(customerId);
  }

  @Post('touchpoints')
  @Permissions('crm:write')
  @HttpCode(HttpStatus.CREATED)
  async logTouchpoint(
    @Body()
    body: {
      customerId: string;
      channel: string;
      title: string;
      description?: string;
      metadata?: any;
    },
  ) {
    return this.journeyService.logTouchpoint(
      body.customerId,
      body.channel,
      body.title,
      body.description,
      body.metadata,
    );
  }
}
