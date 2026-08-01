import { Test, TestingModule } from '@nestjs/testing';
import { CertificationBook6Service } from './services/certification-book6.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 12 Book 6 Unit Tests (Milestone Certification & Live Telemetry)', () => {
  let certService: CertificationBook6Service;

  const mockPrisma = {
    globalMilestoneCertification: {
      upsert: jest
        .fn()
        .mockImplementation(({ create }) =>
          Promise.resolve({ id: 'cert-1', ...create }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
    liveSystemTelemetryLog: {
      create: jest
        .fn()
        .mockImplementation(({ data }) =>
          Promise.resolve({ id: 'tel-1', ...data }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificationBook6Service,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    certService = module.get<CertificationBook6Service>(
      CertificationBook6Service,
    );
    jest.clearAllMocks();
  });

  it('should sign off and certify Phase 12 milestone release', async () => {
    const cert = await certService.certifyMilestoneRelease({
      milestoneCode: 'PHASE-12-FINAL-GA-RELEASE',
      certifiedVersion: '12.6.0-GA',
    });

    expect(cert.status).toBe('APPROVED_AND_CERTIFIED');
    expect(cert.milestoneCode).toBe('PHASE-12-FINAL-GA-RELEASE');
  });

  it('should record live production system telemetry metrics', async () => {
    const log = await certService.recordTelemetryLog({
      serviceName: 'TRUSTZONE_ERP_API',
      cpuUsagePercent: 18.4,
      memoryUsagePercent: 42.1,
      throughputRps: 1450.0,
    });

    expect(log.throughputRps).toBe(1450.0);
    expect(log.errorRatePercent).toBe(0.0);
  });
});
