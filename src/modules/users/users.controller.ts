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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { BulkUserActionDto } from './dto/bulk-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ==========================================
  // USER CRUD & SEARCH
  // ==========================================
  @Get()
  @Permissions('read:users')
  async getUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
    @Query('department') department?: string,
  ) {
    const data = await this.usersService.getUsers({
      search,
      role,
      branchId,
      status,
      department,
    });
    return { success: true, data };
  }

  @Get(':id')
  @Permissions('read:users')
  async getUserById(@Param('id') id: string) {
    const data = await this.usersService.getUserById(id);
    return { success: true, data };
  }

  @Post()
  @Permissions('write:users')
  async createUser(@Body() dto: CreateUserDto) {
    const data = await this.usersService.createUser(dto);
    return { success: true, data };
  }

  @Put(':id')
  @Permissions('write:users')
  async updateUser(
    @Param('id') id: string,
    @Body() dto: Partial<CreateUserDto>,
  ) {
    const data = await this.usersService.updateUser(id, dto);
    return { success: true, data };
  }

  @Patch(':id/status')
  @Permissions('write:users')
  async updateUserStatus(
    @Param('id') id: string,
    @Body('status') status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED',
  ) {
    const data = await this.usersService.updateUserStatus(id, status);
    return { success: true, data };
  }

  @Delete(':id')
  @Permissions('write:users')
  async deleteUser(@Param('id') id: string) {
    const data = await this.usersService.deleteUser(id);
    return { success: true, data };
  }

  // ==========================================
  // ROLES & PERMISSION MATRIX
  // ==========================================
  @Get('roles/list')
  @Permissions('read:roles')
  async getRoles() {
    const data = await this.usersService.getRoles();
    return { success: true, data };
  }

  @Post('roles')
  @Permissions('write:roles')
  async createRole(
    @Body()
    body: {
      name: string;
      description?: string;
      permissions?: string[];
    },
  ) {
    const data = await this.usersService.createRole(
      body.name,
      body.description,
      body.permissions,
    );
    return { success: true, data };
  }

  @Put('roles/:id')
  @Permissions('write:roles')
  async updateRole(
    @Param('id') id: string,
    @Body()
    body: { name?: string; description?: string; permissions?: string[] },
  ) {
    const data = await this.usersService.updateRole(id, body);
    return { success: true, data };
  }

  @Delete('roles/:id')
  @Permissions('write:roles')
  async deleteRole(@Param('id') id: string) {
    const data = await this.usersService.deleteRole(id);
    return { success: true, data };
  }

  @Get('permissions/matrix')
  @Permissions('read:roles')
  getPermissionMatrix() {
    const data = this.usersService.getPermissionMatrix();
    return { success: true, data };
  }

  // ==========================================
  // PROFILE & SECURITY SETTINGS
  // ==========================================
  @Put('me/profile')
  async updateProfile(@CurrentUser() user: any, @Body() body: any) {
    const data = await this.usersService.updateProfile(user.id, body);
    return { success: true, data };
  }

  @Post('me/change-password')
  async changePassword(
    @CurrentUser() user: any,
    @Body() body: { currentPass: string; newPass: string },
  ) {
    const data = await this.usersService.changePassword(
      user.id,
      body.currentPass,
      body.newPass,
    );
    return { success: true, data };
  }

  // ==========================================
  // SESSIONS & ACTIVITY LOGS
  // ==========================================
  @Get(':id/sessions')
  @Permissions('read:users')
  async getUserSessions(@Param('id') id: string) {
    const data = await this.usersService.getUserSessions(id);
    return { success: true, data };
  }

  @Delete('sessions/:sessionId')
  @Permissions('write:users')
  async terminateSession(@Param('sessionId') sessionId: string) {
    const data = await this.usersService.terminateSession(sessionId);
    return { success: true, data };
  }

  @Post(':id/sessions/logout-all')
  @Permissions('write:users')
  async logoutAllDevices(@Param('id') id: string) {
    const data = await this.usersService.logoutAllDevices(id);
    return { success: true, data };
  }

  @Get('logs/activity')
  @Permissions('read:audit_logs')
  async getActivityLogs(
    @Query('userId') userId?: string,
    @Query('action') action?: string,
  ) {
    const data = await this.usersService.getActivityLogs({ userId, action });
    return { success: true, data };
  }

  // ==========================================
  // BULK ACTIONS
  // ==========================================
  @Post('bulk-action')
  @Permissions('write:users')
  async handleBulkUserAction(@Body() dto: BulkUserActionDto) {
    const data = await this.usersService.handleBulkUserAction(dto);
    return { success: true, data };
  }
}
