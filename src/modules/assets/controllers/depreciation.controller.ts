import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DepreciationService } from '../services/depreciation.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('assets/depreciation')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DepreciationController {
  constructor(private readonly depreciationService: DepreciationService) {}

  @Post('calculate/:id')
  @Permissions('assets:write')
  @HttpCode(HttpStatus.OK)
  async calculateDepreciation(
    @Param('id') assetId: string,
    @Body('period') period?: string,
  ) {
    return this.depreciationService.calculateDepreciation(
      assetId,
      period || '2026-07',
    );
  }
}
