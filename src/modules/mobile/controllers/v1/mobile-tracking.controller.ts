import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TicketsService } from '../../../tickets/tickets.service';
import { MobileResponseInterceptor } from '../../interceptors/mobile-response.interceptor';
import { MobileExceptionFilter } from '../../filters/mobile-exception.filter';

@ApiTags('Mobile API')
@Controller('mobile/tracking')
@UseInterceptors(MobileResponseInterceptor)
@UseFilters(MobileExceptionFilter)
export class MobileTrackingController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Track a repair ticket status and timeline history',
  })
  @ApiResponse({ status: 200, description: 'Repair tracking details' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async track(@Param('id') id: string) {
    const data = await this.ticketsService.findOne(id);
    return {
      message: 'Repair tracking info retrieved successfully.',
      data,
    };
  }
}
