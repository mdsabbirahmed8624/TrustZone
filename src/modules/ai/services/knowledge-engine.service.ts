import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class KnowledgeEngineService {
  private readonly logger = new Logger(KnowledgeEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createKnowledgeArticle(
    title: string,
    content: string,
    tags: string[],
    category: string,
  ) {
    this.logger.log(`Creating new knowledge article: "${title}"`);
    return this.prisma.knowledgeArticle.create({
      data: {
        title,
        content,
        tags,
        category,
      },
    });
  }

  async searchArticles(query: string, userId: string) {
    this.logger.log(`Searching knowledge articles for query: "${query}"`);

    const articles = await this.prisma.knowledgeArticle.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } },
        ],
      },
    });

    // Log the search
    await this.prisma.knowledgeSearch.create({
      data: {
        query,
        userId,
        articleId: articles[0]?.id || null,
      },
    });

    return articles;
  }
}
