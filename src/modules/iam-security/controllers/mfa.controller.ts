import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { MFAService } from '../services/mfa.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('mfa')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MfaController {
  constructor(private readonly mfaService: MFAService) {}

  @Post('setup')
  @Permissions('mfa:write')
  @HttpCode(HttpStatus.OK)
  async setupTotp(@Request() req: any) {
    return this.mfaService.setupTotp(req.user?.id);
  }

  @Post('verify')
  @Permissions('mfa:write')
  @HttpCode(HttpStatus.OK)
  async verifyTotp(@Body() body: { code: string }, @Request() req: any) {
    return this.mfaService.verifyAndEnableTotp(req.user?.id, body.code);
  }

  @Post('otp/send')
  @Permissions('mfa:write')
  @HttpCode(HttpStatus.OK)
  async sendOtp(
    @Body() body: { channel?: 'SMS' | 'EMAIL' },
    @Request() req: any,
  ) {
    return this.mfaService.sendOtp(req.user?.id, body.channel || 'EMAIL');
  }
}
