import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { KPIEngineService } from './services/kpi-engine.service';

@Controller('kpi')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class KPIController {
  constructor(private readonly kpiService: KPIEngineService) {}

  @Get()
  @Permissions('read:reports')
  @HttpCode(HttpStatus.OK)
  async getKPIs(
    @Query('branchId') branchId?: string,
    @CurrentUser() staff?: any,
  ) {
    const enforcedBranchId =
      staff?.role === 'Branch Manager' ? staff.branchId : branchId;

    return {
      success: true,
      data: await this.kpiService.calculateKPIs(enforcedBranchId),
    };
  }

  @Post('configure')
  @Permissions('write:reports')
  @HttpCode(HttpStatus.CREATED)
  async configureKPI(
    @Body('formulaKey') formulaKey: string,
    @Body('targetValue') targetValue: number,
  ) {
    return {
      success: true,
      data: await this.kpiService.configureKPI(formulaKey, targetValue),
    };
  }
}
