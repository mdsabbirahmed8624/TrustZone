import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AssetService } from '../services/asset.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('assets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AssetsController {
  constructor(private readonly assetService: AssetService) {}

  @Post()
  @Permissions('assets:write')
  @HttpCode(HttpStatus.CREATED)
  async registerAsset(
    @Body()
    body: {
      name: string;
      categoryId: string;
      description?: string;
      serialNumber?: string;
      locationId?: string;
      department?: string;
      branchId?: string;
      ownership?: string;
      purchaseCost: number;
      salvageValue?: number;
      usefulLifeMonths?: number;
      purchaseDate?: Date;
    },
  ) {
    return this.assetService.registerAsset(body);
  }

  @Get()
  @Permissions('assets:read')
  async getAssets(
    @Query('status') status?: string,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.assetService.getAssets({
      status,
      categoryId,
      search,
      page,
      limit,
    });
  }

  @Post(':id/status')
  @Permissions('assets:write')
  @HttpCode(HttpStatus.OK)
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.assetService.updateStatus(id, status);
  }
}
