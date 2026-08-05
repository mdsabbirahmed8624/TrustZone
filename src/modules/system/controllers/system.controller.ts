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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SystemAdminService } from '../services/system.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('system')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SystemAdminController {
  constructor(private readonly systemService: SystemAdminService) {}

  // ==========================================
  // STEP 2: SYSTEM SETTINGS
  // ==========================================
  @Get('settings')
  @Permissions('read:settings')
  async getSettings() {
    const data = await this.systemService.getSettings();
    return { success: true, data };
  }

  @Put('settings')
  @Permissions('write:settings')
  async updateSettings(@Body() body: any, @CurrentUser() user: any) {
    const data = await this.systemService.updateSettings(body);
    await this.systemService.createAuditLog({
      userId: user?.id,
      action: 'UPDATE_SYSTEM_SETTINGS',
      description: 'System Settings updated by Admin',
    });
    return { success: true, data };
  }

  // ==========================================
  // STEP 3: SECURITY CENTER
  // ==========================================
  @Get('security/policy')
  @Permissions('read:settings')
  async getSecurityPolicy() {
    const data = await this.systemService.getSecurityPolicy();
    return { success: true, data };
  }

  @Put('security/policy')
  @Permissions('write:settings')
  async updateSecurityPolicy(@Body() body: any, @CurrentUser() user: any) {
    const data = await this.systemService.updateSecurityPolicy(body);
    await this.systemService.createAuditLog({
      userId: user?.id,
      action: 'UPDATE_SECURITY_POLICY',
      description: 'System Security Policy updated by Admin',
    });
    return { success: true, data };
  }

  // ==========================================
  // STEP 4: AUDIT LOGS
  // ==========================================
  @Get('audit-logs')
  @Permissions('read:settings')
  async getAuditLogs(
    @Query('user') user?: string,
    @Query('action') action?: string,
    @Query('module') moduleName?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.systemService.getAuditLogs({
      user,
      action,
      module: moduleName,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
    return { success: true, ...data };
  }

  // ==========================================
  // STEP 5: BACKUP & RESTORE
  // ==========================================
  @Get('backups')
  @Permissions('read:settings')
  async getBackups() {
    const data = await this.systemService.getBackups();
    return { success: true, data };
  }

  @Post('backups/create')
  @Permissions('write:settings')
  async createBackup(
    @Body() body: { type: 'FULL_DATABASE' | 'MEDIA_FILES' | 'SYSTEM_CONFIG' },
    @CurrentUser() user: any,
  ) {
    const data = await this.systemService.createBackup(body);
    await this.systemService.createAuditLog({
      userId: user?.id,
      action: 'CREATE_BACKUP_SNAPSHOT',
      description: `Created backup snapshot: ${data.filename}`,
    });
    return { success: true, data };
  }

  @Post('backups/:id/restore')
  @HttpCode(HttpStatus.OK)
  @Permissions('write:settings')
  async restoreBackup(@Param('id') id: string, @CurrentUser() user: any) {
    const data = await this.systemService.restoreBackup(id);
    await this.systemService.createAuditLog({
      userId: user?.id,
      action: 'RESTORE_BACKUP_SNAPSHOT',
      description: `Restored backup snapshot ID: ${id}`,
    });
    return { success: true, data };
  }

  // ==========================================
  // STEP 6: SYSTEM HEALTH
  // ==========================================
  @Get('health')
  @Permissions('read:settings')
  async getHealth() {
    const data = await this.systemService.getSystemHealth();
    return { success: true, data };
  }

  // ==========================================
  // STEP 7: MAINTENANCE MODE
  // ==========================================
  @Get('maintenance')
  @Permissions('read:settings')
  async getMaintenanceMode() {
    const data = await this.systemService.getMaintenanceMode();
    return { success: true, data };
  }

  @Put('maintenance')
  @Permissions('write:settings')
  async toggleMaintenanceMode(
    @Body()
    body: { enabled: boolean; message?: string; estimatedEndAt?: string },
    @CurrentUser() user: any,
  ) {
    const data = await this.systemService.toggleMaintenanceMode(body);
    await this.systemService.createAuditLog({
      userId: user?.id,
      action: 'TOGGLE_MAINTENANCE_MODE',
      description: `Maintenance Mode set to ${body.enabled ? 'ENABLED' : 'DISABLED'}`,
    });
    return { success: true, data };
  }

  // ==========================================
  // STEP 8: ERROR LOGS
  // ==========================================
  @Get('errors')
  @Permissions('read:settings')
  async getErrors() {
    const data = await this.systemService.getErrorLogs();
    return { success: true, data };
  }

  @Patch('errors/:id/resolve')
  @Permissions('write:settings')
  async resolveError(@Param('id') id: string) {
    const data = await this.systemService.resolveErrorLog(id);
    return { success: true, data };
  }

  // ==========================================
  // STEP 9: JOB QUEUE
  // ==========================================
  @Get('jobs')
  @Permissions('read:settings')
  async getJobs() {
    const data = await this.systemService.getJobQueueStats();
    return { success: true, data };
  }

  @Post('jobs/:id/retry')
  @HttpCode(HttpStatus.OK)
  @Permissions('write:settings')
  async retryJob(@Param('id') id: string) {
    const data = await this.systemService.retryFailedJob(id);
    return { success: true, data };
  }

  // ==========================================
  // STEP 10: CACHE MANAGEMENT
  // ==========================================
  @Get('cache/stats')
  @Permissions('read:settings')
  async getCacheStats() {
    const data = await this.systemService.getCacheStats();
    return { success: true, data };
  }

  @Post('cache/clear')
  @HttpCode(HttpStatus.OK)
  @Permissions('write:settings')
  async clearCache() {
    const data = await this.systemService.clearCache();
    return { success: true, data };
  }

  @Post('cache/warm')
  @HttpCode(HttpStatus.OK)
  @Permissions('write:settings')
  async warmCache() {
    const data = await this.systemService.warmCache();
    return { success: true, data };
  }

  // ==========================================
  // STEP 11: FILE MANAGER
  // ==========================================
  @Get('files')
  @Permissions('read:settings')
  async getFiles() {
    const data = await this.systemService.getStorageUsage();
    return { success: true, data };
  }

  @Delete('files/:id')
  @Permissions('write:settings')
  async deleteFile(@Param('id') id: string) {
    const data = await this.systemService.deleteFile(id);
    return { success: true, data };
  }

  // ==========================================
  // STEP 12: LICENSE & VERSION
  // ==========================================
  @Get('version')
  @Permissions('read:settings')
  async getVersionInfo() {
    const data = await this.systemService.getVersionInfo();
    return { success: true, data };
  }
}
