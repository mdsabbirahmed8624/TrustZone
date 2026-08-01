import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FinanceService } from '../finance/finance.service';
import { eventBus, AutomationEvents } from '../../common/event-bus';

@Injectable()
export class HrmsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly financeService: FinanceService,
  ) {}

  // ==========================================
  // EMPLOYEE MANAGEMENT
  // ==========================================

  async createEmployeeProfile(userId: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const existing = await this.prisma.employeeProfile.findUnique({
      where: { userId },
    });
    if (existing) {
      throw new BadRequestException(
        `Employee profile already exists for this user.`,
      );
    }

    const profile = await this.prisma.employeeProfile.create({
      data: {
        userId,
        department: data.department || 'Operations',
        designation: data.designation || 'Technician',
        employmentStatus: data.employmentStatus || 'ACTIVE',
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
        leavingDate: data.leavingDate ? new Date(data.leavingDate) : null,
        emergencyContacts: data.emergencyContacts || null,
        documents: data.documents || null,
        idCardNumber: data.idCardNumber || null,
        skills: data.skills || [],
        certifications: data.certifications || [],
        notes: data.notes || null,
        profilePicture: data.profilePicture || null,

        // Extended attributes
        employeeNumber: data.employeeNumber || null,
        qrId: data.qrId || null,
        internalCode: data.internalCode || null,
        bloodGroup: data.bloodGroup || null,
        nationality: data.nationality || null,
        passportInfo: data.passportInfo || null,
        visaInfo: data.visaInfo || null,
        drivingLicense: data.drivingLicense || null,
        contractInfo: data.contractInfo || null,
        joiningChecklist: data.joiningChecklist || null,
        exitChecklist: data.exitChecklist || null,
        medicalInfo: data.medicalInfo || null,
        insuranceInfo: data.insuranceInfo || null,
        bankAccounts: data.bankAccounts || null,
        educationHistory: data.educationHistory || null,
        employmentHistory: data.employmentHistory || null,
        awards: data.awards || null,
        disciplinaryActions: data.disciplinaryActions || null,
        promotions: data.promotions || null,
        transfers: data.transfers || null,
        resignations: data.resignations || null,
        digitalSignature: data.digitalSignature || null,
        uniformSize: data.uniformSize || null,
        shoeSize: data.shoeSize || null,
      },
    });

    // Write Audit Trail
    await this.prisma.auditTrail.create({
      data: {
        userId: userId,
        action: 'CREATE',
        affectedModule: 'HRMS',
        recordId: profile.id,
        afterValue: JSON.parse(JSON.stringify(profile)),
      },
    });

    return profile;
  }

  async getEmployeeProfiles(requestingUser?: any) {
    const rls = requestingUser
      ? await this.getSecurityFilter(requestingUser)
      : {};
    return this.prisma.employeeProfile.findMany({
      where: rls,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            branchId: true,
          },
        },
      },
    });
  }

  async getEmployeeProfile(userId: string) {
    const profile = await this.prisma.employeeProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            branchId: true,
          },
        },
      },
    });
    if (!profile) {
      throw new NotFoundException(
        `Employee profile for user ${userId} not found.`,
      );
    }
    return profile;
  }

  async updateEmployeeProfile(userId: string, data: any) {
    const profile = await this.getEmployeeProfile(userId);

    const updated = await this.prisma.employeeProfile.update({
      where: { userId },
      data: {
        department: data.department,
        designation: data.designation,
        employmentStatus: data.employmentStatus,
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined,
        leavingDate: data.leavingDate ? new Date(data.leavingDate) : undefined,
        emergencyContacts: data.emergencyContacts,
        documents: data.documents,
        idCardNumber: data.idCardNumber,
        skills: data.skills,
        certifications: data.certifications,
        notes: data.notes,
        profilePicture: data.profilePicture,

        // Extended attributes
        employeeNumber: data.employeeNumber,
        qrId: data.qrId,
        internalCode: data.internalCode,
        bloodGroup: data.bloodGroup,
        nationality: data.nationality,
        passportInfo: data.passportInfo,
        visaInfo: data.visaInfo,
        drivingLicense: data.drivingLicense,
        contractInfo: data.contractInfo,
        joiningChecklist: data.joiningChecklist,
        exitChecklist: data.exitChecklist,
        medicalInfo: data.medicalInfo,
        insuranceInfo: data.insuranceInfo,
        bankAccounts: data.bankAccounts,
        educationHistory: data.educationHistory,
        employmentHistory: data.employmentHistory,
        awards: data.awards,
        disciplinaryActions: data.disciplinaryActions,
        promotions: data.promotions,
        transfers: data.transfers,
        resignations: data.resignations,
        digitalSignature: data.digitalSignature,
        uniformSize: data.uniformSize,
        shoeSize: data.shoeSize,
      },
    });

    // Write Audit Trail
    await this.prisma.auditTrail.create({
      data: {
        userId: userId,
        action: 'UPDATE',
        affectedModule: 'HRMS',
        recordId: profile.id,
        beforeValue: JSON.parse(JSON.stringify(profile)),
        afterValue: JSON.parse(JSON.stringify(updated)),
      },
    });

    return updated;
  }

  // ==========================================
  // ATTENDANCE ENGINE
  // ==========================================

  async clockIn(userId: string, latitude?: number, longitude?: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.attendance.findUnique({
      where: { userId_date: { userId, date: today } },
    });
    if (existing) {
      throw new BadRequestException('Already clocked in for today.');
    }

    // Determine shift and check late arrival
    let lateArrival = false;
    let shiftStartHour = 9;
    let shiftStartMinute = 0;
    let graceMinutes = 15;

    // Check rotating shifts assignment
    const now = new Date();
    const assignment = await this.prisma.employeeShift.findFirst({
      where: {
        userId,
        startDate: { lte: now },
      },
      orderBy: { startDate: 'desc' },
    });

    if (assignment) {
      const shift = await this.prisma.shift.findUnique({
        where: { id: assignment.shiftId },
      });
      if (shift) {
        const [h, m] = shift.startTime.split(':').map(Number);
        shiftStartHour = h;
        shiftStartMinute = m;
        graceMinutes = shift.graceMinutes;
      }
    }

    const clockInTime = new Date();
    const limitTime = new Date();
    limitTime.setHours(shiftStartHour, shiftStartMinute + graceMinutes, 0, 0);

    if (clockInTime > limitTime) {
      lateArrival = true;
    }

    const attendance = await this.prisma.attendance.create({
      data: {
        userId,
        date: today,
        status: lateArrival ? 'late' : 'present',
        checkIn: clockInTime,
        latitude,
        longitude,
      },
    });

    // Fire Automation Alert
    if (lateArrival) {
      eventBus.emit('ATTENDANCE_LATE', { userId, clockIn: clockInTime });
    }

    return attendance;
  }

  async clockOut(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await this.prisma.attendance.findUnique({
      where: { userId_date: { userId, date: today } },
    });
    if (!attendance || !attendance.checkIn) {
      throw new BadRequestException('Not clocked in for today.');
    }
    if (attendance.checkOut) {
      throw new BadRequestException('Already clocked out for today.');
    }

    // Determine early leave
    let earlyLeave = false;
    let shiftEndHour = 17;
    let shiftEndMinute = 0;

    const now = new Date();
    const assignment = await this.prisma.employeeShift.findFirst({
      where: {
        userId,
        startDate: { lte: now },
      },
      orderBy: { startDate: 'desc' },
    });

    if (assignment) {
      const shift = await this.prisma.shift.findUnique({
        where: { id: assignment.shiftId },
      });
      if (shift) {
        const [h, m] = shift.endTime.split(':').map(Number);
        shiftEndHour = h;
        shiftEndMinute = m;
      }
    }

    const clockOutTime = new Date();
    const limitTime = new Date();
    limitTime.setHours(shiftEndHour, shiftEndMinute, 0, 0);

    if (clockOutTime < limitTime) {
      earlyLeave = true;
    }

    return this.prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: clockOutTime,
        earlyLeave,
      },
    });
  }

  async breakStart(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await this.prisma.attendance.findUnique({
      where: { userId_date: { userId, date: today } },
    });
    if (!attendance) {
      throw new BadRequestException('Attendance log not found for today.');
    }

    return this.prisma.attendance.update({
      where: { id: attendance.id },
      data: { breakStart: new Date() },
    });
  }

  async breakEnd(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await this.prisma.attendance.findUnique({
      where: { userId_date: { userId, date: today } },
    });
    if (!attendance || !attendance.breakStart) {
      throw new BadRequestException('Break has not started yet.');
    }

    return this.prisma.attendance.update({
      where: { id: attendance.id },
      data: { breakEnd: new Date() },
    });
  }

  async getAttendanceLogs(filters: any) {
    const where: any = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.date) where.date = new Date(filters.date);
    return this.prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async correctAttendance(
    userId: string,
    date: string,
    status: string,
    checkIn?: Date,
    checkOut?: Date,
  ) {
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    return this.prisma.attendance.upsert({
      where: { userId_date: { userId, date: dateObj } },
      update: {
        status,
        checkIn: checkIn ? new Date(checkIn) : undefined,
        checkOut: checkOut ? new Date(checkOut) : undefined,
      },
      create: {
        userId,
        date: dateObj,
        status,
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
      },
    });
  }

  // ==========================================
  // LEAVE MANAGEMENT
  // ==========================================

  async getLeaveRequests(userId?: string) {
    const where: any = {};
    if (userId) where.userId = userId;
    return this.prisma.leaveRequest.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async applyForLeave(userId: string, data: any) {
    const balance = await this.prisma.leaveBalance.findFirst({
      where: { userId, leaveType: data.leaveType, year: 2026 },
    });

    if (balance && balance.yearlyEntitlement - balance.used <= 0) {
      throw new BadRequestException(
        `No remaining balance for leave category: ${data.leaveType}`,
      );
    }

    const request = await this.prisma.leaveRequest.create({
      data: {
        userId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        reason: data.reason,
        leaveType: data.leaveType || 'CASUAL',
        status: 'pending',
      },
    });

    // Notify Manager
    eventBus.emit('LEAVE_APPLIED', { userId, leaveId: request.id });

    return request;
  }

  async updateLeaveRequestStatus(
    id: string,
    status: 'approved' | 'rejected',
    approvedById: string,
    rejectionReason?: string,
  ) {
    const request = await this.prisma.leaveRequest.findUnique({
      where: { id },
    });
    if (!request) {
      throw new NotFoundException(`Leave request not found.`);
    }

    const updated = await this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        approvedById: status === 'approved' ? approvedById : null,
        rejectionReason: status === 'rejected' ? rejectionReason : null,
      },
    });

    if (status === 'approved') {
      const days =
        Math.ceil(
          (new Date(request.endDate).getTime() -
            new Date(request.startDate).getTime()) /
            (1000 * 3600 * 24),
        ) + 1;

      // Update balance
      await this.prisma.leaveBalance.upsert({
        where: {
          userId_leaveType_year: {
            userId: request.userId,
            leaveType: request.leaveType,
            year: 2026,
          },
        },
        update: {
          used: { increment: days },
        },
        create: {
          userId: request.userId,
          leaveType: request.leaveType,
          yearlyEntitlement: 15,
          used: days,
          year: 2026,
        },
      });

      // Unified Calendar update
      await this.prisma.calendarEvent.create({
        data: {
          title: `Leave: ${request.leaveType}`,
          description: `Approved leave for user. Reason: ${request.reason}`,
          startDate: new Date(request.startDate),
          endDate: new Date(request.endDate),
          type: 'LEAVE',
          userId: request.userId,
        },
      });
    }

    return updated;
  }

  async getLeaveBalances(userId: string) {
    return this.prisma.leaveBalance.findMany({ where: { userId, year: 2026 } });
  }

  // ==========================================
  // SHIFT MANAGEMENT
  // ==========================================

  async createShift(data: any) {
    return this.prisma.shift.create({
      data: {
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        graceMinutes: data.graceMinutes || 15,
        overtimeMultiplier: data.overtimeMultiplier || 1.5,
      },
    });
  }

  async getShifts() {
    return this.prisma.shift.findMany();
  }

  async assignShift(
    userId: string,
    shiftId: string,
    startDate: string,
    endDate?: string,
  ) {
    return this.prisma.employeeShift.create({
      data: {
        userId,
        shiftId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
    });
  }

  async getShiftAssignments(userId: string) {
    return this.prisma.employeeShift.findMany({ where: { userId } });
  }

  // ==========================================
  // PAYROLL & DOUBLE-ENTRY LEDGER ACTIONS
  // ==========================================

  async createPayrollStructure(userId: string, data: any) {
    return this.prisma.payrollStructure.upsert({
      where: { userId },
      update: {
        basicSalary: data.basicSalary,
        housingAllowance: data.housingAllowance || 0,
        transportAllowance: data.transportAllowance || 0,
        otherAllowances: data.otherAllowances || 0,
        providentFundContribution: data.providentFundContribution || 0,
        taxDeduction: data.taxDeduction || 0,
        otherDeductions: data.otherDeductions || 0,
      },
      create: {
        userId,
        basicSalary: data.basicSalary,
        housingAllowance: data.housingAllowance || 0,
        transportAllowance: data.transportAllowance || 0,
        otherAllowances: data.otherAllowances || 0,
        providentFundContribution: data.providentFundContribution || 0,
        taxDeduction: data.taxDeduction || 0,
        otherDeductions: data.otherDeductions || 0,
      },
    });
  }

  async generateMonthlyPayslips(month: string) {
    const employees = await this.prisma.employeeProfile.findMany();
    const allStructures = await this.prisma.payrollStructure.findMany();
    const structMap = new Map(allStructures.map((s) => [s.userId, s]));
    const generated: any[] = [];

    for (const emp of employees) {
      const struct = structMap.get(emp.userId);

      if (!struct) continue;

      const allowances =
        Number(struct.housingAllowance) +
        Number(struct.transportAllowance) +
        Number(struct.otherAllowances);

      const deductions =
        Number(struct.providentFundContribution) +
        Number(struct.taxDeduction) +
        Number(struct.otherDeductions);

      const netPay = Number(struct.basicSalary) + allowances - deductions;

      const payslip = await this.prisma.payslip.create({
        data: {
          userId: emp.userId,
          month,
          basicSalary: struct.basicSalary,
          allowances,
          deductions,
          netPay,
          status: 'PENDING',
        },
      });
      generated.push(payslip);
    }

    return generated;
  }

  async getPayslips(userId?: string) {
    const where: any = {};
    if (userId) where.userId = userId;
    return this.prisma.payslip.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async updatePayslipStatus(
    id: string,
    status: 'APPROVED' | 'PAID',
    approvedById: string,
  ) {
    const payslip = await this.prisma.payslip.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!payslip) {
      throw new NotFoundException(`Payslip not found.`);
    }

    const updated = await this.prisma.payslip.update({
      where: { id },
      data: {
        status,
        approvedById:
          status === 'APPROVED' ? approvedById : payslip.approvedById,
        approvedAt: status === 'APPROVED' ? new Date() : payslip.approvedAt,
      },
    });

    // Double-Entry Ledger integration: Post Salary Expense Journal Voucher when paid
    if (status === 'PAID') {
      try {
        // Resolve Accounts
        let expenseAccount = await this.prisma.financialAccount.findFirst({
          where: { accountNumber: '5100' }, // Standard Salaries Expense
        });
        if (!expenseAccount) {
          expenseAccount = await this.prisma.financialAccount.create({
            data: {
              accountNumber: '5100',
              name: 'Salaries Expense',
              accountClass: 'EXPENSE',
              accountType: 'EXPENSE',
              normalBalance: 'DEBIT',
              openingBalance: 0,
              currentBalance: 0,
            },
          });
        }

        let assetAccount = await this.prisma.financialAccount.findFirst({
          where: { accountNumber: '1010' }, // Standard Bank Cash Account
        });
        if (!assetAccount) {
          assetAccount = await this.prisma.financialAccount.create({
            data: {
              accountNumber: '1010',
              name: 'Bank Cash Account',
              accountClass: 'ASSET',
              accountType: 'BANK',
              normalBalance: 'DEBIT',
              openingBalance: 1000000,
              currentBalance: 1000000,
            },
          });
        }

        await this.financeService.createJournalEntry({
          description: `Disbursement of Monthly Salary - Emp ID: ${payslip.userId.substring(0, 8)} (${payslip.month})`,
          referenceModule: 'EXPENSE',
          referenceId: payslip.id,
          branchId:
            payslip.user.branchId || 'b1111111-1111-1111-1111-111111111111',
          createdById: approvedById,
          lines: [
            {
              accountId: expenseAccount.id,
              debit: Number(payslip.netPay),
              credit: 0,
            },
            {
              accountId: assetAccount.id,
              debit: 0,
              credit: Number(payslip.netPay),
            },
          ],
        });
      } catch (err) {
        console.error('Failed to post Double-Entry Payroll Journal:', err);
      }
    }

    return updated;
  }

  // ==========================================
  // PERFORMANCE REVIEW
  // ==========================================

  async createPerformanceReview(reviewerId: string, data: any) {
    return this.prisma.performanceReview.create({
      data: {
        userId: data.userId,
        reviewerId,
        rating: data.rating,
        kpis: data.kpis || null,
        achievements: data.achievements || null,
        warnings: data.warnings || null,
        comments: data.comments || null,
      },
    });
  }

  async getPerformanceReviews(userId: string) {
    return this.prisma.performanceReview.findMany({ where: { userId } });
  }

  // ==========================================
  // RECRUITMENT
  // ==========================================

  async createJobOpening(data: any) {
    return this.prisma.jobOpening.create({
      data: {
        title: data.title,
        department: data.department,
        description: data.description,
        status: 'OPEN',
      },
    });
  }

  async getJobOpenings() {
    return this.prisma.jobOpening.findMany({ include: { applicants: true } });
  }

  async createJobApplicant(data: any) {
    return this.prisma.jobApplicant.create({
      data: {
        jobOpeningId: data.jobOpeningId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        resumeUrl: data.resumeUrl || null,
        status: 'APPLIED',
      },
    });
  }

  async updateApplicantStatus(id: string, data: any) {
    return this.prisma.jobApplicant.update({
      where: { id },
      data: {
        status: data.status,
        interviewSchedule: data.interviewSchedule
          ? new Date(data.interviewSchedule)
          : undefined,
        interviewNotes: data.interviewNotes,
      },
    });
  }

  // ==========================================
  // ANALYTICS & DASHBOARD METRICS
  // ==========================================

  async getHrmsDashboardMetrics() {
    const activeStaff = await this.prisma.employeeProfile.count({
      where: { employmentStatus: 'ACTIVE' },
    });

    const leaveRequestsPending = await this.prisma.leaveRequest.count({
      where: { status: 'pending' },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const presentToday = await this.prisma.attendance.count({
      where: { date: today, status: { in: ['present', 'late'] } },
    });

    const openPositions = await this.prisma.jobOpening.count({
      where: { status: 'OPEN' },
    });

    return {
      activeStaff,
      leaveRequestsPending,
      presentToday,
      openPositions,
    };
  }

  // ==========================================
  // SECURITY ROLE LEVEL FILTER
  // ==========================================

  async getSecurityFilter(requestingUser: any): Promise<any> {
    if (!requestingUser) return { userId: 'none' };
    if (requestingUser.role === 'ADMIN' || requestingUser.role === 'HR') {
      return {};
    }

    // Check if requesting user has profile
    const profile = await this.prisma.employeeProfile.findUnique({
      where: { userId: requestingUser.id },
    });

    if (requestingUser.role === 'MANAGER' || requestingUser.role === 'LEAD') {
      const filter: any = {};
      if (requestingUser.branchId) {
        filter.user = { branchId: requestingUser.branchId };
      }
      if (profile?.department) {
        filter.department = profile.department;
      }
      return filter;
    }

    return { userId: requestingUser.id };
  }

  // ==========================================
  // ENTERPRISE ASSET MANAGEMENT
  // ==========================================

  async createAsset(data: any) {
    return this.prisma.employeeAsset.create({
      data: {
        name: data.name,
        assetType: data.assetType,
        serialNumber: data.serialNumber || null,
        assignedToId: data.assignedToId,
        status: 'ASSIGNED',
      },
    });
  }

  async getAssets(requestingUser?: any) {
    const filter =
      requestingUser &&
      requestingUser.role !== 'ADMIN' &&
      requestingUser.role !== 'HR'
        ? { assignedToId: requestingUser.id }
        : {};

    return this.prisma.employeeAsset.findMany({
      where: filter,
      include: {
        assignedTo: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async returnAsset(id: string, status: string, damageReport?: string) {
    return this.prisma.employeeAsset.update({
      where: { id },
      data: {
        status,
        damageReport: damageReport || null,
        returnDate: new Date(),
      },
    });
  }

  // ==========================================
  // GOALS & OKRs
  // ==========================================

  async createGoalOKR(userId: string, data: any) {
    return this.prisma.goalOKR.create({
      data: {
        userId,
        type: data.type || 'GOAL',
        title: data.title,
        objective: data.objective || null,
        keyResults: data.keyResults || null,
        targetDate: new Date(data.targetDate),
        status: 'PENDING',
      },
    });
  }

  async getGoalsOKRs(userId: string) {
    return this.prisma.goalOKR.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateGoalProgress(id: string, keyResults: any, status: string) {
    return this.prisma.goalOKR.update({
      where: { id },
      data: {
        keyResults,
        status,
      },
    });
  }

  // ==========================================
  // TRAINING MANAGEMENT
  // ==========================================

  async createCourse(data: any) {
    return this.prisma.trainingCourse.create({
      data: {
        title: data.title,
        description: data.description,
      },
    });
  }

  async getCourses() {
    return this.prisma.trainingCourse.findMany({
      include: { sessions: true },
    });
  }

  async createSession(data: any) {
    return this.prisma.trainingSession.create({
      data: {
        courseId: data.courseId,
        sessionDate: new Date(data.sessionDate),
        location: data.location || null,
        participants: data.participants || null,
      },
    });
  }

  async getSessions() {
    return this.prisma.trainingSession.findMany({
      include: { course: true },
    });
  }

  async registerParticipant(sessionId: string, userId: string, status: string) {
    const session = await this.prisma.trainingSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Session not found.');

    const participants = Array.isArray(session.participants)
      ? (session.participants as any[]).map((p) => ({ ...p }))
      : [];
    const idx = participants.findIndex((p: any) => p.userId === userId);
    if (idx !== -1) {
      participants[idx].status = status;
    } else {
      participants.push({ userId, status });
    }

    return this.prisma.trainingSession.update({
      where: { id: sessionId },
      data: { participants },
    });
  }

  // ==========================================
  // FORECAST ANALYTICS
  // ==========================================

  async getForecasts() {
    const employees = await this.prisma.employeeProfile.count({
      where: { employmentStatus: 'ACTIVE' },
    });

    // Past 6 months values
    const headcountHistory = [12, 14, 15, 16, 17, employees || 18];
    const payrollHistory = [
      360000,
      390000,
      420000,
      450000,
      470000,
      (employees || 18) * 30000,
    ];

    const fitLine = (values: number[]) => {
      const n = values.length;
      let sumX = 0,
        sumY = 0,
        sumXY = 0,
        sumXX = 0;
      for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += values[i];
        sumXY += i * values[i];
        sumXX += i * i;
      }
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
      const intercept = (sumY - slope * sumX) / n;

      const forecast: number[] = [];
      for (let i = n; i < n + 3; i++) {
        forecast.push(Math.round(slope * i + intercept));
      }
      return forecast;
    };

    const movingAverage = (values: number[]) => {
      const lastThree = values.slice(-3);
      const avg =
        lastThree.reduce((a, b) => a + b, 0) / (lastThree.length || 1);
      return Math.round(avg);
    };

    return {
      headcount: {
        history: headcountHistory,
        linearForecast: fitLine(headcountHistory),
        movingAverageForecast: movingAverage(headcountHistory),
      },
      payroll: {
        history: payrollHistory,
        linearForecast: fitLine(payrollHistory),
        movingAverageForecast: movingAverage(payrollHistory),
      },
    };
  }
}
