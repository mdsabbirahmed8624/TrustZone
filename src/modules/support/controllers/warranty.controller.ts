import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WarrantyService } from '../services/warranty.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('support/warranty')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SupportWarrantyController {
  constructor(private readonly warrantyService: WarrantyService) {}

  @Post('register')
  @Permissions('support:write')
  @HttpCode(HttpStatus.CREATED)
  async registerWarranty(
    @Body()
    body: {
      customerId?: string;
      warrantyCode: string;
      durationMonths: number;
      startDate?: Date;
      terms?: string;
    },
  ) {
    return this.warrantyService.registerWarranty(body);
  }

  @Post('claim')
  @Permissions('support:write')
  @HttpCode(HttpStatus.CREATED)
  async submitClaim(
    @Body()
    body: {
      warrantyId: string;
      claimReason: string;
      description?: string;
    },
  ) {
    return this.warrantyService.submitClaim(
      body.warrantyId,
      body.claimReason,
      body.description,
    );
  }

  @Post('claim/:id/process')
  @Permissions('support:write')
  @HttpCode(HttpStatus.OK)
  async processClaim(
    @Param('id') id: string,
    @Body() body: { status: 'APPROVED' | 'REJECTED'; resolutionNotes?: string },
  ) {
    return this.warrantyService.processClaim(
      id,
      body.status,
      body.resolutionNotes,
    );
  }
}
