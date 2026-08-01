import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FinancialStatementService } from '../services/financial-statement.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('finance/statements')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StatementsController {
  constructor(private readonly statementService: FinancialStatementService) {}

  @Post('generate')
  @Permissions('finance:read')
  @HttpCode(HttpStatus.OK)
  async generateStatement(
    @Body() body: { statementType: string; period?: string },
  ) {
    return this.statementService.generateStatement(
      body.statementType,
      body.period || '2026-07',
    );
  }
}
