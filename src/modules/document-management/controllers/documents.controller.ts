import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { DocumentService } from '../services/document.service';
import { DocumentRetentionService } from '../services/document-retention.service';
import { DocumentAuditService } from '../services/document-audit.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('documents')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DocumentsController {
  constructor(
    private readonly documentService: DocumentService,
    private readonly retentionService: DocumentRetentionService,
    private readonly auditService: DocumentAuditService,
  ) {}

  @Post()
  @Permissions('documents:write')
  @HttpCode(HttpStatus.CREATED)
  async createDocument(
    @Body()
    body: {
      title: string;
      folderId?: string;
      categoryId?: string;
      department?: string;
      description?: string;
    },
    @Request() req: any,
  ) {
    const doc = await this.documentService.createDocument(
      body.title,
      req.user?.id,
      body.folderId,
      body.categoryId,
      body.department,
      body.description,
    );
    await this.auditService.logAudit(doc.id, 'EDIT', req.user?.id);
    return doc;
  }

  @Post(':id/metadata')
  @Permissions('documents:write')
  @HttpCode(HttpStatus.OK)
  async attachMetadata(
    @Param('id') id: string,
    @Body() body: { metadata?: Record<string, string>; tags?: string[] },
  ) {
    return this.documentService.attachMetadata(
      id,
      body.metadata || {},
      body.tags || [],
    );
  }

  @Post(':id/status')
  @Permissions('documents:write')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.documentService.updateStatus(id, body.status);
  }

  @Delete(':id')
  @Permissions('documents:delete')
  async softDeleteDocument(@Param('id') id: string, @Request() req: any) {
    const result = await this.retentionService.softDeleteDocument(id);
    await this.auditService.logAudit(id, 'DELETE', req.user?.id);
    return result;
  }
}
