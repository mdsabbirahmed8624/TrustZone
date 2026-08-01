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
import { EmployeeService } from '../services/employee.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('hr/employees')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EmployeesController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post('profile')
  @Permissions('hr:write')
  @HttpCode(HttpStatus.OK)
  async upsertProfile(
    @Body()
    body: {
      userId?: string;
      department: string;
      designation: string;
      employmentStatus?: string;
      employeeNumber?: string;
      emergencyContacts?: any;
      skills?: string[];
    },
    @Request() req: any,
  ) {
    const targetUserId = body.userId || req.user?.id;
    return this.employeeService.upsertEmployeeProfile(targetUserId, body);
  }

  @Get()
  @Permissions('hr:read')
  async getEmployees(
    @Query('department') department?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.employeeService.getEmployees({
      department,
      search,
      page,
      limit,
    });
  }

  @Post('departments')
  @Permissions('hr:write')
  @HttpCode(HttpStatus.CREATED)
  async upsertDepartment(
    @Body()
    body: {
      name: string;
      code: string;
      description?: string;
      managerId?: string;
    },
  ) {
    return this.employeeService.upsertDepartment(
      body.name,
      body.code,
      body.description,
      body.managerId,
    );
  }

  @Post('designations')
  @Permissions('hr:write')
  @HttpCode(HttpStatus.CREATED)
  async upsertDesignation(
    @Body()
    body: {
      departmentId: string;
      title: string;
      code: string;
      level?: number;
    },
  ) {
    return this.employeeService.upsertDesignation(
      body.departmentId,
      body.title,
      body.code,
      body.level,
    );
  }
}
