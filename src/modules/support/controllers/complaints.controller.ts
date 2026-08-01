import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ComplaintService } from '../services/complaint.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('support/complaints')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ComplaintsController {
  constructor(private readonly complaintService: ComplaintService) {}

  @Post()
  @Permissions('support:write')
  @HttpCode(HttpStatus.CREATED)
  async submitComplaint(
    @Body()
    body: {
      customerId: string;
      subject: string;
      details: string;
      severity?: string;
    },
  ) {
    return this.complaintService.submitComplaint(
      body.customerId,
      body.subject,
      body.details,
      body.severity,
    );
  }

  @Post(':id/resolve')
  @Permissions('support:write')
  @HttpCode(HttpStatus.OK)
  async resolveComplaint(
    @Param('id') id: string,
    @Body('resolutionNotes') resolutionNotes: string,
  ) {
    return this.complaintService.resolveComplaint(id, resolutionNotes);
  }
}
