import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AssetCategoryService } from '../services/asset-category.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('assets/categories')
export class CategoriesController {
  constructor(private readonly categoryService: AssetCategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('assets:write')
  @HttpCode(HttpStatus.CREATED)
  async upsertCategory(
    @Body()
    body: {
      name: string;
      code: string;
      description?: string;
      depreciationMethod?: string;
      defaultUsefulLife?: number;
    },
  ) {
    return this.categoryService.upsertCategory(
      body.name,
      body.code,
      body.description,
      body.depreciationMethod,
      body.defaultUsefulLife,
    );
  }

  @Get()
  async getCategories() {
    return this.categoryService.getCategories();
  }
}
