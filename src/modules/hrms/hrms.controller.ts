import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { HrmsService } from './hrms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('hrms')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class HrmsController {
  constructor(private readonly hrmsService: HrmsService) {}

  // ==========================================
  // EMPLOYEE MANAGEMENT
  // ==========================================

  @Post('employees')
  @Permissions('write:support')
  async createProfile(@Body('userId') userId: string, @Body() data: any) {
    const profile = await this.hrmsService.createEmployeeProfile(userId, data);
    return { success: true, data: profile };
  }

  @Get('employees')
  @Permissions('read:support')
  async getProfiles(@CurrentUser() user: any) {
    const data = await this.hrmsService.getEmployeeProfiles(user);
    return { success: true, data };
  }

  @Get('employees/:userId')
  @Permissions('read:support')
  async getProfile(@Param('userId') userId: string) {
    const data = await this.hrmsService.getEmployeeProfile(userId);
    return { success: true, data };
  }

  @Put('employees/:userId')
  @Permissions('write:support')
  async updateProfile(@Param('userId') userId: string, @Body() data: any) {
    const profile = await this.hrmsService.updateEmployeeProfile(userId, data);
    return { success: true, data: profile };
  }

  // ==========================================
  // ATTENDANCE
  // ==========================================

  @Post('attendance/clock-in')
  async clockIn(
    @CurrentUser() user: any,
    @Body('latitude') lat?: number,
    @Body('longitude') lng?: number,
  ) {
    const data = await this.hrmsService.clockIn(user.id, lat, lng);
    return { success: true, data, message: 'Clocked in successfully.' };
  }

  @Post('attendance/clock-out')
  async clockOut(@CurrentUser() user: any) {
    const data = await this.hrmsService.clockOut(user.id);
    return { success: true, data, message: 'Clocked out successfully.' };
  }

  @Post('attendance/break-start')
  async breakStart(@CurrentUser() user: any) {
    const data = await this.hrmsService.breakStart(user.id);
    return { success: true, data };
  }

  @Post('attendance/break-end')
  async breakEnd(@CurrentUser() user: any) {
    const data = await this.hrmsService.breakEnd(user.id);
    return { success: true, data };
  }

  @Get('attendance/logs')
  @Permissions('read:support')
  async getAttendanceLogs(
    @Query('userId') userId?: string,
    @Query('date') date?: string,
  ) {
    const data = await this.hrmsService.getAttendanceLogs({ userId, date });
    return { success: true, data };
  }

  @Post('attendance/correct')
  @Permissions('write:support')
  async correctAttendance(
    @Body('userId') userId: string,
    @Body('date') date: string,
    @Body('status') status: string,
    @Body('checkIn') checkIn?: Date,
    @Body('checkOut') checkOut?: Date,
  ) {
    const data = await this.hrmsService.correctAttendance(
      userId,
      date,
      status,
      checkIn,
      checkOut,
    );
    return { success: true, data };
  }

  // ==========================================
  // LEAVE
  // ==========================================

  @Get('leave/requests')
  @Permissions('read:support')
  async getLeaveRequests(@Query('userId') userId?: string) {
    const data = await this.hrmsService.getLeaveRequests(userId);
    return { success: true, data };
  }

  @Post('leave/requests')
  async applyForLeave(@CurrentUser() user: any, @Body() body: any) {
    const data = await this.hrmsService.applyForLeave(user.id, body);
    return {
      success: true,
      data,
      message: 'Leave request applied successfully.',
    };
  }

  @Patch('leave/requests/:id/status')
  @Permissions('write:support')
  async approveLeave(
    @Param('id') id: string,
    @Body('status') status: 'approved' | 'rejected',
    @Body('rejectionReason') reason: string,
    @CurrentUser() user: any,
  ) {
    const data = await this.hrmsService.updateLeaveRequestStatus(
      id,
      status,
      user.id,
      reason,
    );
    return { success: true, data };
  }

  @Get('leave/balances/:userId')
  async getLeaveBalances(@Param('userId') userId: string) {
    const data = await this.hrmsService.getLeaveBalances(userId);
    return { success: true, data };
  }

  // ==========================================
  // SHIFTS
  // ==========================================

  @Post('shifts')
  @Permissions('write:support')
  async createShift(@Body() body: any) {
    const data = await this.hrmsService.createShift(body);
    return { success: true, data };
  }

  @Get('shifts')
  @Permissions('read:support')
  async getShifts() {
    const data = await this.hrmsService.getShifts();
    return { success: true, data };
  }

  @Post('shifts/assign')
  @Permissions('write:support')
  async assignShift(
    @Body('userId') userId: string,
    @Body('shiftId') shiftId: string,
    @Body('startDate') start: string,
    @Body('endDate') end?: string,
  ) {
    const data = await this.hrmsService.assignShift(
      userId,
      shiftId,
      start,
      end,
    );
    return { success: true, data };
  }

  // ==========================================
  // PAYROLL
  // ==========================================

  @Post('payroll/structures')
  @Permissions('write:support')
  async savePayrollStructure(
    @Body('userId') userId: string,
    @Body() body: any,
  ) {
    const data = await this.hrmsService.createPayrollStructure(userId, body);
    return { success: true, data };
  }

  @Post('payroll/payslips/generate')
  @Permissions('write:support')
  async generatePayslips(@Body('month') month: string) {
    const data = await this.hrmsService.generateMonthlyPayslips(month);
    return { success: true, data, message: `Generated payslips for ${month}.` };
  }

  @Get('payroll/payslips')
  async getPayslips(@Query('userId') userId?: string) {
    const data = await this.hrmsService.getPayslips(userId);
    return { success: true, data };
  }

  @Patch('payroll/payslips/:id/status')
  @Permissions('write:support')
  async payPayslip(
    @Param('id') id: string,
    @Body('status') status: 'APPROVED' | 'PAID',
    @CurrentUser() user: any,
  ) {
    const data = await this.hrmsService.updatePayslipStatus(
      id,
      status,
      user.id,
    );
    return { success: true, data };
  }

  // ==========================================
  // PERFORMANCE
  // ==========================================

  @Post('performance/reviews')
  @Permissions('write:support')
  async submitPerformanceReview(@CurrentUser() user: any, @Body() body: any) {
    const data = await this.hrmsService.createPerformanceReview(user.id, body);
    return { success: true, data };
  }

  @Get('performance/reviews/:userId')
  async getPerformanceReviews(@Param('userId') userId: string) {
    const data = await this.hrmsService.getPerformanceReviews(userId);
    return { success: true, data };
  }

  // ==========================================
  // RECRUITMENT
  // ==========================================

  @Post('recruitment/jobs')
  @Permissions('write:support')
  async createJobOpening(@Body() body: any) {
    const data = await this.hrmsService.createJobOpening(body);
    return { success: true, data };
  }

  @Get('recruitment/jobs')
  async getJobOpenings() {
    const data = await this.hrmsService.getJobOpenings();
    return { success: true, data };
  }

  @Post('recruitment/applicants')
  async createApplicant(@Body() body: any) {
    const data = await this.hrmsService.createJobApplicant(body);
    return { success: true, data };
  }

  @Patch('recruitment/applicants/:id/status')
  @Permissions('write:support')
  async updateApplicant(@Param('id') id: string, @Body() body: any) {
    const data = await this.hrmsService.updateApplicantStatus(id, body);
    return { success: true, data };
  }

  // ==========================================
  // ANALYTICS & DASHBOARD METRICS
  // ==========================================

  @Get('analytics/dashboard')
  @Permissions('read:support')
  async getMetrics() {
    const data = await this.hrmsService.getHrmsDashboardMetrics();
    return { success: true, data };
  }

  // ==========================================
  // ENTERPRISE EXTENSION ENDPOINTS
  // ==========================================

  @Get('forecasts')
  async getForecasts() {
    const data = await this.hrmsService.getForecasts();
    return { success: true, data };
  }

  @Get('assets')
  async getAssets(@CurrentUser() user: any) {
    const data = await this.hrmsService.getAssets(user);
    return { success: true, data };
  }

  @Post('assets')
  @Permissions('write:support')
  async createAsset(@Body() body: any) {
    const data = await this.hrmsService.createAsset(body);
    return { success: true, data };
  }

  @Patch('assets/:id/return')
  @Permissions('write:support')
  async returnAsset(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('damageReport') damageReport?: string,
  ) {
    const data = await this.hrmsService.returnAsset(id, status, damageReport);
    return { success: true, data };
  }

  @Get('goals/:userId')
  async getGoals(@Param('userId') userId: string) {
    const data = await this.hrmsService.getGoalsOKRs(userId);
    return { success: true, data };
  }

  @Post('goals/:userId')
  async createGoal(@Param('userId') userId: string, @Body() body: any) {
    const data = await this.hrmsService.createGoalOKR(userId, body);
    return { success: true, data };
  }

  @Patch('goals/:id/progress')
  async updateGoal(
    @Param('id') id: string,
    @Body('keyResults') keyResults: any,
    @Body('status') status: string,
  ) {
    const data = await this.hrmsService.updateGoalProgress(
      id,
      keyResults,
      status,
    );
    return { success: true, data };
  }

  @Get('courses')
  async getCourses() {
    const data = await this.hrmsService.getCourses();
    return { success: true, data };
  }

  @Post('courses')
  @Permissions('write:support')
  async createCourse(@Body() body: any) {
    const data = await this.hrmsService.createCourse(body);
    return { success: true, data };
  }

  @Post('sessions')
  @Permissions('write:support')
  async createSession(@Body() body: any) {
    const data = await this.hrmsService.createSession(body);
    return { success: true, data };
  }

  @Get('sessions')
  async getSessions() {
    const data = await this.hrmsService.getSessions();
    return { success: true, data };
  }

  @Post('sessions/:id/register')
  async registerParticipant(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Body('status') status: string,
  ) {
    const data = await this.hrmsService.registerParticipant(id, userId, status);
    return { success: true, data };
  }
}
