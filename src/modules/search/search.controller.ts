import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('search')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Permissions('read:support')
  async search(@Query('q') q: string, @Query('limit') limit?: number) {
    const data = await this.searchService.globalSearch(
      q,
      limit ? Number(limit) : 5,
    );
    return { success: true, data };
  }
}
