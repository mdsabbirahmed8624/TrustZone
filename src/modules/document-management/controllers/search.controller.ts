import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DocumentSearchService } from '../services/document-search.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('search')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SearchController {
  constructor(private readonly searchService: DocumentSearchService) {}

  @Get('documents')
  @Permissions('documents:read')
  async searchDocuments(
    @Query('searchTerm') searchTerm?: string,
    @Query('department') department?: string,
    @Query('ownerId') ownerId?: string,
    @Query('status') status?: string,
    @Query('tagName') tagName?: string,
  ) {
    return this.searchService.searchDocuments({
      searchTerm,
      department,
      ownerId,
      status,
      tagName,
    });
  }
}
