import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  FranchiseBook3Service,
  UpsertPortalConfigDto,
  LogReplicationDto,
} from '../services/franchise-book3.service';

@ApiTags('Franchisee Portal Config & Multi-Region Replication')
@ApiBearerAuth()
@Controller('franchise')
export class FranchiseBook3Controller {
  constructor(private readonly book3Service: FranchiseBook3Service) {}

  @Post('portal-configs')
  @ApiOperation({
    summary: 'Create or update franchise white-label portal configuration',
  })
  async upsertPortalConfig(@Body() dto: UpsertPortalConfigDto) {
    return this.book3Service.upsertPortalConfig(dto);
  }

  @Get('portal-configs/:franchiseId')
  @ApiOperation({ summary: 'Get franchise portal white-label configuration' })
  async getPortalConfig(@Param('franchiseId') franchiseId: string) {
    return this.book3Service.getPortalConfig(franchiseId);
  }

  @Post('replication-log')
  @ApiOperation({
    summary: 'Log multi-region database cluster replication sync event',
  })
  async logReplicationSync(@Body() dto: LogReplicationDto) {
    return this.book3Service.logReplicationSync(dto);
  }

  @Get('replication-status')
  @ApiOperation({
    summary: 'List recent cross-cluster database replication sync statuses',
  })
  async getReplicationStatus() {
    return this.book3Service.getReplicationStatus();
  }
}
