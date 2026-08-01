import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SystemEnterpriseService } from './system-enterprise.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('system-enterprise')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SystemEnterpriseController {
  constructor(private readonly systemService: SystemEnterpriseService) {}

  // ==========================================
  // SOFT DELETE & RESTORE
  // ==========================================
  @Delete('soft-delete/:model/:id')
  @Permissions('write:support')
  async softDelete(@Param('model') model: string, @Param('id') id: string) {
    const data = await this.systemService.softDelete(model, id);
    return { success: true, data };
  }

  @Post('restore/:model/:id')
  @Permissions('write:support')
  async restoreRecord(@Param('model') model: string, @Param('id') id: string) {
    const data = await this.systemService.restoreRecord(model, id);
    return { success: true, data };
  }

  // ==========================================
  // WORKFLOWS ENGINE
  // ==========================================
  @Post('workflows')
  @Permissions('write:support')
  async createWorkflow(@Body() body: any) {
    const data = await this.systemService.createWorkflow(body);
    return { success: true, data };
  }

  @Get('workflows')
  async listWorkflows() {
    const data = await this.systemService.listWorkflows();
    return { success: true, data };
  }

  @Post('workflows/process/:instanceId')
  async processWorkflowStep(
    @Param('instanceId') instanceId: string,
    @Body('approved') approved: boolean,
    @CurrentUser() user: any,
  ) {
    const data = await this.systemService.processWorkflowStep(
      instanceId,
      approved,
      user.id,
    );
    return { success: true, data };
  }

  // ==========================================
  // DYNAMIC FORM BUILDER
  // ==========================================
  @Post('forms')
  @Permissions('write:support')
  async createFormSchema(@Body() body: any) {
    const data = await this.systemService.createFormSchema(body);
    return { success: true, data };
  }

  @Get('forms')
  async getFormSchemas() {
    const data = await this.systemService.getFormSchemas();
    return { success: true, data };
  }

  @Post('forms/:schemaId/submit')
  async submitForm(
    @Param('schemaId') schemaId: string,
    @CurrentUser() user: any,
    @Body() data: any,
  ) {
    const res = await this.systemService.submitForm(schemaId, user.id, data);
    return { success: true, data: res };
  }

  // ==========================================
  // REPORT BUILDER
  // ==========================================
  @Post('reports')
  @Permissions('write:support')
  async createSavedReport(@CurrentUser() user: any, @Body() body: any) {
    const data = await this.systemService.createSavedReport({
      ...body,
      createdById: user.id,
    });
    return { success: true, data };
  }

  @Get('reports')
  async getSavedReports() {
    const data = await this.systemService.getSavedReports();
    return { success: true, data };
  }

  @Post('reports/run')
  async runAggregatedReport(
    @Body('module') module: string,
    @Body('config') config: any,
  ) {
    const data = await this.systemService.runAggregatedReport(module, config);
    return { success: true, data };
  }

  // ==========================================
  // MATH FORMULAS ENGINE
  // ==========================================
  @Post('formulas')
  @Permissions('write:support')
  async createFormula(@Body() body: any) {
    const data = await this.systemService.createFormula(body);
    return { success: true, data };
  }

  @Get('formulas')
  async getFormulas() {
    const data = await this.systemService.getFormulas();
    return { success: true, data };
  }

  @Post('formulas/eval')
  async evaluateFormula(
    @Body('expression') expression: string,
    @Body('variables') variables: Record<string, number>,
  ) {
    const result = this.systemService.evaluateMath(expression, variables);
    return { success: true, result };
  }

  // ==========================================
  // UNIFIED GLOBAL SEARCH
  // ==========================================
  @Get('search')
  async globalSearch(@Query('q') query: string) {
    const data = await this.systemService.globalSearch(query);
    return { success: true, data };
  }

  // ==========================================
  // DATABASE BACKUP & RESTORE
  // ==========================================
  @Get('backup')
  @Permissions('write:support')
  async getBackupDump() {
    const data = await this.systemService.getBackupDump();
    return { success: true, data };
  }

  @Post('restore')
  @Permissions('write:support')
  async restoreDump(@Body() body: any) {
    const data = await this.systemService.restoreDump(body);
    return { success: true, data };
  }

  // ==========================================
  // TEMPLATE DOCUMENT GENERATOR
  // ==========================================
  @Post('documents/generate')
  async generateDocument(
    @Body('type') type: string,
    @Body('variables') variables: any,
  ) {
    const html = await this.systemService.generateDocument(type, variables);
    return { success: true, data: html };
  }
}
