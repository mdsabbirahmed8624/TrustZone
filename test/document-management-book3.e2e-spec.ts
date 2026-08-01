import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import * as argon2 from 'argon2';

describe('Phase 11 Book 3 - Enterprise Document Management & Digital Assets (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testUserId: string;

  const testEmail = `doc-admin-${Date.now()}@test.com`;
  const testPassword = 'Password123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create SUPER_ADMIN user
    const hashedPassword = await argon2.hash(testPassword);
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        firstName: 'Doc',
        lastName: 'Manager',
        role: 'SUPER_ADMIN',
        isEmailVerified: true,
      },
    });
    testUserId = user.id;

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: testPassword });

    authToken = loginRes.body.accessToken || loginRes.body.data?.accessToken;
  });

  afterAll(async () => {
    if (prisma && testUserId) {
      await prisma.digitalAsset.deleteMany({});
      await prisma.oCRResult.deleteMany({});
      await prisma.documentAudit.deleteMany({});
      await prisma.documentRetention.deleteMany({});
      await prisma.documentApproval.deleteMany({});
      await prisma.documentReview.deleteMany({});
      await prisma.documentPermission.deleteMany({});
      await prisma.documentShare.deleteMany({});
      await prisma.documentMetadata.deleteMany({});
      await prisma.documentVersion.deleteMany({});
      await prisma.document.deleteMany({});
      await prisma.documentFolder.deleteMany({});
      await prisma.documentCategory.deleteMany({});
      await prisma.documentTag.deleteMany({});
      await prisma.user
        .delete({ where: { email: testEmail } })
        .catch(() => null);
    }
    await app.close();
  });

  describe('Folders & Documents Endpoints (/api/v1/folders & /api/v1/documents)', () => {
    let folderId: string;
    let docId: string;

    it('POST /api/v1/folders - should create folder hierarchy', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/folders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Technical Specifications',
          department: 'ENGINEERING',
        })
        .expect(201);

      folderId = res.body.id;
      expect(folderId).toBeDefined();
      expect(res.body.name).toBe('Technical Specifications');
    });

    it('POST /api/v1/documents - should create document record', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Display Replacement Manual v1',
          folderId,
          department: 'ENGINEERING',
          description: 'Standard repair guide for AMOLED displays',
        })
        .expect(201);

      docId = res.body.id;
      expect(docId).toBeDefined();
      expect(res.body.status).toBe('DRAFT');
    });

    it('POST /api/v1/documents/:id/metadata - should attach metadata and tags', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/documents/${docId}/metadata`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          metadata: { Author: 'TrustZone Engineer', Confidentiality: 'HIGH' },
          tags: ['OLED', 'Hardware', 'Manual'],
        })
        .expect(200);

      expect(res.body.metadata.length).toBeGreaterThan(0);
      expect(res.body.tags.length).toBe(3);
    });
  });

  describe('Versions & Storage Endpoints (/api/v1/versions & /api/v1/assets)', () => {
    let versionId: string;
    let docId: string;

    beforeAll(async () => {
      const doc = await prisma.document.create({
        data: {
          title: 'Network Architecture Spec',
          department: 'IT',
          ownerId: testUserId,
        },
      });
      docId = doc.id;
    });

    it('POST /api/v1/assets/validate - should validate file content and sha256 checksum', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/assets/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sampleContent: 'Enterprise Spec Content 2026',
          mimeType: 'application/pdf',
        })
        .expect(200);

      expect(res.body.validation.isValid).toBe(true);
      expect(res.body.validation.checksumSha256).toBeDefined();
    });

    it('POST /api/v1/versions - should create major version 1.0', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/versions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          documentId: docId,
          filePath: '/storage/spec_v1.pdf',
          fileSize: 2048,
          mimeType: 'application/pdf',
          checksumSha256:
            'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          isMajor: true,
          comment: 'Initial release',
        })
        .expect(201);

      versionId = res.body.id;
      expect(res.body.majorVersion).toBe(1);
      expect(res.body.minorVersion).toBe(0);
    });

    it('POST /api/v1/versions/:versionId/rollback - should create rollback version', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/versions/${versionId}/rollback`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ documentId: docId })
        .expect(200);

      expect(res.body.minorVersion).toBe(1);
      expect(res.body.comment).toContain('Rollback');
    });
  });

  describe('OCR & Enterprise Search (/api/v1/ocr & /api/v1/search)', () => {
    let docId: string;

    beforeAll(async () => {
      const doc = await prisma.document.create({
        data: {
          title: 'Vendor Service Invoice 2026',
          department: 'FINANCE',
          ownerId: testUserId,
        },
      });
      docId = doc.id;
    });

    it('POST /api/v1/ocr/:documentId - should process OCR text extraction', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/ocr/${docId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sampleTextOverride:
            'TrustZone Enterprise Service Invoice Total $4,500. Status Paid.',
        })
        .expect(200);

      expect(res.body.confidenceScore).toBe(0.98);
      expect(res.body.keywords.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/search/documents - should execute multi-field search', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/search/documents')
        .query({ searchTerm: 'Invoice', department: 'FINANCE' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.totalResults).toBeGreaterThan(0);
    });
  });

  describe('Shares & Compliance (/api/v1/shares & /api/v1/permissions)', () => {
    let docId: string;
    let shareToken: string;

    beforeAll(async () => {
      const doc = await prisma.document.create({
        data: {
          title: 'NDA Agreement Customer #500',
          department: 'LEGAL',
          ownerId: testUserId,
        },
      });
      docId = doc.id;
    });

    it('POST /api/v1/shares - should generate tokenized share link', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/shares')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          documentId: docId,
          recipientEmail: 'client@external.com',
          isViewOnly: true,
          isWatermarked: true,
        })
        .expect(201);

      shareToken = res.body.shareToken;
      expect(shareToken).toBeDefined();
    });

    it('GET /api/v1/shares/:token - should access document by token', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/shares/${shareToken}`)
        .expect(200);

      expect(res.body.document.id).toBe(docId);
      expect(res.body.isWatermarked).toBe(true);
    });

    it('POST /api/v1/permissions/documents/:id/hold - should set legal hold', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/permissions/documents/${docId}/hold`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isLegalHold: true })
        .expect(200);

      expect(res.body.isLegalHold).toBe(true);
    });

    it('DELETE /api/v1/documents/:id - should reject deletion when legal hold is active', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/documents/${docId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });
});
