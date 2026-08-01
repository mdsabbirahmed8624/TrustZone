import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../../../auth/auth.service';
import { RegisterDto } from '../../../auth/dto/register.dto';
import { LoginDto } from '../../../auth/dto/login.dto';
import { VerifyEmailDto } from '../../../auth/dto/verify-email.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { MobileResponseInterceptor } from '../../interceptors/mobile-response.interceptor';
import { MobileExceptionFilter } from '../../filters/mobile-exception.filter';

@ApiTags('Mobile API')
@Controller('mobile/auth')
@UseInterceptors(MobileResponseInterceptor)
@UseFilters(MobileExceptionFilter)
export class MobileAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new customer account' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Invalid fields' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(@Body() dto: RegisterDto, @Ip() ip: string) {
    const data = await this.authService.register(dto, ip);
    return {
      message: 'Registration successful. Verification token generated.',
      data,
    };
  }

  private getDeviceOpts(req: any) {
    const deviceUUID = req.headers['x-device-uuid'];
    if (!deviceUUID) return undefined;

    return {
      deviceUUID,
      deviceType: req.headers['x-device-type'] || 'ANDROID',
      brand: req.headers['x-device-brand'],
      model: req.headers['x-device-model'],
      os: req.headers['x-device-os'],
      osVersion: req.headers['x-device-os-version'],
      country: req.headers['x-location-country'],
      city: req.headers['x-location-city'],
      timezone: req.headers['x-location-timezone'],
      userAgent: req.headers['user-agent'] || 'Mobile Client',
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user and return session tokens' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto, @Ip() ip: string, @Req() req: any) {
    const deviceFingerprint = req.headers['user-agent'] || 'Mobile Client';
    const deviceOpts = this.getDeviceOpts(req);
    const data = await this.authService.login(
      dto,
      ip,
      deviceFingerprint,
      deviceOpts,
    );
    return {
      message: 'Authentication successful.',
      data,
    };
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email registration token' })
  @ApiResponse({ status: 200, description: 'Email verified' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  async verifyEmail(@Body() dto: VerifyEmailDto, @Ip() ip: string) {
    await this.authService.verifyEmail(dto.token, ip);
    return {
      message: 'Email address verified successfully.',
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token' })
  @ApiResponse({ status: 200, description: 'Token refresh successful' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(
    @Body('refreshToken') refreshToken: string,
    @Ip() ip: string,
    @Req() req: any,
  ) {
    const deviceFingerprint = req.headers['user-agent'] || 'Mobile Client';
    const deviceOpts = this.getDeviceOpts(req);
    const data = await this.authService.refresh(
      refreshToken,
      ip,
      deviceFingerprint,
      deviceOpts,
    );
    return {
      message: 'Session tokens rotated successfully.',
      data,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke active authentication session' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @Body('refreshToken') refreshToken: string,
    @CurrentUser('id') userId: string,
    @Req() req: any,
    @Ip() ip: string,
  ) {
    const token = req.headers.authorization.split(' ')[1];
    await this.authService.logout(token, refreshToken, userId, ip);
    return {
      message: 'Session revoked successfully.',
    };
  }

  @Post('logout-current')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout current device and revoke session' })
  @ApiResponse({ status: 200, description: 'Current device logout successful' })
  async logoutCurrent(
    @Body('refreshToken') refreshToken: string,
    @CurrentUser('id') userId: string,
    @Req() req: any,
    @Ip() ip: string,
  ) {
    const token = req.headers.authorization.split(' ')[1];
    const deviceUUID = req.headers['x-device-uuid'];
    const userAgent = req.headers['user-agent'] || 'Mobile Client';
    await this.authService.logoutCurrentDevice(
      token,
      refreshToken,
      userId,
      ip,
      deviceUUID,
      userAgent,
    );
    return {
      message: 'Current device session revoked successfully.',
    };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout all devices and revoke all user sessions' })
  @ApiResponse({ status: 200, description: 'All devices logout successful' })
  async logoutAll(
    @CurrentUser('id') userId: string,
    @Req() req: any,
    @Ip() ip: string,
  ) {
    const userAgent = req.headers['user-agent'] || 'Mobile Client';
    await this.authService.logoutAllDevices(userId, ip, userAgent);
    return {
      message: 'All device sessions revoked successfully.',
    };
  }
}
