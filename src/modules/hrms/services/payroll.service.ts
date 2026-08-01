import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PayrollService {
  private readonly logger = new Logger(PayrollService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Sets up or updates salary structure for an employee
   */
  async upsertSalaryStructure(
    userId: string,
    data: {
      basicSalary: number;
      housingAllowance?: number;
      transportAllowance?: number;
      otherAllowances?: number;
      taxPercentage?: number;
    },
  ) {
    const structure = await this.prisma.salaryStructure.upsert({
      where: { userId },
      update: {
        basicSalary: data.basicSalary,
        housingAllowance: data.housingAllowance || 0,
        transportAllowance: data.transportAllowance || 0,
        otherAllowances: data.otherAllowances || 0,
        taxPercentage: data.taxPercentage || 0,
      },
      create: {
        userId,
        basicSalary: data.basicSalary,
        housingAllowance: data.housingAllowance || 0,
        transportAllowance: data.transportAllowance || 0,
        otherAllowances: data.otherAllowances || 0,
        taxPercentage: data.taxPercentage || 0,
      },
    });

    this.logger.log(
      `Upserted SalaryStructure for User '${userId}' [Basic: $${data.basicSalary}]`,
    );
    return structure;
  }

  /**
   * Processes monthly payroll batch and generates itemized payslips
   */
  async processMonthlyPayroll(month: string, approverId?: string) {
    const structures = await this.prisma.salaryStructure.findMany({
      include: { user: true },
    });

    if (structures.length === 0) {
      throw new NotFoundException(
        'No active salary structures configured for payroll processing.',
      );
    }

    let totalBasic = 0;
    let totalGross = 0;
    let totalNet = 0;

    const payroll = await this.prisma.payroll.create({
      data: {
        month,
        totalEmployees: structures.length,
        status: 'PROCESSING',
        approvedById: approverId || null,
      },
    });

    const itemsData = structures.map((st) => {
      const basic = Number(st.basicSalary);
      const allowances =
        Number(st.housingAllowance) +
        Number(st.transportAllowance) +
        Number(st.otherAllowances);
      const gross = basic + allowances;
      const tax = gross * (Number(st.taxPercentage) / 100);
      const netPay = gross - tax;

      totalBasic += basic;
      totalGross += gross;
      totalNet += netPay;

      return {
        payrollId: payroll.id,
        userId: st.userId,
        basicSalary: basic,
        allowances,
        deductions: tax,
        bonuses: 0,
        taxDeducted: tax,
        netPay,
        status: 'GENERATED',
      };
    });

    await this.prisma.payrollItem.createMany({ data: itemsData });

    const updatedPayroll = await this.prisma.payroll.update({
      where: { id: payroll.id },
      data: {
        totalBasic,
        totalGross,
        totalNet,
        status: 'APPROVED',
      },
    });

    this.logger.log(
      `Processed Monthly Payroll for '${month}' (${structures.length} employees) - Total Net: $${totalNet.toFixed(2)}`,
    );
    return {
      payroll: updatedPayroll,
      itemCount: itemsData.length,
    };
  }

  /**
   * Retrieves payslip for an employee for a month
   */
  async getEmployeePayslip(userId: string, month: string) {
    return this.prisma.payrollItem.findFirst({
      where: { userId, payroll: { month } },
      include: { user: true, payroll: true },
    });
  }
}
