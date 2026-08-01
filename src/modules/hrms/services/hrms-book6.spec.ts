import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeService } from './employee.service';
import { AttendanceService } from './attendance.service';
import { ShiftService } from './shift.service';
import { LeaveService } from './leave.service';
import { PayrollService } from './payroll.service';
import { PerformanceService } from './performance.service';
import { RecruitmentService } from './recruitment.service';
import { InterviewService } from './interview.service';
import { HRAnalyticsService } from './hr-analytics.service';
import { EmployeePortalService } from './employee-portal.service';
import { AnnouncementService } from './announcement.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('Enterprise HRM Platform Unit Tests (Book 6)', () => {
  let employeeService: EmployeeService;
  let attendanceService: AttendanceService;
  let shiftService: ShiftService;
  let leaveService: LeaveService;
  let payrollService: PayrollService;
  let performanceService: PerformanceService;
  let recruitmentService: RecruitmentService;
  let interviewService: InterviewService;
  let analyticsService: HRAnalyticsService;
  let portalService: EmployeePortalService;
  let announcementService: AnnouncementService;

  const mockPrismaService = {
    department: {
      upsert: jest
        .fn()
        .mockResolvedValue({ id: 'dept-1', name: 'Engineering', code: 'ENG' }),
      count: jest.fn().mockResolvedValue(3),
    },
    designation: {
      upsert: jest.fn().mockResolvedValue({
        id: 'desig-1',
        title: 'Senior Master Technician',
        code: 'SR_TECH',
      }),
    },
    employeeProfile: {
      upsert: jest.fn().mockResolvedValue({
        id: 'prof-1',
        userId: 'user-1',
        department: 'Engineering',
        designation: 'Senior Tech',
      }),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(10),
      findUnique: jest.fn().mockResolvedValue({
        id: 'prof-1',
        userId: 'user-1',
        department: 'Engineering',
        designation: 'Senior Tech',
        user: { firstName: 'Alice', lastName: 'Smith' },
      }),
    },
    employmentHistory: {
      create: jest
        .fn()
        .mockResolvedValue({ id: 'hist-1', changeType: 'PROMOTION' }),
    },
    attendance: {
      findUnique: jest.fn().mockResolvedValue(null),
      upsert: jest.fn().mockResolvedValue({
        id: 'att-1',
        userId: 'user-1',
        status: 'present',
        lateArrival: false,
      }),
      update: jest
        .fn()
        .mockResolvedValue({ id: 'att-1', checkOut: new Date() }),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(8),
    },
    attendanceCorrection: {
      create: jest.fn().mockResolvedValue({ id: 'corr-1', status: 'PENDING' }),
    },
    shift: {
      create: jest.fn().mockResolvedValue({
        id: 'shift-1',
        name: 'Morning Shift',
        startTime: '09:00',
        endTime: '17:00',
      }),
      findUnique: jest
        .fn()
        .mockResolvedValue({ id: 'shift-1', name: 'Morning Shift' }),
    },
    shiftAssignment: {
      create: jest.fn().mockResolvedValue({ id: 'sa-1', shiftId: 'shift-1' }),
    },
    leaveBalance: {
      upsert: jest
        .fn()
        .mockResolvedValue({ id: 'lb-1', yearlyEntitlement: 14, used: 0 }),
      findUnique: jest
        .fn()
        .mockResolvedValue({ id: 'lb-1', yearlyEntitlement: 14, used: 2 }),
      findMany: jest.fn().mockResolvedValue([]),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    leaveRequest: {
      create: jest.fn().mockResolvedValue({
        id: 'lr-1',
        status: 'pending',
        leaveType: 'ANNUAL',
        startDate: new Date(),
        endDate: new Date(),
      }),
      findUnique: jest.fn().mockResolvedValue({
        id: 'lr-1',
        userId: 'user-1',
        leaveType: 'ANNUAL',
        startDate: new Date(),
        endDate: new Date(),
      }),
      update: jest.fn().mockResolvedValue({ id: 'lr-1', status: 'approved' }),
    },
    salaryStructure: {
      upsert: jest.fn().mockResolvedValue({ id: 'ss-1', basicSalary: 3000 }),
      findMany: jest.fn().mockResolvedValue([
        {
          userId: 'user-1',
          basicSalary: 3000,
          housingAllowance: 500,
          transportAllowance: 200,
          otherAllowances: 0,
          taxPercentage: 10,
        },
      ]),
    },
    payroll: {
      create: jest.fn().mockResolvedValue({
        id: 'pay-1',
        month: '2026-07',
        status: 'PROCESSING',
      }),
      update: jest
        .fn()
        .mockResolvedValue({ id: 'pay-1', totalNet: 3330, status: 'APPROVED' }),
      findFirst: jest
        .fn()
        .mockResolvedValue({ id: 'pay-1', month: '2026-07', totalNet: 3330 }),
    },
    payrollItem: {
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
      findFirst: jest.fn().mockResolvedValue({ id: 'pi-1', netPay: 3330 }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    employeeGoal: {
      create: jest.fn().mockResolvedValue({
        id: 'goal-1',
        title: 'Complete Repair Certifications',
        progress: 0,
      }),
      update: jest.fn().mockResolvedValue({
        id: 'goal-1',
        progress: 100,
        status: 'COMPLETED',
      }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    performanceReview: {
      create: jest.fn().mockResolvedValue({ id: 'rev-1', rating: 4.8 }),
    },
    reward: {
      create: jest.fn().mockResolvedValue({
        id: 'rew-1',
        title: 'Employee of the Month',
        cashValue: 250,
      }),
    },
    recruitmentJob: {
      create: jest.fn().mockResolvedValue({
        id: 'job-1',
        title: 'Mobile Repair Lead',
        department: 'Engineering',
      }),
      findUnique: jest
        .fn()
        .mockResolvedValue({ id: 'job-1', title: 'Mobile Repair Lead' }),
      count: jest.fn().mockResolvedValue(2),
    },
    applicant: {
      create: jest.fn().mockResolvedValue({
        id: 'app-1',
        fullName: 'Bob Green',
        stage: 'APPLIED',
      }),
      findUnique: jest
        .fn()
        .mockResolvedValue({ id: 'app-1', fullName: 'Bob Green' }),
      update: jest.fn().mockResolvedValue({ id: 'app-1', stage: 'INTERVIEW' }),
      count: jest.fn().mockResolvedValue(5),
    },
    interview: {
      create: jest.fn().mockResolvedValue({
        id: 'int-1',
        interviewerName: 'HR Manager',
        status: 'SCHEDULED',
      }),
      update: jest.fn().mockResolvedValue({ id: 'int-1', status: 'COMPLETED' }),
    },
    interviewFeedback: {
      create: jest
        .fn()
        .mockResolvedValue({ id: 'fb-1', rating: 5, decision: 'HIRE' }),
    },
    hRAnnouncement: {
      create: jest
        .fn()
        .mockResolvedValue({ id: 'ann-1', title: 'Annual Team Outing' }),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        AttendanceService,
        ShiftService,
        LeaveService,
        PayrollService,
        PerformanceService,
        RecruitmentService,
        InterviewService,
        HRAnalyticsService,
        EmployeePortalService,
        AnnouncementService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    employeeService = module.get<EmployeeService>(EmployeeService);
    attendanceService = module.get<AttendanceService>(AttendanceService);
    shiftService = module.get<ShiftService>(ShiftService);
    leaveService = module.get<LeaveService>(LeaveService);
    payrollService = module.get<PayrollService>(PayrollService);
    performanceService = module.get<PerformanceService>(PerformanceService);
    recruitmentService = module.get<RecruitmentService>(RecruitmentService);
    interviewService = module.get<InterviewService>(InterviewService);
    analyticsService = module.get<HRAnalyticsService>(HRAnalyticsService);
    portalService = module.get<EmployeePortalService>(EmployeePortalService);
    announcementService = module.get<AnnouncementService>(AnnouncementService);
  });

  describe('Employee & Attendance Services', () => {
    it('should upsert employee profile and department', async () => {
      const dept = await employeeService.upsertDepartment('Engineering', 'ENG');
      const prof = await employeeService.upsertEmployeeProfile('user-1', {
        department: 'Engineering',
        designation: 'Senior Tech',
      });
      expect(dept.code).toBe('ENG');
      expect(prof.department).toBe('Engineering');
    });

    it('should record check-in with GPS verification', async () => {
      const att = await attendanceService.checkIn(
        'user-1',
        23.8103,
        90.4125,
        true,
      );
      expect(att.status).toBe('present');
    });
  });

  describe('Leave & Payroll Services', () => {
    it('should process leave approval and deduct balance', async () => {
      const res = await leaveService.processLeaveRequest(
        'lr-1',
        'approved',
        'approver-1',
      );
      expect(res.status).toBe('approved');
    });

    it('should calculate monthly net pay and process payroll batch', async () => {
      const res = await payrollService.processMonthlyPayroll('2026-07');
      expect(res.payroll.status).toBe('APPROVED');
    });
  });

  describe('Performance, Recruitment & Self-Service Portal', () => {
    it('should schedule interview and submit scorecard feedback', async () => {
      const int = await interviewService.scheduleInterview(
        'app-1',
        new Date(),
        'HR Lead',
      );
      const fb = await interviewService.submitFeedback(
        int.id,
        5,
        'Exceptional candidate',
        'HIRE',
      );
      expect(fb.decision).toBe('HIRE');
    });

    it('should fetch employee self-service portal overview', async () => {
      const data = await portalService.getMyPortalData('user-1');
      expect(data.userId).toBe('user-1');
      expect(data.employeeName).toBe('Alice Smith');
    });

    it('should return executive HR analytics dashboard', async () => {
      const dash = await analyticsService.getExecutiveDashboard();
      expect(dash.overview.totalEmployees).toBe(10);
      expect(dash.turnoverRate).toBeDefined();
    });
  });
});
