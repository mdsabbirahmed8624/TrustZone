import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WarrantyService } from './warranty.service';
import { CreateWarrantyDto } from './dto/create-warranty.dto';
import { CreateClaimDto } from './dto/create-claim.dto';
import { SubmitInspectionDto } from './dto/submit-inspection.dto';
import { CreateRmaDto } from './dto/create-rma.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('warranty')
export class WarrantyController {
  constructor(private readonly warrantyService: WarrantyService) {}

  // ==========================================
  // PUBLIC ENDPOINTS
  // ==========================================

  @Get('verify/:warrantyNumber')
  @HttpCode(HttpStatus.OK)
  async verifyWarranty(@Param('warrantyNumber') warrantyNumber: string) {
    return {
      success: true,
      data: await this.warrantyService.verifyWarranty(warrantyNumber),
    };
  }

  // ==========================================
  // SECURED WARRANTY ADMINISTRATION
  // ==========================================

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('read:warranty')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('branchId') branchId?: string,
  ) {
    return {
      success: true,
      data: await this.warrantyService.findAllWarranties({
        search,
        status,
        branchId,
      }),
    };
  }

  @Get('dashboard/stats')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('read:warranty')
  @HttpCode(HttpStatus.OK)
  async getDashboardStats() {
    return {
      success: true,
      data: await this.warrantyService.getDashboardStats(),
    };
  }

  @Get('reports')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('read:warranty')
  @HttpCode(HttpStatus.OK)
  async getReports(@Query('type') type: string) {
    return {
      success: true,
      data: await this.warrantyService.generateReports(type),
    };
  }

  @Post('create')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('write:warranty')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateWarrantyDto, @CurrentUser() staff: any) {
    const staffName = staff
      ? `${staff.firstName} ${staff.lastName}`.trim()
      : 'System';
    return {
      success: true,
      data: await this.warrantyService.create(dto, staff?.id, staffName),
    };
  }

  @Patch(':id/void')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('write:warranty')
  @HttpCode(HttpStatus.OK)
  async voidWarranty(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() staff: any,
  ) {
    const staffName = staff
      ? `${staff.firstName} ${staff.lastName}`.trim()
      : 'System';
    return {
      success: true,
      data: await this.warrantyService.voidWarranty(
        id,
        reason,
        staff?.id,
        staffName,
      ),
    };
  }

  // ==========================================
  // SECURED CUSTOMER CLAIMS
  // ==========================================

  @Get('claims')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('read:warranty')
  @HttpCode(HttpStatus.OK)
  async findAllClaims(
    @Query('status') status?: string,
    @Query('branchId') branchId?: string,
  ) {
    return {
      success: true,
      data: await this.warrantyService.findAllClaims({ status, branchId }),
    };
  }

  @Post('claims/create')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('write:warranty')
  @HttpCode(HttpStatus.CREATED)
  async createClaim(@Body() dto: CreateClaimDto) {
    return {
      success: true,
      data: await this.warrantyService.createClaim(dto),
    };
  }

  @Post('claims/:id/inspection')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('write:warranty')
  @HttpCode(HttpStatus.OK)
  async submitInspection(
    @Param('id') id: string,
    @Body() dto: SubmitInspectionDto,
    @CurrentUser() staff: any,
  ) {
    const staffName = staff
      ? `${staff.firstName} ${staff.lastName}`.trim()
      : 'System';
    return {
      success: true,
      data: await this.warrantyService.submitInspection(
        id,
        dto,
        staff?.id,
        staffName,
      ),
    };
  }

  @Patch('claims/:id/status')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('write:warranty')
  @HttpCode(HttpStatus.OK)
  async updateClaimStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('resolutionDetails') resolutionDetails: string,
    @CurrentUser() staff: any,
  ) {
    const staffName = staff
      ? `${staff.firstName} ${staff.lastName}`.trim()
      : 'System';
    return {
      success: true,
      data: await this.warrantyService.updateClaimStatus(
        id,
        status,
        resolutionDetails,
        staff?.id,
        staffName,
      ),
    };
  }

  // ==========================================
  // SECURED SUPPLIER RMAS
  // ==========================================

  @Get('rmas')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('read:warranty')
  @HttpCode(HttpStatus.OK)
  async findAllRmas(
    @Query('status') status?: string,
    @Query('supplierId') supplierId?: string,
  ) {
    return {
      success: true,
      data: await this.warrantyService.findAllSupplierRmas({
        status,
        supplierId,
      }),
    };
  }

  @Post('rmas/create')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('write:warranty')
  @HttpCode(HttpStatus.CREATED)
  async createRma(@Body() dto: CreateRmaDto) {
    return {
      success: true,
      data: await this.warrantyService.createSupplierRma(dto),
    };
  }

  @Patch('rmas/:id/status')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('write:warranty')
  @HttpCode(HttpStatus.OK)
  async updateRmaStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('notes') notes: string,
    @Body('creditNoteNumber') creditNoteNumber: string,
    @CurrentUser('id') staffId: string,
  ) {
    return {
      success: true,
      data: await this.warrantyService.updateRmaStatus(
        id,
        status,
        notes,
        creditNoteNumber,
        staffId,
      ),
    };
  }
}
