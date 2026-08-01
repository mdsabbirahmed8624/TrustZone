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
import { AttendanceService } from '../services/attendance.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('hr/attendance')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  @Permissions('hr:write')
  @HttpCode(HttpStatus.OK)
  async checkIn(
    @Body()
    body: {
      latitude?: number;
      longitude?: number;
      biometricVerification?: boolean;
    },
    @Request() req: any,
  ) {
    return this.attendanceService.checkIn(
      req.user?.id,
      body.latitude,
      body.longitude,
      body.biometricVerification,
    );
  }

  @Post('check-out')
  @Permissions('hr:write')
  @HttpCode(HttpStatus.OK)
  async checkOut(@Request() req: any) {
    return this.attendanceService.checkOut(req.user?.id);
  }

  @Post('correction')
  @Permissions('hr:write')
  @HttpCode(HttpStatus.CREATED)
  async requestCorrection(
    @Body()
    body: {
      date: Date;
      requestedIn?: Date;
      requestedOut?: Date;
      reason?: string;
    },
    @Request() req: any,
  ) {
    return this.attendanceService.requestCorrection(
      req.user?.id,
      body.date,
      body.requestedIn,
      body.requestedOut,
      body.reason,
    );
  }

  @Get('monthly')
  @Permissions('hr:read')
  async getMonthlyReport(
    @Query('year') year: number,
    @Query('month') month: number,
    @Request() req: any,
  ) {
    return this.attendanceService.getMonthlyReport(
      req.user?.id,
      Number(year) || 2026,
      Number(month) || 7,
    );
  }
}
