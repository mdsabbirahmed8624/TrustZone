import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Phase 12 Book 1 Franchise Tiers & Royalty Engine (E2E)', () => {
  let app: INestApplication;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    franchiseTier: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 't-1',
          tierName: 'GOLD',
          minRevenueThreshold: 250000,
          royaltyDiscountRate: 0.01,
          marketingFundPercentage: 0.02,
        },
      ]),
      upsert: jest
        .fn()
        .mockImplementation(({ create }) =>
          Promise.resolve({ id: 't-1', ...create }),
        ),
    },
    territoryZone: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'z-1',
          zoneCode: 'US-TX-DAL-01',
          zoneName: 'Dallas North Zone',
          status: 'AVAILABLE',
        },
      ]),
    },
    royaltyInvoice: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    partnerComplianceAudit: {
      findMany: jest.fn().mockResolvedValue([]),
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

  it('GET /api/v1/franchise/tiers should return franchise tier classifications', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/franchise/tiers')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].tierName).toBe('GOLD');
  });

  it('GET /api/v1/franchise/territories should return territory zones', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/franchise/territories')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].zoneCode).toBe('US-TX-DAL-01');
  });
});
