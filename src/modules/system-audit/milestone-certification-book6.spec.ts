import { Test, TestingModule } from '@nestjs/testing';
import { MilestoneCertificationBook6Service } from './services/milestone-certification-book6.service';
import { LiveTelemetryStreamBook6Service } from './services/live-telemetry-stream-book6.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 13 Book 6 Unit Tests (Global Milestone Certification & Live Telemetry Stream Audit)', () => {
  let certService: MilestoneCertificationBook6Service;
  let streamService: LiveTelemetryStreamBook6Service;

  const mockPrisma = {
    globalMilestoneCertificationBook6: {
      upsert: jest
        .fn()
        .mockImplementation(({ create }) =>
          Promise.resolve({ id: 'cert-1', ...create }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
    liveTelemetryStreamAuditBook6: {
      upsert: jest
        .fn()
        .mockImplementation(({ create }) =>
          Promise.resolve({ id: 'stream-1', ...create }),
        ),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MilestoneCertificationBook6Service,
        LiveTelemetryStreamBook6Service,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    certService = module.get<MilestoneCertificationBook6Service>(
      MilestoneCertificationBook6Service,
    );
    streamService = module.get<LiveTelemetryStreamBook6Service>(
      LiveTelemetryStreamBook6Service,
    );
    jest.clearAllMocks();
  });

  it('should issue global milestone certification audit Book 6', async () => {
    const cert = await certService.issueCertification({
      certCode: 'CERT-P13-B6-GA-01',
      phaseBookTitle: 'PHASE_13_BOOK_6_ENTERPRISE_GA',
    });

    expect(cert.certificationStatus).toBe('CERTIFIED');
    expect(cert.auditorRole).toBe('CHIEF_ENTERPRISE_ARCHITECT');
  });

  it('should record real-time live telemetry stream audit log Book 6', async () => {
    const stream = await streamService.recordStreamAudit({
      streamId: 'STREAM-AUDIT-IAM-01',
      sourceService: 'IAM_SECURITY_SERVICE',
      eventTopic: 'IDENTITY_MESH_EVENTS',
    });

    expect(stream.telemetryHealth).toBe('HEALTHY');
    expect(stream.throughputPerSec).toBe(14500);
  });
});
