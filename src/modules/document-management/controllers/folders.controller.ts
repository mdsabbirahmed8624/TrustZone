import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { DocumentService } from '../services/document.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('folders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FoldersController {
  constructor(
    private readonly documentService: DocumentService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Permissions('folders:write')
  @HttpCode(HttpStatus.CREATED)
  async createFolder(
    @Body()
    body: {
      name: string;
      parentId?: string;
      department?: string;
    },
    @Request() req: any,
  ) {
    return this.documentService.createFolder(
      body.name,
      body.parentId,
      body.department,
      req.user?.id,
    );
  }

  @Get()
  @Permissions('folders:read')
  async getFolderTree() {
    return this.prisma.documentFolder.findMany({
      where: { isDeleted: false, parentId: null },
      include: { children: true, documents: true },
    });
  }
}
