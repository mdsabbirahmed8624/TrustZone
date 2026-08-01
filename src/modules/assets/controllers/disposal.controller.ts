import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DisposalService } from '../services/disposal.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('assets/disposal')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DisposalController {
  constructor(private readonly disposalService: DisposalService) {}

  @Post(':id')
  @Permissions('assets:write')
  @HttpCode(HttpStatus.OK)
  async disposeAsset(
    @Param('id') assetId: string,
    @Body()
    body: { disposalType?: string; salePrice?: number; reason?: string },
  ) {
    return this.disposalService.disposeAsset(
      assetId,
      body.disposalType,
      body.salePrice,
      body.reason,
    );
  }
}
