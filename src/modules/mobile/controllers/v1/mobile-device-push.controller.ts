import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Param,
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
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { PrismaService } from '../../../prisma/prisma.service';
import { MobileResponseInterceptor } from '../../interceptors/mobile-response.interceptor';
import { MobileExceptionFilter } from '../../filters/mobile-exception.filter';
import { IsString, IsEnum } from 'class-validator';
import { PushProviderType } from '@prisma/client';

export class RegisterPushDeviceDto {
  @IsString()
  deviceUUID: string;

  @IsString()
  deviceFingerprint: string;

  @IsEnum(PushProviderType)
  provider: PushProviderType;

  @IsString()
  pushToken: string;
}

@ApiTags('Mobile Push Token Management')
@ApiBearerAuth()
@Controller('mobile/push-devices')
@UseGuards(JwtAuthGuard)
@UseInterceptors(MobileResponseInterceptor)
@UseFilters(MobileExceptionFilter)
export class MobileDevicePushController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a device push token' })
  @ApiResponse({
    status: 201,
    description: 'Push token registered successfully',
  })
  async register(
    @CurrentUser('id') userId: string,
    @Body() dto: RegisterPushDeviceDto,
  ) {
    const device = await this.prisma.pushDevice.upsert({
      where: { pushToken: dto.pushToken },
      update: {
        userId,
        deviceUUID: dto.deviceUUID,
        deviceFingerprint: dto.deviceFingerprint,
        provider: dto.provider,
        isActive: true,
      },
      create: {
        userId,
        deviceUUID: dto.deviceUUID,
        deviceFingerprint: dto.deviceFingerprint,
        provider: dto.provider,
        pushToken: dto.pushToken,
        isActive: true,
      },
    });

    return {
      message: 'Push device registered successfully.',
      data: device,
    };
  }

  @Delete(':token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deregister/deactivate a push token' })
  async deregister(
    @Param('token') token: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.prisma.pushDevice.updateMany({
      where: { pushToken: token, userId },
      data: { isActive: false },
    });

    return {
      message: 'Push device token deactivated successfully.',
    };
  }
}
