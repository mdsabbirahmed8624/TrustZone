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
import { KnowledgeBaseService } from '../services/knowledge-base.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('support/knowledge')
export class KnowledgeController {
  constructor(private readonly kbService: KnowledgeBaseService) {}

  @Post('categories')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('support:write')
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() body: { name: string; description?: string }) {
    return this.kbService.createCategory(body.name, body.description);
  }

  @Post('articles')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('support:write')
  @HttpCode(HttpStatus.CREATED)
  async createArticle(
    @Body()
    body: {
      title: string;
      content: string;
      category: string;
      tags?: string[];
    },
  ) {
    return this.kbService.createArticle(body);
  }

  @Get('articles')
  async searchArticles(@Query('q') q: string) {
    return this.kbService.searchArticles(q || '');
  }

  @Post('faqs')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('support:write')
  @HttpCode(HttpStatus.CREATED)
  async createFAQ(
    @Body()
    body: {
      question: string;
      answer: string;
      category?: string;
      displayOrder?: number;
    },
  ) {
    return this.kbService.createFAQ(
      body.question,
      body.answer,
      body.category,
      body.displayOrder,
    );
  }

  @Get('faqs')
  async getFAQs() {
    return this.kbService.getFAQs();
  }
}
