import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { DocumentVersionService } from '../services/document-version.service';
import { DocumentAuditService } from '../services/document-audit.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('versions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class VersionsController {
  constructor(
    private readonly versionService: DocumentVersionService,
    private readonly auditService: DocumentAuditService,
  ) {}

  @Post()
  @Permissions('versions:write')
  @HttpCode(HttpStatus.CREATED)
  async createVersion(
    @Body()
    body: {
      documentId: string;
      filePath: string;
      fileSize: number;
      mimeType: string;
      checksumSha256: string;
      isMajor?: boolean;
      comment?: string;
      storageProvider?: string;
    },
    @Request() req: any,
  ) {
    const ver = await this.versionService.createVersion(
      body.documentId,
      body.filePath,
      body.fileSize,
      body.mimeType,
      body.checksumSha256,
      body.isMajor || false,
      body.comment,
      body.storageProvider || 'LOCAL',
    );
    await this.auditService.logAudit(body.documentId, 'EDIT', req.user?.id);
    return ver;
  }

  @Post(':versionId/rollback')
  @Permissions('versions:write')
  @HttpCode(HttpStatus.OK)
  async rollbackVersion(
    @Param('versionId') versionId: string,
    @Body() body: { documentId: string },
    @Request() req: any,
  ) {
    const ver = await this.versionService.rollbackVersion(
      body.documentId,
      versionId,
    );
    await this.auditService.logAudit(body.documentId, 'ROLLBACK', req.user?.id);
    return ver;
  }

  @Post(':versionId/lock')
  @Permissions('versions:write')
  @HttpCode(HttpStatus.OK)
  async toggleLock(
    @Param('versionId') versionId: string,
    @Body() body: { isLocked: boolean },
  ) {
    return this.versionService.toggleVersionLock(versionId, body.isLocked);
  }
}
