import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Phase 13 Book 4 Quantum Identity Mesh & AI Supply-Chain Predictor (E2E)', () => {
  let app: INestApplication;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    quantumIdentityMeshLedger: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'ledg-1',
          ledgerCode: 'QID-LEDGER-US-NODE-01',
          identitySubject: 'USER-TECH-8820',
        },
      ]),
    },
    autonomousSupplyChainPredictor: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'pred-1',
          predictionId: 'PRED-SUPPLY-OLED-V2',
          partCategory: 'DISPLAY_MODULES',
        },
      ]),
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1', {
      exclude: ['/', 'health', 'api/v1/health', 'api/v2/(.*)'],
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/iam-security/quantum-identity-ledgers should return identity mesh ledgers', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/iam-security/quantum-identity-ledgers')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].identitySubject).toBe('USER-TECH-8820');
  });

  it('GET /api/v1/inventory/supply-chain-predictions should return supply chain predictions', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/inventory/supply-chain-predictions')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].partCategory).toBe('DISPLAY_MODULES');
  });
});
