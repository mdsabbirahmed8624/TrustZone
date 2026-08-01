import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LedgerService } from '../services/ledger.service';
import { CostCenterService } from '../services/cost-center.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('finance/accounts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AccountsController {
  constructor(
    private readonly ledgerService: LedgerService,
    private readonly costCenterService: CostCenterService,
  ) {}

  @Post()
  @Permissions('finance:write')
  @HttpCode(HttpStatus.CREATED)
  async upsertAccount(
    @Body()
    body: {
      code?: string;
      accountNumber?: string;
      name: string;
      accountType: string;
      accountClass?: string;
      normalBalance?: string;
      description?: string;
    },
  ) {
    const accCode = body.code || body.accountNumber || '1010';
    return this.ledgerService.upsertAccount(
      accCode,
      body.name,
      body.accountType,
      body.description,
      body.accountClass || 'ASSET',
      body.normalBalance || 'DEBIT',
    );
  }

  @Get()
  @Permissions('finance:read')
  async getAccounts() {
    return this.ledgerService.getAccounts();
  }

  @Post('cost-centers')
  @Permissions('finance:write')
  @HttpCode(HttpStatus.CREATED)
  async upsertCostCenter(
    @Body()
    body: {
      code: string;
      name: string;
      department?: string;
      managerName?: string;
    },
  ) {
    return this.costCenterService.upsertCostCenter(
      body.code,
      body.name,
      body.department,
      body.managerName,
    );
  }
}
