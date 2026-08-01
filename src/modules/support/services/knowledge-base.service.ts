import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class KnowledgeBaseService {
  private readonly logger = new Logger(KnowledgeBaseService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates Knowledge Category
   */
  async createCategory(name: string, description?: string) {
    return this.prisma.knowledgeCategory.upsert({
      where: { name },
      update: { description: description || null },
      create: { name, description: description || null },
    });
  }

  /**
   * Creates Knowledge Base Article
   */
  async createArticle(data: {
    title: string;
    content: string;
    category: string;
    tags?: string[];
  }) {
    const article = await this.prisma.knowledgeArticle.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags || [],
        version: 1,
      },
    });

    this.logger.log(
      `Created KnowledgeArticle '${article.title}' [Category: ${article.category}]`,
    );
    return article;
  }

  /**
   * Searches Knowledge Base articles by term
   */
  async searchArticles(query: string) {
    return this.prisma.knowledgeArticle.findMany({
      where: {
        isDeleted: false,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } },
        ],
      },
      take: 20,
    });
  }

  /**
   * Creates FAQ item
   */
  async createFAQ(
    question: string,
    answer: string,
    category = 'General',
    displayOrder = 1,
  ) {
    return this.prisma.fAQ.upsert({
      where: { question },
      update: { answer, category, displayOrder },
      create: { question, answer, category, displayOrder },
    });
  }

  /**
   * Retrieves all FAQs
   */
  async getFAQs() {
    return this.prisma.fAQ.findMany({ orderBy: { displayOrder: 'asc' } });
  }
}
