import { Test, TestingModule } from '@nestjs/testing';
import { AssetService } from './asset.service';
import { AssetCategoryService } from './asset-category.service';
import { AssignmentService } from './assignment.service';
import { TransferService } from './transfer.service';
import { MaintenanceService } from './maintenance.service';
import { InspectionService } from './inspection.service';
import { DepreciationService } from './depreciation.service';
import { DisposalService } from './disposal.service';
import { WorkOrderService } from './work-order.service';
import { AssetAnalyticsService } from './asset-analytics.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('Enterprise Asset Management (EAM) Unit Tests (Book 8)', () => {
  let assetService: AssetService;
  let categoryService: AssetCategoryService;
  let assignmentService: AssignmentService;
  let transferService: TransferService;
  let maintenanceService: MaintenanceService;
  let inspectionService: InspectionService;
  let depreciationService: DepreciationService;
  let disposalService: DisposalService;
  let workOrderService: WorkOrderService;
  let analyticsService: AssetAnalyticsService;

  const mockPrismaService = {
    asset: {
      create: jest.fn().mockResolvedValue({
        id: 'ast-1',
        assetTag: 'AST-100293',
        name: 'Master Solder Workstation',
        purchaseCost: 5000,
        salvageValue: 500,
        usefulLifeMonths: 60,
        accumulatedDepr: 0,
        netBookValue: 5000,
        qrCode: 'QR-AST-100293',
        barcode: 'BAR-AST-100293',
        status: 'AVAILABLE',
      }),
      findUnique: jest.fn().mockResolvedValue({
        id: 'ast-1',
        assetTag: 'AST-100293',
        name: 'Master Solder Workstation',
        purchaseCost: 5000,
        salvageValue: 500,
        usefulLifeMonths: 60,
        accumulatedDepr: 0,
        netBookValue: 5000,
        status: 'AVAILABLE',
      }),
      update: jest.fn().mockResolvedValue({
        id: 'ast-1',
        status: 'ASSIGNED',
        netBookValue: 4925,
      }),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(15),
    },
    assetCategory: {
      upsert: jest.fn().mockResolvedValue({
        id: 'cat-1',
        name: 'Repair Equipment',
        code: 'EQUIP',
      }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    assetAssignment: {
      create: jest.fn().mockResolvedValue({ id: 'asgn-1', status: 'ACTIVE' }),
      findUnique: jest.fn().mockResolvedValue({
        id: 'asgn-1',
        assetId: 'ast-1',
        status: 'ACTIVE',
      }),
      update: jest.fn().mockResolvedValue({ id: 'asgn-1', status: 'RETURNED' }),
    },
    assetTransfer: {
      create: jest.fn().mockResolvedValue({ id: 'trf-1', status: 'PENDING' }),
      update: jest.fn().mockResolvedValue({
        id: 'trf-1',
        assetId: 'ast-1',
        status: 'APPROVED',
      }),
    },
    assetMaintenance: {
      create: jest
        .fn()
        .mockResolvedValue({ id: 'maint-1', cost: 150, status: 'COMPLETED' }),
      count: jest.fn().mockResolvedValue(3),
    },
    maintenanceSchedule: {
      create: jest.fn().mockResolvedValue({
        id: 'sch-1',
        taskName: 'Monthly Calibration',
        frequencyDays: 30,
      }),
    },
    maintenanceHistory: {
      create: jest.fn().mockResolvedValue({ id: 'mh-1' }),
    },
    assetInspection: {
      create: jest.fn().mockResolvedValue({
        id: 'insp-1',
        condition: 'EXCELLENT',
        score: 98,
        passed: true,
      }),
    },
    assetDepreciation: {
      create: jest.fn().mockResolvedValue({
        id: 'dep-1',
        period: '2026-07',
        deprAmount: 75,
        endingValue: 4925,
      }),
    },
    assetDisposal: {
      create: jest.fn().mockResolvedValue({
        id: 'disp-1',
        disposalType: 'SALE',
        salePrice: 4000,
        gainLossAmount: -1000,
      }),
    },
    maintenanceTechnician: {
      create: jest.fn().mockResolvedValue({
        id: 'tech-1',
        name: 'John Doe',
        specialization: 'Micro-Soldering',
      }),
    },
    maintenanceWorkOrder: {
      create: jest.fn().mockResolvedValue({
        id: 'mwo-1',
        workOrderNo: 'MWO-1001',
        totalCost: 200,
      }),
      count: jest.fn().mockResolvedValue(4),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetService,
        AssetCategoryService,
        AssignmentService,
        TransferService,
        MaintenanceService,
        InspectionService,
        DepreciationService,
        DisposalService,
        WorkOrderService,
        AssetAnalyticsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    assetService = module.get<AssetService>(AssetService);
    categoryService = module.get<AssetCategoryService>(AssetCategoryService);
    assignmentService = module.get<AssignmentService>(AssignmentService);
    transferService = module.get<TransferService>(TransferService);
    maintenanceService = module.get<MaintenanceService>(MaintenanceService);
    inspectionService = module.get<InspectionService>(InspectionService);
    depreciationService = module.get<DepreciationService>(DepreciationService);
    disposalService = module.get<DisposalService>(DisposalService);
    workOrderService = module.get<WorkOrderService>(WorkOrderService);
    analyticsService = module.get<AssetAnalyticsService>(AssetAnalyticsService);
  });

  describe('Asset & Category Registration', () => {
    it('should register asset with auto generated tags and QR codes', async () => {
      const ast = await assetService.registerAsset({
        name: 'Master Solder Workstation',
        categoryId: 'cat-1',
        purchaseCost: 5000,
      });
      expect(ast.assetTag).toBeDefined();
      expect(ast.qrCode).toBeDefined();
    });

    it('should upsert asset category with depreciation rules', async () => {
      const cat = await categoryService.upsertCategory(
        'Repair Equipment',
        'EQUIP',
      );
      expect(cat.code).toBe('EQUIP');
    });
  });

  describe('Assignment & Transfer Workflows', () => {
    it('should checkout asset to employee and process return', async () => {
      const asgn = await assignmentService.assignAsset('ast-1', 'user-1');
      const ret = await assignmentService.returnAsset('asgn-1');
      expect(asgn.status).toBe('ACTIVE');
      expect(ret.status).toBe('RETURNED');
    });

    it('should request and approve inter-branch asset transfer', async () => {
      const trf = await transferService.requestTransfer(
        'ast-1',
        'Dhanmondi Branch',
      );
      const appr = await transferService.approveTransfer(trf.id);
      expect(appr.status).toBe('APPROVED');
    });
  });

  describe('Maintenance, Inspection & Depreciation Engine', () => {
    it('should log preventive maintenance and create work order', async () => {
      const maint = await maintenanceService.logMaintenance({
        assetId: 'ast-1',
        description: 'Thermal paste replacement',
        performedBy: 'Tech Lead',
      });
      const wo = await workOrderService.createWorkOrder({
        assetId: 'ast-1',
        description: 'Screen tester repair',
        partsCost: 150,
        laborCost: 50,
      });
      expect(maint.status).toBe('COMPLETED');
      expect(wo.totalCost).toBe(200);
    });

    it('should calculate monthly straight-line depreciation schedule', async () => {
      const dep = await depreciationService.calculateDepreciation(
        'ast-1',
        '2026-07',
      );
      expect(dep.deprAmount).toBe(75);
      expect(dep.endingValue).toBe(4925);
    });

    it('should submit asset condition inspection and process disposal', async () => {
      const insp = await inspectionService.submitInspection({
        assetId: 'ast-1',
        inspectorName: 'QA Lead',
        score: 98,
      });
      const disp = await disposalService.disposeAsset('ast-1', 'SALE', 4000);
      expect(insp.passed).toBe(true);
      expect(disp.gainLossAmount).toBe(-1000);
    });

    it('should return executive asset analytics dashboard metrics', async () => {
      const dash = await analyticsService.getExecutiveDashboard();
      expect(dash.overview.totalAssets).toBe(15);
      expect(dash.overview.assetUptimePercentage).toBeDefined();
    });
  });
});
