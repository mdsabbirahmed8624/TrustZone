import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReconciliationService } from '../services/reconciliation.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('finance/reconciliation')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReconciliationController {
  constructor(private readonly reconciliationService: ReconciliationService) {}

  @Post()
  @Permissions('finance:write')
  @HttpCode(HttpStatus.OK)
  async reconcileStatement(
    @Body()
    body: {
      bankAccountId: string;
      statementBal: number;
      statementDate?: Date;
    },
  ) {
    return this.reconciliationService.reconcileStatement(
      body.bankAccountId,
      body.statementBal,
      body.statementDate,
    );
  }
}
