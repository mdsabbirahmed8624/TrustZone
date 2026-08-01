import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { KnowledgeEngineService } from '../services/knowledge-engine.service';

@Controller('knowledge')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeEngineService) {}

  @Post('articles')
  @Permissions('write:reports')
  @HttpCode(HttpStatus.CREATED)
  async createArticle(
    @Body('title') title: string,
    @Body('content') content: string,
    @Body('tags') tags: string[],
    @Body('category') category: string,
  ) {
    return {
      success: true,
      data: await this.knowledgeService.createKnowledgeArticle(
        title,
        content,
        tags,
        category,
      ),
    };
  }

  @Get('search')
  @Permissions('read:reports')
  @HttpCode(HttpStatus.OK)
  async searchArticles(
    @Query('query') query: string,
    @CurrentUser('id') userId: string,
  ) {
    return {
      success: true,
      data: await this.knowledgeService.searchArticles(query, userId),
    };
  }
}
