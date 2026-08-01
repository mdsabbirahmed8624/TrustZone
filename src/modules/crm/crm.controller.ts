import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CrmService } from './crm.service';
import { AdjustPointsDto } from './dto/adjust-points.dto';
import { RedeemPointsDto } from './dto/redeem-points.dto';
import { CreateCommunicationDto } from './dto/create-communication.dto';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('crm')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get('dashboard/stats')
  @Permissions('read:crm')
  @HttpCode(HttpStatus.OK)
  async getDashboardStats() {
    return {
      success: true,
      data: await this.crmService.getCrmDashboardStats(),
    };
  }

  @Get('loyalty/transactions')
  @Permissions('read:crm')
  @HttpCode(HttpStatus.OK)
  async getLoyaltyTransactions(
    @Query('customerId') customerId?: string,
    @Query('search') search?: string,
    @Query('type') type?: string,
  ) {
    return {
      success: true,
      data: await this.crmService.findAllLoyaltyTransactions({
        customerId,
        search,
        type,
      }),
    };
  }

  @Post('loyalty/adjust')
  @Permissions('write:crm')
  @HttpCode(HttpStatus.OK)
  async adjustPoints(@Body() dto: AdjustPointsDto, @CurrentUser() staff: any) {
    const staffName = staff
      ? `${staff.firstName} ${staff.lastName}`.trim()
      : 'System';
    return {
      success: true,
      data: await this.crmService.adjustPoints(dto, staff?.id, staffName),
    };
  }

  @Post('loyalty/redeem')
  @Permissions('write:crm')
  @HttpCode(HttpStatus.OK)
  async redeemPoints(@Body() dto: RedeemPointsDto, @CurrentUser() staff: any) {
    const staffName = staff
      ? `${staff.firstName} ${staff.lastName}`.trim()
      : 'System';
    return {
      success: true,
      data: await this.crmService.redeemPoints(dto, staff?.id, staffName),
    };
  }

  @Post('loyalty/expire')
  @Permissions('write:crm')
  @HttpCode(HttpStatus.OK)
  async expireLoyaltyPoints(@Body('expiryDays') expiryDays?: number) {
    return {
      success: true,
      data: await this.crmService.expireLoyaltyPoints(expiryDays || 365),
    };
  }

  @Get('communications')
  @Permissions('read:crm')
  @HttpCode(HttpStatus.OK)
  async getCommunications(
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return {
      success: true,
      data: await this.crmService.findAllCommunications({
        search,
        type,
        status,
      }),
    };
  }

  @Post('communications')
  @Permissions('write:crm')
  @HttpCode(HttpStatus.CREATED)
  async logCommunication(
    @Body() dto: CreateCommunicationDto,
    @CurrentUser() staff: any,
  ) {
    const staffName = staff
      ? `${staff.firstName} ${staff.lastName}`.trim()
      : 'System';
    return {
      success: true,
      data: await this.crmService.logCommunication(dto, staff?.id, staffName),
    };
  }

  @Get('feedback')
  @Permissions('read:crm')
  @HttpCode(HttpStatus.OK)
  async getFeedback(
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return {
      success: true,
      data: await this.crmService.findAllFeedback({ search, status }),
    };
  }

  @Get('feedback/nps')
  @Permissions('read:crm')
  @HttpCode(HttpStatus.OK)
  async getNpsSummary() {
    return {
      success: true,
      data: await this.crmService.getNpsSummary(),
    };
  }

  @Post('feedback/trigger-manual')
  @Permissions('write:crm')
  @HttpCode(HttpStatus.OK)
  async triggerManualSurvey(@Body('ticketId') ticketId: string) {
    return {
      success: true,
      data: await this.crmService.triggerManualSurvey(ticketId),
    };
  }

  @Post('feedback/:id')
  @Permissions('write:crm')
  @HttpCode(HttpStatus.OK)
  async submitFeedback(
    @Param('id') id: string,
    @Body() dto: SubmitFeedbackDto,
  ) {
    return {
      success: true,
      data: await this.crmService.submitFeedback(id, dto),
    };
  }

  @Get('customers/:id/timeline')
  @Permissions('read:crm')
  @HttpCode(HttpStatus.OK)
  async getCustomerTimeline(
    @Param('id') customerId: string,
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return {
      success: true,
      data: await this.crmService.getCustomerTimeline(customerId, {
        type,
        startDate,
        endDate,
      }),
    };
  }
}
