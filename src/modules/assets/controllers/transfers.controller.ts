import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { TransferService } from '../services/transfer.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('assets/transfers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TransfersController {
  constructor(private readonly transferService: TransferService) {}

  @Post()
  @Permissions('assets:write')
  @HttpCode(HttpStatus.CREATED)
  async requestTransfer(
    @Body()
    body: {
      assetId: string;
      toLocation: string;
      fromLocation?: string;
      notes?: string;
    },
    @Request() req: any,
  ) {
    return this.transferService.requestTransfer(
      body.assetId,
      body.toLocation,
      body.fromLocation,
      req.user?.id,
      body.notes,
    );
  }

  @Post(':id/approve')
  @Permissions('assets:write')
  @HttpCode(HttpStatus.OK)
  async approveTransfer(@Param('id') id: string) {
    return this.transferService.approveTransfer(id);
  }
}
