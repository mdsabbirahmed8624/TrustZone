import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CrmService } from './crm.service';
import { AdjustPointsDto } from './dto/adjust-points.dto';
import { RedeemPointsDto } from './dto/redeem-points.dto';
import { CreateCommunicationDto } from './dto/create-communication.dto';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { CreateFollowUpDto } from './dto/create-followup.dto';
import { IssueRewardDto } from './dto/issue-reward.dto';
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

  @Get('customers/:id/notes')
  @Permissions('read:crm')
  @HttpCode(HttpStatus.OK)
  async getCustomerNotes(
    @Param('id') customerId: string,
    @Query('category') category?: string,
  ) {
    return {
      success: true,
      data: await this.crmService.getCustomerNotes(customerId, category),
    };
  }

  @Post('notes')
  @Permissions('write:crm')
  @HttpCode(HttpStatus.CREATED)
  async createCustomerNote(
    @Body() dto: CreateNoteDto,
    @CurrentUser() staff: any,
  ) {
    const staffName = staff
      ? `${staff.firstName} ${staff.lastName}`.trim()
      : 'System';
    return {
      success: true,
      data: await this.crmService.createCustomerNote(dto, staff?.id, staffName),
    };
  }

  @Patch('notes/:id')
  @Permissions('write:crm')
  @HttpCode(HttpStatus.OK)
  async updateCustomerNote(
    @Param('id') id: string,
    @Body()
    dto: { content?: string; category?: string; attachments?: string[] },
  ) {
    return {
      success: true,
      data: await this.crmService.updateCustomerNote(id, dto),
    };
  }

  @Delete('notes/:id')
  @Permissions('write:crm')
  @HttpCode(HttpStatus.OK)
  async deleteCustomerNote(@Param('id') id: string) {
    return {
      success: true,
      data: await this.crmService.deleteCustomerNote(id),
    };
  }

  @Get('followups')
  @Permissions('read:crm')
  @HttpCode(HttpStatus.OK)
  async getFollowUps(
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('channel') channel?: string,
  ) {
    return {
      success: true,
      data: await this.crmService.getFollowUps({
        customerId,
        status,
        priority,
        channel,
      }),
    };
  }

  @Post('followups')
  @Permissions('write:crm')
  @HttpCode(HttpStatus.CREATED)
  async createFollowUp(
    @Body() dto: CreateFollowUpDto,
    @CurrentUser() staff: any,
  ) {
    const staffName = staff
      ? `${staff.firstName} ${staff.lastName}`.trim()
      : 'System';
    return {
      success: true,
      data: await this.crmService.createFollowUp(dto, staff?.id, staffName),
    };
  }

  @Patch('followups/:id')
  @Permissions('write:crm')
  @HttpCode(HttpStatus.OK)
  async updateFollowUp(@Param('id') id: string, @Body() dto: any) {
    return {
      success: true,
      data: await this.crmService.updateFollowUp(id, dto),
    };
  }

  @Post('followups/:id/complete')
  @Permissions('write:crm')
  @HttpCode(HttpStatus.OK)
  async completeFollowUp(
    @Param('id') id: string,
    @Body('completionNotes') completionNotes?: string,
    @CurrentUser() staff?: any,
  ) {
    const staffName = staff
      ? `${staff.firstName} ${staff.lastName}`.trim()
      : 'System';
    return {
      success: true,
      data: await this.crmService.completeFollowUp(
        id,
        completionNotes,
        staff?.id,
        staffName,
      ),
    };
  }

  @Get('rewards')
  @Permissions('read:crm')
  @HttpCode(HttpStatus.OK)
  async getRewards(@Query('activeOnly') activeOnly?: string) {
    return {
      success: true,
      data: await this.crmService.getRewards({
        activeOnly: activeOnly === 'true',
      }),
    };
  }

  @Post('rewards/issue')
  @Permissions('write:crm')
  @HttpCode(HttpStatus.CREATED)
  async issueRewardCoupon(
    @Body() dto: IssueRewardDto,
    @CurrentUser() staff: any,
  ) {
    const staffName = staff
      ? `${staff.firstName} ${staff.lastName}`.trim()
      : 'System';
    return {
      success: true,
      data: await this.crmService.issueRewardCoupon(dto, staff?.id, staffName),
    };
  }

  @Post('rewards/validate')
  @Permissions('read:crm')
  @HttpCode(HttpStatus.OK)
  async validateRewardCoupon(
    @Body('code') code: string,
    @Body('customerId') customerId?: string,
    @Body('orderValue') orderValue?: number,
  ) {
    return {
      success: true,
      data: await this.crmService.validateRewardCoupon(
        code,
        customerId,
        orderValue,
      ),
    };
  }

  @Post('reminders/trigger')
  @Permissions('write:crm')
  @HttpCode(HttpStatus.OK)
  async triggerReminderEngine() {
    return {
      success: true,
      data: await this.crmService.runReminderEngine(),
    };
  }

  @Get('customers/segmented')
  @Permissions('read:crm')
  @HttpCode(HttpStatus.OK)
  async getSegmentedCustomers(
    @Query('segment') segment?: string,
    @Query('search') search?: string,
    @Query('tag') tag?: string,
    @Query('branchId') branchId?: string,
  ) {
    return {
      success: true,
      data: await this.crmService.getSegmentedCustomers({
        segment,
        search,
        tag,
        branchId,
      }),
    };
  }

  @Get('reports')
  @Permissions('read:crm')
  @HttpCode(HttpStatus.OK)
  async getCrmReports(
    @Query('type') type: string,
    @Query('dateRange') dateRange?: string,
  ) {
    return {
      success: true,
      data: await this.crmService.getCrmReports(type, dateRange),
    };
  }
}
