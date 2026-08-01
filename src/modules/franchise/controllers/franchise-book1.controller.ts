import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseFloatPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  FranchiseBook1Service,
  CreateTierDto,
  CreateTerritoryDto,
  CreateComplianceAuditDto,
} from '../services/franchise-book1.service';

@ApiTags('Franchise Tiers, Territory & Royalty Engine')
@ApiBearerAuth()
@Controller('franchise')
export class FranchiseBook1Controller {
  constructor(private readonly book1Service: FranchiseBook1Service) {}

  // --- Franchise Tiers ---
  @Post('tiers')
  @ApiOperation({ summary: 'Create or update a franchise tier classification' })
  async upsertTier(@Body() dto: CreateTierDto) {
    return this.book1Service.upsertTier(dto);
  }

  @Get('tiers')
  @ApiOperation({ summary: 'Get all franchise tier classifications' })
  async getTiers() {
    return this.book1Service.getTiers();
  }

  @Get(':id/tier-evaluation')
  @ApiOperation({
    summary: 'Evaluate franchise tier status based on gross revenue',
  })
  async evaluateFranchiseTier(@Param('id') id: string) {
    return this.book1Service.evaluateFranchiseTier(id);
  }

  // --- Territory Zones ---
  @Post('territories')
  @ApiOperation({ summary: 'Register a new territory zone' })
  async createTerritoryZone(@Body() dto: CreateTerritoryDto) {
    return this.book1Service.createTerritoryZone(dto);
  }

  @Post('territories/:zoneId/assign/:franchiseId')
  @ApiOperation({
    summary: 'Assign an exclusive territory zone to a franchise',
  })
  async assignTerritoryZone(
    @Param('zoneId') zoneId: string,
    @Param('franchiseId') franchiseId: string,
  ) {
    return this.book1Service.assignTerritoryZone(zoneId, franchiseId);
  }

  @Get('territories')
  @ApiOperation({ summary: 'List all territory zones' })
  async getTerritories() {
    return this.book1Service.getTerritories();
  }

  // --- Royalty Billing Engine ---
  @Post(':id/royalty-invoices')
  @ApiOperation({
    summary: 'Auto-generate itemized royalty invoice for a billing period',
  })
  async generateRoyaltyInvoice(
    @Param('id') id: string,
    @Query('period') period: string,
    @Query('grossSales', ParseFloatPipe) grossSales: number,
  ) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    return this.book1Service.generateRoyaltyInvoice(
      id,
      period || '2026-Q3',
      grossSales,
      dueDate,
    );
  }

  @Post('royalty-invoices/:invoiceId/pay')
  @ApiOperation({ summary: 'Mark royalty invoice as PAID' })
  async payRoyaltyInvoice(@Param('invoiceId') invoiceId: string) {
    return this.book1Service.payRoyaltyInvoice(invoiceId);
  }

  @Get('royalty-invoices')
  @ApiOperation({ summary: 'List royalty invoices' })
  async getRoyaltyInvoices(@Query('franchiseId') franchiseId?: string) {
    return this.book1Service.getRoyaltyInvoices(franchiseId);
  }

  // --- Compliance Audits ---
  @Post('compliance')
  @ApiOperation({ summary: 'Log a partner compliance audit result' })
  async createComplianceAudit(@Body() dto: CreateComplianceAuditDto) {
    return this.book1Service.createComplianceAudit(dto);
  }

  @Get(':id/compliance')
  @ApiOperation({ summary: 'Get compliance audit history for a franchise' })
  async getFranchiseAudits(@Param('id') id: string) {
    return this.book1Service.getFranchiseAudits(id);
  }
}
