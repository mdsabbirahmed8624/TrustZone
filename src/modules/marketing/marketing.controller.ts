import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('marketing')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  // ==========================================
  // DASHBOARD & ANALYTICS
  // ==========================================
  @Get('dashboard/stats')
  @Permissions('read:marketing')
  async getDashboardStats() {
    const data = await this.marketingService.getDashboardStats();
    return { success: true, data };
  }

  @Get('analytics')
  @Permissions('read:marketing')
  async getAnalytics(@Query('campaignId') campaignId?: string) {
    const data = await this.marketingService.getCampaignAnalytics(campaignId);
    return { success: true, data };
  }

  // ==========================================
  // CAMPAIGNS CRUD & CONTROLS
  // ==========================================
  @Get('campaigns')
  @Permissions('read:marketing')
  async getCampaigns(
    @Query('channel') channel?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.marketingService.getCampaigns({ channel, status, search });
    return { success: true, data };
  }

  @Get('campaigns/:id')
  @Permissions('read:marketing')
  async getCampaign(@Param('id') id: string) {
    const data = await this.marketingService.getCampaign(id);
    return { success: true, data };
  }

  @Post('campaigns')
  @Permissions('write:marketing')
  async createCampaign(@Body() dto: CreateCampaignDto, @CurrentUser() user: any) {
    const data = await this.marketingService.createCampaign(dto, user?.id);
    return { success: true, data };
  }

  @Put('campaigns/:id')
  @Permissions('write:marketing')
  async updateCampaign(@Param('id') id: string, @Body() dto: Partial<CreateCampaignDto>) {
    const data = await this.marketingService.updateCampaign(id, dto);
    return { success: true, data };
  }

  @Delete('campaigns/:id')
  @Permissions('write:marketing')
  async deleteCampaign(@Param('id') id: string) {
    const data = await this.marketingService.deleteCampaign(id);
    return { success: true, data };
  }

  @Post('campaigns/:id/duplicate')
  @Permissions('write:marketing')
  async duplicateCampaign(@Param('id') id: string, @CurrentUser() user: any) {
    const data = await this.marketingService.duplicateCampaign(id, user?.id);
    return { success: true, data };
  }

  @Patch('campaigns/:id/status')
  @Permissions('write:marketing')
  async updateCampaignStatus(
    @Param('id') id: string,
    @Body('status') status: 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED',
  ) {
    const data = await this.marketingService.updateCampaignStatus(id, status);
    return { success: true, data };
  }

  @Post('campaigns/:id/send')
  @Permissions('write:marketing')
  async executeCampaignSend(@Param('id') id: string) {
    const data = await this.marketingService.executeCampaignSend(id);
    return { success: true, data };
  }

  // ==========================================
  // AUDIENCE SEGMENTATION
  // ==========================================
  @Get('audience/segments')
  @Permissions('read:marketing')
  async getAudienceSegments(@Query('segment') segment: string) {
    const data = await this.marketingService.getAudienceSegmentCustomers(segment || 'VIP');
    return { success: true, data };
  }

  // ==========================================
  // CAMPAIGN TEMPLATES
  // ==========================================
  @Get('templates')
  @Permissions('read:marketing')
  async getTemplates() {
    const data = await this.marketingService.getTemplates();
    return { success: true, data };
  }

  @Post('templates')
  @Permissions('write:marketing')
  async createTemplate(@Body() dto: CreateTemplateDto) {
    const data = await this.marketingService.createTemplate(dto);
    return { success: true, data };
  }

  @Put('templates/:id')
  @Permissions('write:marketing')
  async updateTemplate(@Param('id') id: string, @Body() dto: Partial<CreateTemplateDto>) {
    const data = await this.marketingService.updateTemplate(id, dto);
    return { success: true, data };
  }

  @Delete('templates/:id')
  @Permissions('write:marketing')
  async deleteTemplate(@Param('id') id: string) {
    const data = await this.marketingService.deleteTemplate(id);
    return { success: true, data };
  }

  // ==========================================
  // AUTOMATION RULES
  // ==========================================
  @Get('automation/rules')
  @Permissions('read:marketing')
  async getAutomationRules() {
    const data = await this.marketingService.getAutomationRules();
    return { success: true, data };
  }

  @Post('automation/trigger')
  @Permissions('write:marketing')
  async triggerAutomationRule(@Body() body: { event: string; payload: any }) {
    const data = await this.marketingService.triggerAutomationRule(body.event, body.payload);
    return { success: true, data };
  }

  // ==========================================
  // COUPONS CRUD
  // ==========================================
  @Get('coupons')
  @Permissions('read:marketing')
  async getCoupons() {
    const data = await this.marketingService.getCoupons();
    return { success: true, data };
  }

  @Post('coupons')
  @Permissions('write:marketing')
  async createCoupon(@Body() dto: CreateCouponDto) {
    const data = await this.marketingService.createCoupon(dto);
    return { success: true, data };
  }

  @Put('coupons/:id')
  @Permissions('write:marketing')
  async updateCoupon(@Param('id') id: string, @Body() dto: Partial<CreateCouponDto>) {
    const data = await this.marketingService.updateCoupon(id, dto);
    return { success: true, data };
  }

  @Delete('coupons/:id')
  @Permissions('write:marketing')
  async deleteCoupon(@Param('id') id: string) {
    const data = await this.marketingService.deleteCoupon(id);
    return { success: true, data };
  }

  // ==========================================
  // REFERRAL SYSTEM
  // ==========================================
  @Get('referrals')
  @Permissions('read:marketing')
  async getReferrals() {
    const data = await this.marketingService.getReferrals();
    return { success: true, data };
  }
}
