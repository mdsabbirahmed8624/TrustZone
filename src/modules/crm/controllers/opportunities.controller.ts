import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OpportunityService } from '../services/opportunity.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('crm/opportunities')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OpportunitiesController {
  constructor(private readonly opportunityService: OpportunityService) {}

  @Post()
  @Permissions('crm:write')
  @HttpCode(HttpStatus.CREATED)
  async createOpportunity(
    @Body()
    body: {
      title: string;
      amount: number;
      stageId: string;
      customerId?: string;
      assignedToId?: string;
      closeDate?: Date;
      competitor?: string;
    },
  ) {
    return this.opportunityService.createOpportunity(body);
  }

  @Get()
  @Permissions('crm:read')
  async getOpportunities(
    @Query('stageId') stageId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.opportunityService.getOpportunities({
      stageId,
      status,
      search,
    });
  }

  @Post(':id/stage')
  @Permissions('crm:write')
  @HttpCode(HttpStatus.OK)
  async moveStage(@Param('id') id: string, @Body() body: { stageId: string }) {
    return this.opportunityService.moveStage(id, body.stageId);
  }

  @Post(':id/close')
  @Permissions('crm:write')
  @HttpCode(HttpStatus.OK)
  async closeOpportunity(
    @Param('id') id: string,
    @Body() body: { status: 'WON' | 'LOST'; lossReason?: string },
  ) {
    return this.opportunityService.closeOpportunity(
      id,
      body.status,
      body.lossReason,
    );
  }
}
