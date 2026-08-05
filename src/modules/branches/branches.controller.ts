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
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('branches')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  // ==========================================
  // DASHBOARD & ANALYTICS
  // ==========================================
  @Get('dashboard/stats')
  @Permissions('read:branches')
  async getDashboardStats(@Query('branchId') branchId?: string) {
    const data = await this.branchesService.getBranchDashboardStats(branchId);
    return { success: true, data };
  }

  // ==========================================
  // BRANCH CRUD & LIFECYCLE
  // ==========================================
  @Get()
  @Permissions('read:branches')
  async getBranches(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('district') district?: string,
  ) {
    const data = await this.branchesService.getBranches({
      search,
      status,
      district,
    });
    return { success: true, data };
  }

  @Get(':id')
  @Permissions('read:branches')
  async getBranch(@Param('id') id: string) {
    const data = await this.branchesService.getBranch(id);
    return { success: true, data };
  }

  @Post()
  @Permissions('write:branches')
  async createBranch(@Body() dto: CreateBranchDto) {
    const data = await this.branchesService.createBranch(dto);
    return { success: true, data };
  }

  @Put(':id')
  @Permissions('write:branches')
  async updateBranch(
    @Param('id') id: string,
    @Body() dto: Partial<CreateBranchDto>,
  ) {
    const data = await this.branchesService.updateBranch(id, dto);
    return { success: true, data };
  }

  @Patch(':id/status')
  @Permissions('write:branches')
  async updateBranchStatus(
    @Param('id') id: string,
    @Body('status') status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE',
  ) {
    const data = await this.branchesService.updateBranchStatus(id, status);
    return { success: true, data };
  }

  @Delete(':id')
  @Permissions('write:branches')
  async deleteBranch(@Param('id') id: string) {
    const data = await this.branchesService.deleteBranch(id);
    return { success: true, data };
  }

  // ==========================================
  // BRANCH STAFF ASSIGNMENT
  // ==========================================
  @Get(':id/staff')
  @Permissions('read:branches')
  async getBranchStaff(@Param('id') id: string) {
    const data = await this.branchesService.getBranchStaff(id);
    return { success: true, data };
  }

  @Post(':id/staff/assign')
  @Permissions('write:branches')
  async assignStaffToBranch(
    @Param('id') id: string,
    @Body() body: { userId: string; role?: string },
  ) {
    const data = await this.branchesService.assignStaffToBranch(
      id,
      body.userId,
      body.role,
    );
    return { success: true, data };
  }

  // ==========================================
  // BRANCH INVENTORY & REPAIR QUEUE
  // ==========================================
  @Get(':id/inventory')
  @Permissions('read:branches')
  async getBranchInventory(@Param('id') id: string) {
    const data = await this.branchesService.getBranchInventory(id);
    return { success: true, data };
  }

  @Get(':id/repairs')
  @Permissions('read:branches')
  async getBranchRepairQueue(
    @Param('id') id: string,
    @Query('status') status?: string,
  ) {
    const data = await this.branchesService.getBranchRepairQueue(id, status);
    return { success: true, data };
  }

  @Post('repairs/:ticketId/transfer')
  @Permissions('write:branches')
  async transferRepairTicket(
    @Param('ticketId') ticketId: string,
    @Body('targetBranchId') targetBranchId: string,
  ) {
    const data = await this.branchesService.transferRepairTicket(
      ticketId,
      targetBranchId,
    );
    return { success: true, data };
  }

  // ==========================================
  // BRANCH FINANCE & DAILY CLOSING
  // ==========================================
  @Get(':id/finance')
  @Permissions('read:branches')
  async getBranchFinance(@Param('id') id: string) {
    const data = await this.branchesService.getBranchFinance(id);
    return { success: true, data };
  }

  @Post(':id/finance/daily-closing')
  @Permissions('write:branches')
  async performDailyClosing(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body()
    body: { expectedBalance: number; actualBalance: number; notes?: string },
  ) {
    const data = await this.branchesService.performDailyClosing(id, {
      expectedBalance: body.expectedBalance,
      actualBalance: body.actualBalance,
      closedById: user?.id || 'sys-user',
      notes: body.notes,
    });
    return { success: true, data };
  }

  // ==========================================
  // MULTI-BRANCH TRANSFERS
  // ==========================================
  @Get('transfers/list')
  @Permissions('read:branches')
  async getBranchTransfers(
    @Query('fromBranchId') fromBranchId?: string,
    @Query('toBranchId') toBranchId?: string,
    @Query('status') status?: string,
  ) {
    const data = await this.branchesService.getBranchTransfers({
      fromBranchId,
      toBranchId,
      status,
    });
    return { success: true, data };
  }

  @Post('transfers')
  @Permissions('write:branches')
  async createBranchTransfer(
    @Body() dto: CreateTransferDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.branchesService.createBranchTransfer(dto, user?.id);
    return { success: true, data };
  }

  @Patch('transfers/:id/status')
  @Permissions('write:branches')
  async processBranchTransferStatus(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body('status') status: 'APPROVED' | 'REJECTED' | 'COMPLETED',
  ) {
    const data = await this.branchesService.processBranchTransferStatus(
      id,
      status,
      user?.id,
    );
    return { success: true, data };
  }
}
