import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LoyaltyService } from '../services/loyalty.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('loyalty')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Post('points')
  @Permissions('pos:write')
  @HttpCode(HttpStatus.OK)
  async updateLoyaltyPoints(
    @Body() body: { customerName: string; pointsDelta: number },
  ) {
    return this.loyaltyService.updateLoyaltyPoints(
      body.customerName,
      body.pointsDelta,
    );
  }
}
