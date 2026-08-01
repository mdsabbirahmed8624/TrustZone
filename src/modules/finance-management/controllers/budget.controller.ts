import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BudgetService } from '../services/budget.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('finance/budget')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  @Permissions('finance:write')
  @HttpCode(HttpStatus.CREATED)
  async createBudget(
    @Body()
    body: {
      title: string;
      fiscalYear?: string;
      department?: string;
      totalBudget: number;
      lines?: { category: string; allocated: number; costCenterId?: string }[];
    },
  ) {
    return this.budgetService.createBudget(body);
  }

  @Post(':id/approve')
  @Permissions('finance:write')
  @HttpCode(HttpStatus.OK)
  async approveBudget(@Param('id') id: string) {
    return this.budgetService.approveBudget(id);
  }
}
