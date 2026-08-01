import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TechniciansService } from './technicians.service';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { LogAttendanceDto } from './dto/log-attendance.dto';
import { SubmitLeaveDto } from './dto/submit-leave.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('technicians')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Get()
  @Permissions('read:technicians')
  @HttpCode(HttpStatus.OK)
  async findAll(@Query('branchId') branchId?: string) {
    return {
      success: true,
      data: await this.techniciansService.findAll({ branchId }),
    };
  }

  @Get(':id')
  @Permissions('read:technicians')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return {
      success: true,
      data: await this.techniciansService.findOne(id),
    };
  }

  @Patch(':id')
  @Permissions('write:technicians')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateTechDto: UpdateTechnicianDto,
  ) {
    return {
      success: true,
      data: await this.techniciansService.update(id, updateTechDto),
    };
  }

  @Post(':id/attendance')
  @Permissions('write:technicians')
  @HttpCode(HttpStatus.OK)
  async logAttendance(
    @Param('id') id: string,
    @Body() logAttendanceDto: LogAttendanceDto,
  ) {
    return {
      success: true,
      data: await this.techniciansService.logAttendance(id, logAttendanceDto),
    };
  }

  @Post(':id/leaves')
  @Permissions('write:technicians')
  @HttpCode(HttpStatus.CREATED)
  async submitLeave(
    @Param('id') id: string,
    @Body() submitLeaveDto: SubmitLeaveDto,
  ) {
    return {
      success: true,
      data: await this.techniciansService.submitLeave(id, submitLeaveDto),
    };
  }

  // Admin approval of leaves
  @Patch('leaves/:leaveId')
  @Permissions('write:technicians')
  @HttpCode(HttpStatus.OK)
  async updateLeaveStatus(
    @Param('leaveId') leaveId: string,
    @Body('status') status: string, // approved or rejected
  ) {
    return {
      success: true,
      data: await this.techniciansService.updateLeaveStatus(leaveId, status),
    };
  }
}
