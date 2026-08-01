import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { MobileSecurityGuard } from '../../guards/mobile-security.guard';
import {
  SyncEngineService,
  MutationStep,
} from '../../services/sync-engine.service';
import { ConflictResolverService } from '../../services/conflict-resolver.service';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { MobileResponseInterceptor } from '../../interceptors/mobile-response.interceptor';
import { MobileExceptionFilter } from '../../filters/mobile-exception.filter';
import { PrismaService } from '../../../prisma/prisma.service';
import { ResolutionStrategy } from '@prisma/client';

@ApiTags('Mobile Synchronization Engine')
@ApiBearerAuth()
@Controller('mobile/sync')
@UseGuards(JwtAuthGuard)
@UseInterceptors(MobileResponseInterceptor)
@UseFilters(MobileExceptionFilter)
export class MobileSyncController {
  constructor(
    private readonly syncEngine: SyncEngineService,
    private readonly resolver: ConflictResolverService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('push')
  @UseGuards(MobileSecurityGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit offline mutation batch steps' })
  async push(
    @CurrentUser('id') userId: string,
    @Body() body: { deviceUUID: string; steps: MutationStep[] },
  ) {
    const result = await this.syncEngine.processSyncBatch(
      userId,
      body.deviceUUID,
      body.steps,
    );
    return {
      message: 'Offline batch sync processed.',
      data: result,
    };
  }

  @Get('pull')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pull incremental database modifications' })
  async pull(@Query('lastSyncTimestamp') lastSyncTimestamp: string) {
    const updates =
      await this.syncEngine.getIncrementalUpdates(lastSyncTimestamp);
    return {
      message: 'Incremental database modifications retrieved.',
      data: updates,
    };
  }

  @Get('conflicts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List unresolved conflicts for offline batch sync steps',
  })
  async listConflicts() {
    const conflicts = await this.prisma.syncConflict.findMany({
      where: { resolvedStatus: 'CONFLICT' },
    });
    return {
      message: 'Sync conflicts retrieved successfully.',
      data: conflicts,
    };
  }

  @Put('conflicts/:id/resolve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resolve a sync conflict manually' })
  async resolve(
    @Param('id') id: string,
    @Body() body: { strategy: ResolutionStrategy },
  ) {
    await this.resolver.resolveConflict(id, body.strategy);
    return {
      message: 'Conflict resolved successfully.',
    };
  }
}
