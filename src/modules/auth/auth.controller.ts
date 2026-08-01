import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResetRequestDto } from './dto/reset-request.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto, @Ip() ip: string) {
    const data = await this.authService.register(dto, ip);
    return {
      success: true,
      message: 'Registration successful. Verification token generated.',
      data,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Ip() ip: string, @Req() req: any) {
    const fingerprint = req.headers['user-agent'] || 'unknown';
    const data = await this.authService.login(dto, ip, fingerprint);
    return {
      success: true,
      message: 'Login successful.',
      data,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body('refreshToken') refreshToken: string,
    @Ip() ip: string,
    @Req() req: any,
  ) {
    const fingerprint = req.headers['user-agent'] || 'unknown';
    const data = await this.authService.refresh(refreshToken, ip, fingerprint);
    return {
      success: true,
      message: 'Session token rotated successfully.',
      data,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body('refreshToken') refreshToken: string,
    @CurrentUser('id') userId: string,
    @Req() req: any,
    @Ip() ip: string,
  ) {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    await this.authService.logout(token, refreshToken, userId, ip);
    return {
      success: true,
      message: 'Logout successful.',
    };
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto, @Ip() ip: string) {
    await this.authService.verifyEmail(dto.token, ip);
    return {
      success: true,
      message: 'Email verified successfully.',
    };
  }

  @Post('reset-password-request')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() dto: ResetRequestDto, @Ip() ip: string) {
    const data = await this.authService.requestPasswordReset(dto.email, ip);
    return {
      success: true,
      message:
        'If the email exists, a password reset token has been generated.',
      data,
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto, @Ip() ip: string) {
    await this.authService.resetPassword(dto, ip);
    return {
      success: true,
      message: 'Password reset completed successfully.',
    };
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getSessions(@CurrentUser('id') userId: string) {
    const data = await this.authService.listSessions(userId);
    return {
      success: true,
      data,
    };
  }

  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async revokeSession(
    @Param('id') sessionId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.authService.revokeSession(sessionId, userId);
    return {
      success: true,
      message: 'Session revoked successfully.',
    };
  }

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(@Body() dto: LoginDto, @Ip() ip: string, @Req() req: any) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const data = await this.authService.adminLogin(dto, ip, userAgent);
    return {
      success: true,
      message: 'Admin login successful.',
      data,
    };
  }

  @Post('admin/logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAll(@CurrentUser('id') userId: string, @Ip() ip: string) {
    await this.authService.revokeAllSessions(userId, ip);
    return {
      success: true,
      message: 'Logged out from all devices.',
    };
  }

  @Get('admin/login-history')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getLoginHistory(@CurrentUser('id') userId: string) {
    const data = await this.authService.getLoginHistory(userId);
    return {
      success: true,
      data,
    };
  }
}
