import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { PerformanceService } from '../services/performance.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('hr/performance')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Post('goals')
  @Permissions('hr:write')
  @HttpCode(HttpStatus.CREATED)
  async createGoal(
    @Body() body: { title: string; targetDate: Date; description?: string },
    @Request() req: any,
  ) {
    return this.performanceService.createGoal(
      req.user?.id,
      body.title,
      body.targetDate,
      body.description,
    );
  }

  @Post('reviews')
  @Permissions('hr:write')
  @HttpCode(HttpStatus.CREATED)
  async createReview(
    @Body()
    body: {
      userId: string;
      rating: number;
      achievements?: string;
      warnings?: string;
      comments?: string;
    },
    @Request() req: any,
  ) {
    return this.performanceService.createPerformanceReview(
      body.userId,
      req.user?.id,
      body.rating,
      body.achievements,
      body.warnings,
      body.comments,
    );
  }

  @Post('rewards')
  @Permissions('hr:write')
  @HttpCode(HttpStatus.CREATED)
  async issueReward(
    @Body()
    body: {
      userId: string;
      title: string;
      cashValue?: number;
      description?: string;
    },
  ) {
    return this.performanceService.issueReward(
      body.userId,
      body.title,
      body.cashValue,
      body.description,
    );
  }
}
