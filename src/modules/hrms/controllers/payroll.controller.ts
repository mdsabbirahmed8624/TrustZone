import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { PayrollService } from '../services/payroll.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('hr/payroll')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('structure')
  @Permissions('hr:write')
  @HttpCode(HttpStatus.OK)
  async upsertStructure(
    @Body()
    body: {
      userId?: string;
      basicSalary: number;
      housingAllowance?: number;
      transportAllowance?: number;
      otherAllowances?: number;
      taxPercentage?: number;
    },
    @Request() req: any,
  ) {
    return this.payrollService.upsertSalaryStructure(
      body.userId || req.user?.id,
      body,
    );
  }

  @Post('process')
  @Permissions('hr:write')
  @HttpCode(HttpStatus.OK)
  async processPayroll(@Body() body: { month: string }, @Request() req: any) {
    return this.payrollService.processMonthlyPayroll(body.month, req.user?.id);
  }

  @Get('payslip')
  @Permissions('hr:read')
  async getPayslip(@Query('month') month: string, @Request() req: any) {
    return this.payrollService.getEmployeePayslip(
      req.user?.id,
      month || '2026-07',
    );
  }
}
