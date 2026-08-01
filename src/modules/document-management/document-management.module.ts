import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

// Services
import { DocumentService } from './services/document.service';
import { DocumentVersionService } from './services/document-version.service';
import { DocumentStorageService } from './services/document-storage.service';
import { DocumentOcrService } from './services/document-ocr.service';
import { DocumentSearchService } from './services/document-search.service';
import { DocumentApprovalService } from './services/document-approval.service';
import { DocumentSharingService } from './services/document-sharing.service';
import { DocumentRetentionService } from './services/document-retention.service';
import { DocumentAuditService } from './services/document-audit.service';

// Controllers
import { DocumentsController } from './controllers/documents.controller';
import { FoldersController } from './controllers/folders.controller';
import { VersionsController } from './controllers/versions.controller';
import { SearchController } from './controllers/search.controller';
import { SharesController } from './controllers/shares.controller';
import { PermissionsController } from './controllers/permissions.controller';
import { OcrController } from './controllers/ocr.controller';
import { AssetsController } from './controllers/assets.controller';

@Module({
  imports: [PrismaModule],
  providers: [
    DocumentService,
    DocumentVersionService,
    DocumentStorageService,
    DocumentOcrService,
    DocumentSearchService,
    DocumentApprovalService,
    DocumentSharingService,
    DocumentRetentionService,
    DocumentAuditService,
  ],
  controllers: [
    DocumentsController,
    FoldersController,
    VersionsController,
    SearchController,
    SharesController,
    PermissionsController,
    OcrController,
    AssetsController,
  ],
  exports: [
    DocumentService,
    DocumentVersionService,
    DocumentStorageService,
    DocumentOcrService,
    DocumentSearchService,
    DocumentApprovalService,
    DocumentSharingService,
    DocumentRetentionService,
    DocumentAuditService,
  ],
})
export class DocumentManagementModule {}
