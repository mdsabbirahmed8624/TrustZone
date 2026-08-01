import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DocumentRetentionService } from '../services/document-retention.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionsController {
  constructor(private readonly retentionService: DocumentRetentionService) {}

  @Post('documents/:id/hold')
  @Permissions('permissions:write')
  @HttpCode(HttpStatus.OK)
  async setLegalHold(
    @Param('id') id: string,
    @Body() body: { isLegalHold: boolean },
  ) {
    return this.retentionService.setLegalHold(id, body.isLegalHold);
  }

  @Post('documents/:id/retention')
  @Permissions('permissions:write')
  @HttpCode(HttpStatus.CREATED)
  async attachRetentionPolicy(
    @Param('id') id: string,
    @Body()
    body: {
      policyName: string;
      retentionDays?: number;
      autoAction?: 'ARCHIVE' | 'PERMANENT_DELETE';
    },
  ) {
    return this.retentionService.attachRetentionPolicy(
      id,
      body.policyName,
      body.retentionDays || 365,
      body.autoAction || 'ARCHIVE',
    );
  }
}
