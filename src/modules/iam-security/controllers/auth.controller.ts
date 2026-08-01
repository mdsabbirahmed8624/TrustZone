import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { AuthenticationService } from '../services/authentication.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('auth')
export class IamAuthController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post('passwordless')
  @HttpCode(HttpStatus.OK)
  async generatePasswordlessToken(@Body() body: { email: string }) {
    return this.authService.generatePasswordlessToken(body.email);
  }

  @Post('password/change')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('auth:write')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Body() body: { newPasswordPlain: string },
    @Request() req: any,
  ) {
    return this.authService.updatePassword(req.user?.id, body.newPasswordPlain);
  }
}
