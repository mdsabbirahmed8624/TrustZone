import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { DocumentVersionService } from './document-version.service';
import { DocumentStorageService } from './document-storage.service';
import { DocumentOcrService } from './document-ocr.service';
import { DocumentSearchService } from './document-search.service';
import { DocumentApprovalService } from './document-approval.service';
import { DocumentSharingService } from './document-sharing.service';
import { DocumentRetentionService } from './document-retention.service';
import { DocumentAuditService } from './document-audit.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('Document Management Unit Tests (Book 3)', () => {
  let documentService: DocumentService;
  let versionService: DocumentVersionService;
  let storageService: DocumentStorageService;
  let ocrService: DocumentOcrService;
  let searchService: DocumentSearchService;
  let approvalService: DocumentApprovalService;
  let sharingService: DocumentSharingService;
  let retentionService: DocumentRetentionService;
  let auditService: DocumentAuditService;

  const mockPrismaService = {
    document: {
      create: jest
        .fn()
        .mockResolvedValue({ id: 'doc-1', title: 'Service Policy' }),
      findUnique: jest.fn().mockResolvedValue({
        id: 'doc-1',
        title: 'Service Policy',
        versions: [],
        isLegalHold: false,
      }),
      update: jest.fn().mockResolvedValue({ id: 'doc-1', status: 'PUBLISHED' }),
      findMany: jest
        .fn()
        .mockResolvedValue([{ id: 'doc-1', title: 'Service Policy' }]),
    },
    documentFolder: {
      create: jest.fn().mockResolvedValue({ id: 'fold-1', name: 'Policies' }),
    },
    documentMetadata: {
      upsert: jest.fn().mockResolvedValue({ id: 'meta-1' }),
    },
    documentTag: {
      upsert: jest.fn().mockResolvedValue({ id: 'tag-1', name: 'Enterprise' }),
    },
    documentVersion: {
      create: jest
        .fn()
        .mockResolvedValue({ id: 'ver-1', majorVersion: 1, minorVersion: 0 }),
      findUnique: jest.fn().mockResolvedValue({
        id: 'ver-1',
        documentId: 'doc-1',
        majorVersion: 1,
        minorVersion: 0,
      }),
      findFirst: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue({ id: 'ver-1', isLocked: true }),
    },
    oCRResult: {
      create: jest.fn().mockResolvedValue({
        id: 'ocr-1',
        confidenceScore: 0.98,
        keywords: ['invoice', 'trustzone'],
      }),
      findFirst: jest.fn().mockResolvedValue({
        id: 'ocr-1',
        extractedText: 'TrustZone Invoice Content',
      }),
    },
    documentReview: {
      create: jest.fn().mockResolvedValue({ id: 'rev-1', status: 'PENDING' }),
    },
    documentApproval: {
      create: jest
        .fn()
        .mockResolvedValue({ id: 'appr-1', decision: 'APPROVED' }),
    },
    documentShare: {
      create: jest.fn().mockResolvedValue({
        id: 'share-1',
        shareToken: 'tok-123',
        downloadCount: 0,
      }),
      findUnique: jest.fn().mockResolvedValue({
        id: 'share-1',
        shareToken: 'tok-123',
        downloadCount: 0,
        document: { id: 'doc-1' },
      }),
      update: jest.fn().mockResolvedValue({ id: 'share-1', downloadCount: 1 }),
    },
    documentRetention: {
      create: jest.fn().mockResolvedValue({
        id: 'ret-1',
        policyName: '7-Year Corporate Policy',
      }),
    },
    documentAudit: {
      create: jest.fn().mockResolvedValue({ id: 'aud-1', action: 'VIEW' }),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    documentService = module.get<DocumentService>(DocumentService);
    versionService = module.get<DocumentVersionService>(DocumentVersionService);
    storageService = module.get<DocumentStorageService>(DocumentStorageService);
    ocrService = module.get<DocumentOcrService>(DocumentOcrService);
    searchService = module.get<DocumentSearchService>(DocumentSearchService);
    approvalService = module.get<DocumentApprovalService>(
      DocumentApprovalService,
    );
    sharingService = module.get<DocumentSharingService>(DocumentSharingService);
    retentionService = module.get<DocumentRetentionService>(
      DocumentRetentionService,
    );
    auditService = module.get<DocumentAuditService>(DocumentAuditService);
  });

  describe('DocumentService & Versioning', () => {
    it('should create a document', async () => {
      const doc = await documentService.createDocument('Warranty Agreement');
      expect(doc.title).toBe('Service Policy');
    });

    it('should create version 1.0', async () => {
      const ver = await versionService.createVersion(
        'doc-1',
        '/files/doc.pdf',
        1024,
        'application/pdf',
        'hash123',
      );
      expect(ver.majorVersion).toBe(1);
    });
  });

  describe('DocumentStorageService & OCR', () => {
    it('should validate file and compute SHA256 checksum', () => {
      const buf = Buffer.from('PDF Test Content');
      const res = storageService.validateAndComputeChecksum(
        buf,
        'application/pdf',
      );
      expect(res.isValid).toBe(true);
      expect(res.checksumSha256).toBeDefined();
    });

    it('should extract OCR text and keywords', async () => {
      const res = await ocrService.processOcr('doc-1');
      expect(res.confidenceScore).toBe(0.98);
    });
  });

  describe('DocumentSearchService & Sharing', () => {
    it('should search documents by term', async () => {
      const res = await searchService.searchDocuments({
        searchTerm: 'Invoice',
      });
      expect(res.totalResults).toBe(1);
    });

    it('should create tokenized share link', async () => {
      const share = await sharingService.createShareLink(
        'doc-1',
        'user-1',
        'client@mail.com',
      );
      expect(share.shareToken).toBe('tok-123');
    });
  });

  describe('Retention & Auditing', () => {
    it('should set legal hold status', async () => {
      mockPrismaService.document.update.mockResolvedValueOnce({
        id: 'doc-1',
        isLegalHold: true,
      });
      const doc = await retentionService.setLegalHold('doc-1', true);
      expect(doc.isLegalHold).toBe(true);
    });

    it('should record audit event', async () => {
      const audit = await auditService.logAudit('doc-1', 'VIEW', 'user-1');
      expect(audit.action).toBe('VIEW');
    });
  });
});
