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

@Controller('pos/shifts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ShiftsController {
  constructor(private readonly posService: POSService) {}

  @Post('open')
  @Permissions('pos:write')
  @HttpCode(HttpStatus.CREATED)
  async openShift(
    @Body()
    body: {
      counterId: string;
      cashierName: string;
      startingCash: number;
    },
  ) {
    return this.posService.openShift(
      body.counterId,
      body.cashierName,
      body.startingCash,
    );
  }

  @Post('close')
  @Permissions('pos:write')
  @HttpCode(HttpStatus.OK)
  async closeShift(
    @Body()
    body: {
      shiftId: string;
      closingCashCount: number;
    },
  ) {
    return this.posService.closeShift(body.shiftId, body.closingCashCount);
  }
}
