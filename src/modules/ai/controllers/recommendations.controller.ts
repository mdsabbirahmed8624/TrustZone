import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { RecommendationService } from '../services/recommendation.service';
import { TechnicianRecommendationService } from '../services/technician-recommendation.service';
import { InventoryIntelligenceService } from '../services/inventory-intelligence.service';
import { ProcurementIntelligenceService } from '../services/procurement-intelligence.service';

@Controller('recommendations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RecommendationsController {
  constructor(
    private readonly recService: RecommendationService,
    private readonly techRecService: TechnicianRecommendationService,
    private readonly invIntelService: InventoryIntelligenceService,
    private readonly procIntelService: ProcurementIntelligenceService,
  ) {}

  @Get('parts/:partId')
  @Permissions('read:reports')
  @HttpCode(HttpStatus.OK)
  async recommendParts(
    @Param('partId') partId: string,
    @Query('branchId') branchId?: string,
  ) {
    return {
      success: true,
      data: await this.recService.recommendParts(partId, branchId),
    };
  }

  @Get('tech/:ticketId')
  @Permissions('read:reports')
  @HttpCode(HttpStatus.OK)
  async recommendTechnician(@Param('ticketId') ticketId: string) {
    return {
      success: true,
      data: await this.techRecService.recommendTechnician(ticketId),
    };
  }

  @Get('demand/:partId')
  @Permissions('read:reports')
  @HttpCode(HttpStatus.OK)
  async predictDemand(@Param('partId') partId: string) {
    return {
      success: true,
      data: await this.invIntelService.predictDemand(partId),
    };
  }

  @Get('supplier/:partId')
  @Permissions('read:reports')
  @HttpCode(HttpStatus.OK)
  async recommendPreferredSupplier(@Param('partId') partId: string) {
    return {
      success: true,
      data: await this.procIntelService.recommendPreferredSupplier(partId),
    };
  }
}
