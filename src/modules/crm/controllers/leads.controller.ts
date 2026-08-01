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
import { LeadManagementService } from '../services/lead-management.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('crm/leads')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LeadsController {
  constructor(private readonly leadService: LeadManagementService) {}

  @Post()
  @Permissions('crm:write')
  @HttpCode(HttpStatus.CREATED)
  async createLead(
    @Body()
    body: {
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
      company?: string;
      source?: string;
      estimatedValue?: number;
      assignedToId?: string;
      notes?: string;
      tags?: string[];
    },
  ) {
    return this.leadService.createLead(body);
  }

  @Get()
  @Permissions('crm:read')
  async getLeads(
    @Query('status') status?: string,
    @Query('source') source?: string,
    @Query('search') search?: string,
    @Query('assignedToId') assignedToId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.leadService.getLeads({
      status,
      source,
      search,
      assignedToId,
      page,
      limit,
    });
  }

  @Post(':id/convert')
  @Permissions('crm:write')
  @HttpCode(HttpStatus.OK)
  async convertLead(
    @Param('id') id: string,
    @Body() body: { createOpportunity?: boolean; stageId?: string },
  ) {
    return this.leadService.convertLead(id, body);
  }

  @Post(':id/assign')
  @Permissions('crm:write')
  @HttpCode(HttpStatus.OK)
  async assignLead(@Param('id') id: string, @Body() body: { staffId: string }) {
    return this.leadService.assignLead(id, body.staffId);
  }
}
