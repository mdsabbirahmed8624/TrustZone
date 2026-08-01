import { Test, TestingModule } from '@nestjs/testing';
import {
  DiagnosticsService,
  CreateDiagnosticDto,
} from './services/diagnostics.service';
import {
  TelemetryTrackerService,
  RecordTelemetryDto,
} from './services/telemetry-tracker.service';
import { PdfReportService } from './services/pdf-report.service';
import { AttachmentStorageService } from './services/attachment-storage.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Diagnostics & Telemetry Engine (Book 5)', () => {
  let diagnosticsService: DiagnosticsService;
  let telemetryService: TelemetryTrackerService;
  let pdfService: PdfReportService;
  let prisma: PrismaService;

  const mockPrisma = {
    deviceDiagnostic: {
      create: jest
        .fn()
        .mockImplementation((args) =>
          Promise.resolve({ id: 'diag-1', ...args.data }),
        ),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    technicianTelemetry: {
      create: jest
        .fn()
        .mockImplementation((args) =>
          Promise.resolve({ id: 'tel-1', ...args.data }),
        ),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    diagnosticReportPdf: {
      create: jest
        .fn()
        .mockImplementation((args) =>
          Promise.resolve({ id: 'pdf-1', ...args.data }),
        ),
    },
  };

  const mockStorage = {
    storeAttachment: jest
      .fn()
      .mockResolvedValue('file:///mocked_file_path.pdf'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiagnosticsService,
        TelemetryTrackerService,
        PdfReportService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AttachmentStorageService, useValue: mockStorage },
      ],
    }).compile();

    diagnosticsService = module.get<DiagnosticsService>(DiagnosticsService);
    telemetryService = module.get<TelemetryTrackerService>(
      TelemetryTrackerService,
    );
    pdfService = module.get<PdfReportService>(PdfReportService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('Diagnostics Auto Recommendation Engine', () => {
    it('should generate low battery recommendation', async () => {
      const dto: CreateDiagnosticDto = {
        ticketId: 'ticket-1',
        batteryHealth: 75,
        storageRemainingGb: 64,
        screenStatus: 'OK',
        cameraStatus: 'OK',
        sensorStatus: 'OK',
        bandwidthDownMbps: 45,
        diagnosticNotes: 'Clean inspection.',
      };

      const result = await diagnosticsService.createDiagnostic('tech-1', dto);
      expect(result.recommendations).toContain(
        'Recommend battery replacement (Health < 80%)',
      );
      expect(result.diagnostic.diagnosticNotes).toContain(
        'Recommend battery replacement',
      );
    });

    it('should generate cracked screen recommendation', async () => {
      const dto: CreateDiagnosticDto = {
        ticketId: 'ticket-1',
        batteryHealth: 95,
        storageRemainingGb: 64,
        screenStatus: 'CRACKED',
        cameraStatus: 'OK',
        sensorStatus: 'OK',
        bandwidthDownMbps: 45,
      };

      const result = await diagnosticsService.createDiagnostic('tech-1', dto);
      expect(result.recommendations).toContain(
        'Recommend screen module service (Screen status: CRACKED)',
      );
    });
  });

  describe('Telemetry Duration & Performance metrics', () => {
    it('should calculate duration between start and complete logs dynamically', async () => {
      const startLogTime = new Date(Date.now() - 30 * 60000); // 30 mins ago
      mockPrisma.technicianTelemetry.findFirst.mockResolvedValueOnce({
        id: 'tel-start',
        createdAt: startLogTime,
      });

      const dto: RecordTelemetryDto = {
        ticketId: 'ticket-1',
        action: 'REPAIR_COMPLETE',
      };

      const result = await telemetryService.recordTelemetry('tech-1', dto);
      expect(result.durationMin).toBe(30);
    });

    it('should aggregate technician performance metrics', async () => {
      mockPrisma.technicianTelemetry.findMany.mockResolvedValueOnce([
        { action: 'REPAIR_COMPLETE', durationMin: 45 },
        { action: 'REPAIR_COMPLETE', durationMin: 75 }, // SLA violation (> 60 mins)
      ]);

      const metrics =
        await telemetryService.getTechnicianPerformanceMetrics('tech-1');
      expect(metrics.totalRepairsCompleted).toBe(2);
      expect(metrics.averageRepairDurationMinutes).toBe(60);
      expect(metrics.slaViolationsCount).toBe(1);
    });
  });

  describe('PDF Diagnostic Report Generator', () => {
    it('should compose dynamic report layout text and upload it', async () => {
      mockPrisma.deviceDiagnostic.findUnique.mockResolvedValueOnce({
        id: 'diag-1',
        batteryHealth: 88,
        storageRemainingGb: 12.5,
        screenStatus: 'OK',
        cameraStatus: 'OK',
        sensorStatus: 'OK',
        bandwidthDownMbps: 54,
        diagnosticNotes: 'All clear',
        technician: { id: 'tech-1', firstName: 'Tech', lastName: 'First' },
        ticket: {
          id: 'ticket-1',
          customer: { firstName: 'John', lastName: 'Doe', phone: '12345' },
        },
      });

      const pdfUrl = await pdfService.generatePdfReport('diag-1');
      expect(pdfUrl).toBe('file:///mocked_file_path.pdf');
      expect(mockStorage.storeAttachment).toHaveBeenCalled();
      expect(mockPrisma.diagnosticReportPdf.create).toHaveBeenCalled();
    });
  });
});
