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
  FranchiseService,
  CreateFranchiseDto,
  CreateAgreementDto,
} from './franchise.service';

@ApiTags('Franchise Management')
@ApiBearerAuth()
@Controller('franchise')
export class FranchiseController {
  constructor(private readonly franchiseService: FranchiseService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new franchise partner' })
  async createFranchise(@Body() dto: CreateFranchiseDto) {
    return this.franchiseService.createFranchise(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all franchises' })
  async getAllFranchises() {
    return this.franchiseService.getAllFranchises();
  }

  @Get('kpis')
  @ApiOperation({ summary: 'Get executive franchise performance KPIs' })
  async getFranchiseKPIs() {
    return this.franchiseService.getFranchiseKPIs();
  }

  @Post('agreements')
  @ApiOperation({ summary: 'Issue a new franchise agreement contract' })
  async createAgreement(@Body() dto: CreateAgreementDto) {
    return this.franchiseService.createAgreement(dto);
  }

  @Post(':id/settle')
  @ApiOperation({
    summary: 'Calculate monthly royalty settlement for a franchise',
  })
  async calculateSettlement(
    @Param('id') id: string,
    @Query('period') period: string,
    @Query('grossRevenue', ParseFloatPipe) grossRevenue: number,
  ) {
    return this.franchiseService.calculateSettlement(
      id,
      period || '2026-07',
      grossRevenue,
    );
  }

  @Get(':id/settlements')
  @ApiOperation({ summary: 'Get settlement history for a franchise' })
  async getSettlements(@Param('id') id: string) {
    return this.franchiseService.getSettlements(id);
  }

  // Parameterized ID route placed at the end to prevent catching static path routes
  @Get(':id')
  @ApiOperation({ summary: 'Get franchise details by ID' })
  async getFranchiseById(@Param('id') id: string) {
    return this.franchiseService.getFranchiseById(id);
  }
}
