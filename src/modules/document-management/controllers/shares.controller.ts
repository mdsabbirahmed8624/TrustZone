import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { DocumentSharingService } from '../services/document-sharing.service';
import { DocumentAuditService } from '../services/document-audit.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('shares')
export class SharesController {
  constructor(
    private readonly sharingService: DocumentSharingService,
    private readonly auditService: DocumentAuditService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('shares:write')
  @HttpCode(HttpStatus.CREATED)
  async createShareLink(
    @Body()
    body: {
      documentId: string;
      recipientEmail?: string;
      isViewOnly?: boolean;
      isWatermarked?: boolean;
      expiresInHours?: number;
      maxDownloads?: number;
      watermarkText?: string;
    },
    @Request() req: any,
  ) {
    const share = await this.sharingService.createShareLink(
      body.documentId,
      req.user?.id,
      body.recipientEmail,
      body.isViewOnly ?? true,
      body.isWatermarked ?? true,
      body.expiresInHours || 48,
      body.maxDownloads || 5,
      body.watermarkText,
    );
    await this.auditService.logAudit(body.documentId, 'SHARE', req.user?.id);
    return share;
  }

  @Get(':token')
  async accessShareToken(@Param('token') token: string) {
    const result = await this.sharingService.accessShareToken(token);
    await this.auditService.logAudit(result.document.id, 'VIEW');
    return result;
  }
}
