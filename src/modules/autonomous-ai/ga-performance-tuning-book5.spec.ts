import { Test, TestingModule } from '@nestjs/testing';
import { GaPerformanceTuningBook5Service } from './services/ga-performance-tuning-book5.service';
import { CrossCloudTelemetryBook5Service } from '../iam-security/services/cross-cloud-telemetry-book5.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 13 Book 5 Unit Tests (GA Performance Tuning & Cross-Cloud Telemetry Audit)', () => {
  let tuningService: GaPerformanceTuningBook5Service;
  let telemetryService: CrossCloudTelemetryBook5Service;

  const mockPrisma = {
    autonomousGaPerformanceTuningJob: {
      upsert: jest
        .fn()
        .mockImplementation(({ create }) =>
          Promise.resolve({ id: 'job-1', ...create }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
    crossCloudTelemetryAudit: {
      upsert: jest
        .fn()
        .mockImplementation(({ create }) =>
          Promise.resolve({ id: 'audit-1', ...create }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GaPerformanceTuningBook5Service,
        CrossCloudTelemetryBook5Service,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    tuningService = module.get<GaPerformanceTuningBook5Service>(
      GaPerformanceTuningBook5Service,
    );
    telemetryService = module.get<CrossCloudTelemetryBook5Service>(
      CrossCloudTelemetryBook5Service,
    );
    jest.clearAllMocks();
  });

  it('should execute autonomous AI GA performance tuning job', async () => {
    const job = await tuningService.executeTuningJob({
      jobCode: 'GA-TUNING-JOB-01',
      evaluatedComponent: 'DB_QUERY_INDEXING',
    });

    expect(job.status).toBe('OPTIMIZED');
    expect(job.optimizationGainPercent).toBe(18.5);
  });

  it('should record zero-trust cross-cloud security telemetry audit log', async () => {
    const audit = await telemetryService.recordTelemetryAudit({
      telemetryId: 'XCLOUD-TEL-AWS-US-EAST',
      cloudProvider: 'AWS',
      clusterRegion: 'us-east-1',
    });

    expect(audit.securityPostureStatus).toBe('COMPLIANT');
    expect(audit.threatTelemetryScore).toBe(98);
  });
});
