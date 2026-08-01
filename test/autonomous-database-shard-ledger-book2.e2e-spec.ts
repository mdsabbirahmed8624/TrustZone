import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Phase 15 Book 2 — Autonomous Database Sharding & Sovereign Zero-Trust Ledger E2E', () => {
  let app: INestApplication;

  const mockPrismaService = {
    autonomousDatabaseShardBook2: {
      upsert: jest.fn().mockResolvedValue({
        id: 'shard-uuid-001',
        shardCode: 'SHARD-EU-WEST-01',
        shardRegion: 'EU_CENTRAL_GERMANY',
        assignedTenantCount: 1500,
        shardStatus: 'ACTIVE_HEALTHY',
        latencyMs: 2.1,
        lastRebalancedAt: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'shard-uuid-001',
          shardCode: 'SHARD-EU-WEST-01',
          shardRegion: 'EU_CENTRAL_GERMANY',
          assignedTenantCount: 1500,
          shardStatus: 'ACTIVE_HEALTHY',
          latencyMs: 2.1,
          lastRebalancedAt: new Date(),
          createdAt: new Date(),
        },
      ]),
    },
    sovereignZeroTrustLedgerBook2: {
      upsert: jest.fn().mockResolvedValue({
        id: 'ledger-uuid-001',
        ledgerBlockCode: 'LEDGER-BLOCK-P15-B2-01',
        previousBlockHash:
          '0000000000000000000000000000000000000000000000000000000000000000',
        merkleRootHash:
          'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        consensusProtocol: 'PBFT_ZERO_TRUST_QUORUM',
        auditComplianceVerified: true,
        timestamp: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'ledger-uuid-001',
          ledgerBlockCode: 'LEDGER-BLOCK-P15-B2-01',
          previousBlockHash:
            '0000000000000000000000000000000000000000000000000000000000000000',
          merkleRootHash:
            'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          consensusProtocol: 'PBFT_ZERO_TRUST_QUORUM',
          auditComplianceVerified: true,
          timestamp: new Date(),
          createdAt: new Date(),
        },
      ]),
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v15/autonomous-database-shard-book2 should return 200', () => {
    return request(app.getHttpServer())
      .get('/api/v15/autonomous-database-shard-book2')
      .expect(200);
  });

  it('POST /api/v15/autonomous-database-shard-book2/register should return 201', () => {
    return request(app.getHttpServer())
      .post('/api/v15/autonomous-database-shard-book2/register')
      .send({
        shardCode: 'SHARD-EU-WEST-01',
        shardRegion: 'EU_CENTRAL_GERMANY',
      })
      .expect(201);
  });

  it('GET /api/v15/sovereign-zerotrust-ledger-book2 should return 200', () => {
    return request(app.getHttpServer())
      .get('/api/v15/sovereign-zerotrust-ledger-book2')
      .expect(200);
  });

  it('POST /api/v15/sovereign-zerotrust-ledger-book2/record should return 201', () => {
    return request(app.getHttpServer())
      .post('/api/v15/sovereign-zerotrust-ledger-book2/record')
      .send({ ledgerBlockCode: 'LEDGER-BLOCK-P15-B2-01' })
      .expect(201);
  });
});
