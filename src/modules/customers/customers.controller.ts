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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('customers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @Permissions('read:customers')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('search') search?: string,
    @Query('tag') tag?: string,
    @Query('branchId') branchId?: string,
  ) {
    return {
      success: true,
      data: await this.customersService.findAll({ search, tag, branchId }),
    };
  }

  @Get(':id')
  @Permissions('read:customers')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return {
      success: true,
      data: await this.customersService.findOne(id),
    };
  }

  @Post()
  @Permissions('write:customers')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    return {
      success: true,
      data: await this.customersService.create(createCustomerDto),
    };
  }

  @Patch(':id')
  @Permissions('write:customers')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return {
      success: true,
      data: await this.customersService.update(id, updateCustomerDto),
    };
  }

  @Post(':id/communications')
  @Permissions('write:customers')
  @HttpCode(HttpStatus.CREATED)
  async logComm(
    @Param('id') id: string,
    @Body('type') type: string,
    @Body('message') message: string,
  ) {
    return {
      success: true,
      data: await this.customersService.logCommunication(id, type, message),
    };
  }

  @Post(':id/documents')
  @Permissions('write:customers')
  @HttpCode(HttpStatus.CREATED)
  async uploadDoc(
    @Param('id') id: string,
    @Body('fileName') fileName: string,
    @Body('fileUrl') fileUrl: string,
    @Body('fileSize') fileSize: number,
  ) {
    return {
      success: true,
      data: await this.customersService.uploadDocument(
        id,
        fileName,
        fileUrl,
        fileSize,
      ),
    };
  }
}
