import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FinanceModule } from '../finance/finance.module';

// Existing Book 1-10 components
import { HrmsService } from './hrms.service';
import { HrmsController } from './hrms.controller';

// Phase 11 Book 6 Services
import { EmployeeService } from './services/employee.service';
import { AttendanceService } from './services/attendance.service';
import { ShiftService } from './services/shift.service';
import { LeaveService } from './services/leave.service';
import { PayrollService } from './services/payroll.service';
import { PerformanceService } from './services/performance.service';
import { RecruitmentService } from './services/recruitment.service';
import { InterviewService } from './services/interview.service';
import { HRAnalyticsService } from './services/hr-analytics.service';
import { EmployeePortalService } from './services/employee-portal.service';
import { AnnouncementService } from './services/announcement.service';

// Phase 11 Book 6 Controllers
import { EmployeesController } from './controllers/employees.controller';
import { AttendanceController } from './controllers/attendance.controller';
import { LeavesController } from './controllers/leaves.controller';
import { PayrollController } from './controllers/payroll.controller';
import { RecruitmentController } from './controllers/recruitment.controller';
import { PerformanceController } from './controllers/performance.controller';
import { AnnouncementsController } from './controllers/announcements.controller';
import { HrAnalyticsController } from './controllers/hr-analytics.controller';

@Module({
  imports: [PrismaModule, FinanceModule],
  controllers: [
    HrmsController,
    EmployeesController,
    AttendanceController,
    LeavesController,
    PayrollController,
    RecruitmentController,
    PerformanceController,
    AnnouncementsController,
    HrAnalyticsController,
  ],
  providers: [
    HrmsService,
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
  ],
  exports: [
    HrmsService,
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
  ],
})
export class HrmsModule {}
