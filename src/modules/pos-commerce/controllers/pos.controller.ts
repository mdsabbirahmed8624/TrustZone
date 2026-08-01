import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { POSService } from '../services/pos.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('pos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PosController {
  constructor(private readonly posService: POSService) {}

  @Post('register')
  @Permissions('pos:write')
  @HttpCode(HttpStatus.CREATED)
  async registerCounter(
    @Body()
    body: {
      name: string;
      code: string;
      branchId?: string;
      terminalIp?: string;
    },
  ) {
    return this.posService.registerCounter(
      body.name,
      body.code,
      body.branchId,
      body.terminalIp,
    );
  }
}
