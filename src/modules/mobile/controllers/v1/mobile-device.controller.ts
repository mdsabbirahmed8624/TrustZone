import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
  UseFilters,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { PrismaService } from '../../../prisma/prisma.service';
import { MobileResponseInterceptor } from '../../interceptors/mobile-response.interceptor';
import { MobileExceptionFilter } from '../../filters/mobile-exception.filter';
import { IsString, IsOptional } from 'class-validator';

export class RegisterDeviceDto {
  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsString()
  @IsOptional()
  serialNumber?: string;

  @IsString()
  @IsOptional()
  imei?: string;
}

@ApiTags('Mobile API')
@ApiBearerAuth()
@Controller('mobile/device')
@UseGuards(JwtAuthGuard)
@UseInterceptors(MobileResponseInterceptor)
@UseFilters(MobileExceptionFilter)
export class MobileDeviceController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "List currently logged-in user's registered devices",
  })
  @ApiResponse({ status: 200, description: "Customer's devices list" })
  async list(@CurrentUser('email') email: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { email },
      include: { devices: true },
    });

    if (!customer) {
      throw new NotFoundException(
        'Customer profile not found for active user session.',
      );
    }

    return {
      message: 'Registered devices retrieved successfully.',
      data: customer.devices,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new device to the user customer profile',
  })
  @ApiResponse({ status: 201, description: 'Device registered successfully' })
  async register(
    @CurrentUser('email') email: string,
    @Body() dto: RegisterDeviceDto,
  ) {
    const customer = await this.prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      throw new NotFoundException(
        'Customer profile not found for active user session.',
      );
    }

    const data = await this.prisma.device.create({
      data: {
        customerId: customer.id,
        brand: dto.brand,
        model: dto.model,
        serialNumber: dto.serialNumber || null,
        imei: dto.imei || null,
      },
    });

    return {
      message: 'Device registered successfully.',
      data,
    };
  }
}
