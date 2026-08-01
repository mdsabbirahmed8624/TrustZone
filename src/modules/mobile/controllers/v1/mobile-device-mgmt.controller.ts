import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UseFilters,
  Req,
  Ip,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { AuthService } from '../../../auth/auth.service';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { PrismaService } from '../../../prisma/prisma.service';
import { MobileResponseInterceptor } from '../../interceptors/mobile-response.interceptor';
import { MobileExceptionFilter } from '../../filters/mobile-exception.filter';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class RegisterDeviceMgmtDto {
  @IsString()
  deviceUUID: string;

  @IsString()
  deviceFingerprint: string;

  @IsString()
  @IsOptional()
  deviceType?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  os?: string;

  @IsString()
  @IsOptional()
  osVersion?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  timezone?: string;
}

export class PushTokenDto {
  @IsString()
  provider: string;

  @IsString()
  token: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

@ApiTags('Mobile Device Management')
@ApiBearerAuth()
@Controller('mobile/device-mgmt')
@UseGuards(JwtAuthGuard)
@UseInterceptors(MobileResponseInterceptor)
@UseFilters(MobileExceptionFilter)
export class MobileDeviceMgmtController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  @Get('sessions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve active devices and sessions' })
  @ApiResponse({ status: 200, description: 'Devices list retrieved' })
  async getSessions(@CurrentUser('id') userId: string) {
    const devices = await this.prisma.userDevice.findMany({
      where: { userId },
      include: {
        pushTokens: true,
        events: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const sessions = await this.prisma.session.findMany({
      where: { userId, isValid: true },
    });

    return {
      message: 'Active devices and sessions retrieved successfully.',
      data: {
        devices,
        sessions,
      },
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Explicitly register a device' })
  @ApiResponse({ status: 201, description: 'Device registered' })
  async register(
    @CurrentUser('id') userId: string,
    @Body() dto: RegisterDeviceMgmtDto,
    @Ip() ip: string,
    @Req() req: any,
  ) {
    const userAgent = req.headers['user-agent'] || 'Mobile Client';
    const device = await this.authService.registerOrUpdateDevice(userId, ip, {
      ...dto,
      userAgent,
    });
    return {
      message: 'Device registered successfully.',
      data: device,
    };
  }

  @Put(':id/trust')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trust/untrust a registered device' })
  @ApiResponse({ status: 200, description: 'Device trust updated' })
  async trustDevice(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('isTrusted') isTrusted: boolean,
    @Ip() ip: string,
    @Req() req: any,
  ) {
    const userAgent = req.headers['user-agent'] || 'Mobile Client';
    const device = await this.prisma.userDevice.findFirst({
      where: { id, userId },
    });

    if (!device) {
      throw new BadRequestException('Device not found.');
    }

    const updated = await this.prisma.userDevice.update({
      where: { id: device.id },
      data: { isTrusted },
    });

    const eventType = isTrusted ? 'TRUST' : 'UNTRUST';
    await this.authService.logDeviceEvent(
      device.id,
      eventType as any,
      ip,
      userAgent,
      `Device marked as ${isTrusted ? 'trusted' : 'untrusted'}.`,
    );

    return {
      message: `Device marked as ${isTrusted ? 'trusted' : 'untrusted'} successfully.`,
      data: updated,
    };
  }

  @Put(':id/remember')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle remember device status' })
  @ApiResponse({ status: 200, description: 'Device remember status updated' })
  async rememberDevice(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('rememberDevice') rememberDevice: boolean,
  ) {
    const device = await this.prisma.userDevice.findFirst({
      where: { id, userId },
    });

    if (!device) {
      throw new BadRequestException('Device not found.');
    }

    const updated = await this.prisma.userDevice.update({
      where: { id: device.id },
      data: { rememberDevice },
    });

    return {
      message: `Device remember status updated successfully.`,
      data: updated,
    };
  }

  @Put(':id/push-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update push notification token' })
  @ApiResponse({ status: 200, description: 'Push token updated successfully' })
  async updatePushToken(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: PushTokenDto,
    @Ip() ip: string,
    @Req() req: any,
  ) {
    const userAgent = req.headers['user-agent'] || 'Mobile Client';
    const token = await this.authService.updatePushToken(
      id,
      userId,
      dto,
      ip,
      userAgent,
    );
    return {
      message: 'Push token updated successfully.',
      data: token,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke and block a registered device' })
  @ApiResponse({ status: 200, description: 'Device revoked and blocked' })
  async revokeDevice(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Ip() ip: string,
    @Req() req: any,
  ) {
    const userAgent = req.headers['user-agent'] || 'Mobile Client';
    await this.authService.forceLogoutDevice(id, userId, ip, userAgent);
    return {
      message: 'Device session revoked and device blocked successfully.',
    };
  }
}
