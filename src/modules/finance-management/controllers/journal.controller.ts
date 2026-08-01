import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JournalService } from '../services/journal.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('finance/journal')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post()
  @Permissions('finance:write')
  @HttpCode(HttpStatus.CREATED)
  async createJournalEntry(
    @Body()
    body: {
      description?: string;
      referenceModule?: string;
      lines: {
        accountCode: string;
        debit: number;
        credit: number;
        description?: string;
      }[];
    },
  ) {
    return this.journalService.createJournalEntry(body);
  }
}
