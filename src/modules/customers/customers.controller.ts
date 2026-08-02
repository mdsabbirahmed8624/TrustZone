import {
  Body,
  Controller,
  Delete,
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
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('customers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('dashboard/stats')
  @Permissions('read:customers')
  @HttpCode(HttpStatus.OK)
  async getDashboardStats(@Query('branchId') branchId?: string) {
    return {
      success: true,
      data: await this.customersService.getDashboardStats(branchId),
    };
  }

  @Get()
  @Permissions('read:customers')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('search') search?: string,
    @Query('tag') tag?: string,
    @Query('branchId') branchId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return {
      success: true,
      data: await this.customersService.findAll({ search, tag, branchId, page, limit }),
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

  @Delete(':id')
  @Permissions('write:customers')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') deletedById?: string,
  ) {
    return await this.customersService.delete(id, deletedById);
  }

  @Post(':id/devices')
  @Permissions('write:customers')
  @HttpCode(HttpStatus.CREATED)
  async addDevice(
    @Param('id') id: string,
    @Body() dto: { brand: string; model: string; serialNumber?: string; imei?: string },
  ) {
    return {
      success: true,
      data: await this.customersService.addDevice(id, dto),
    };
  }

  @Delete(':id/devices/:deviceId')
  @Permissions('write:customers')
  @HttpCode(HttpStatus.OK)
  async deleteDevice(
    @Param('id') id: string,
    @Param('deviceId') deviceId: string,
  ) {
    return await this.customersService.deleteDevice(id, deviceId);
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

  @Post(':id/send-communication')
  @Permissions('write:customers')
  @HttpCode(HttpStatus.OK)
  async sendComm(
    @Param('id') id: string,
    @Body('type') type: string,
    @Body('channel') channel: string,
    @Body('message') message: string,
  ) {
    return {
      success: true,
      data: await this.customersService.sendCommunication(id, type, channel, message),
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

  @Delete(':id/documents/:docId')
  @Permissions('write:customers')
  @HttpCode(HttpStatus.OK)
  async deleteDoc(
    @Param('id') id: string,
    @Param('docId') docId: string,
  ) {
    return await this.customersService.deleteDocument(id, docId);
  }

  @Post('merge')
  @Permissions('write:customers')
  @HttpCode(HttpStatus.OK)
  async mergeDuplicates(
    @Body('primaryId') primaryId: string,
    @Body('duplicateIds') duplicateIds: string[],
  ) {
    return {
      success: true,
      data: await this.customersService.mergeDuplicates(primaryId, duplicateIds),
    };
  }
}
