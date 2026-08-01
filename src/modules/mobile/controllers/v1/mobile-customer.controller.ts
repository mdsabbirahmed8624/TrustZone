import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CustomersService } from '../../../customers/customers.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { MobileResponseInterceptor } from '../../interceptors/mobile-response.interceptor';
import { MobileExceptionFilter } from '../../filters/mobile-exception.filter';

@ApiTags('Mobile API')
@ApiBearerAuth()
@Controller('mobile/customer')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@UseInterceptors(MobileResponseInterceptor)
@UseFilters(MobileExceptionFilter)
export class MobileCustomerController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @Permissions('read:customers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List customer profiles with search and filter parameters',
  })
  @ApiResponse({
    status: 200,
    description: 'List of customers retrieved successfully',
  })
  async findAll(
    @Query('search') search?: string,
    @Query('tag') tag?: string,
    @Query('branchId') branchId?: string,
  ) {
    const data = await this.customersService.findAll({ search, tag, branchId });
    return {
      message: 'Customers retrieved successfully.',
      data,
    };
  }

  @Get(':id')
  @Permissions('read:customers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieve full detailed customer profile and CRM timeline',
  })
  @ApiResponse({ status: 200, description: 'Customer profile details' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findOne(@Param('id') id: string) {
    const data = await this.customersService.findOne(id);
    return {
      message: 'Customer details retrieved successfully.',
      data,
    };
  }
}
