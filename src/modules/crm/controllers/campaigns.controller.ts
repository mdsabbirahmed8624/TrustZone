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
import { CampaignService } from '../services/campaign.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('crm/campaigns')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CampaignsController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  @Permissions('crm:write')
  @HttpCode(HttpStatus.CREATED)
  async createCampaign(
    @Body()
    body: {
      name: string;
      channel?: string;
      subject?: string;
      bodyContent?: string;
      targetSegment?: string;
      budget?: number;
      scheduledAt?: Date;
    },
  ) {
    return this.campaignService.createCampaign(body);
  }

  @Post(':id/members')
  @Permissions('crm:write')
  @HttpCode(HttpStatus.OK)
  async addMembers(
    @Param('id') id: string,
    @Body() body: { recipients: { recipient: string; name?: string }[] },
  ) {
    return this.campaignService.addMembers(id, body.recipients);
  }

  @Post(':id/launch')
  @Permissions('crm:write')
  @HttpCode(HttpStatus.OK)
  async launchCampaign(@Param('id') id: string) {
    return this.campaignService.launchCampaign(id);
  }

  @Get(':id/analytics')
  @Permissions('crm:read')
  async getCampaignAnalytics(@Param('id') id: string) {
    return this.campaignService.getCampaignAnalytics(id);
  }
}
