import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AssignmentService } from '../services/assignment.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('assets/assignments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AssignmentsController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Post()
  @Permissions('assets:write')
  @HttpCode(HttpStatus.CREATED)
  async assignAsset(
    @Body()
    body: {
      assetId: string;
      userId?: string;
      department?: string;
      notes?: string;
    },
  ) {
    return this.assignmentService.assignAsset(
      body.assetId,
      body.userId,
      body.department,
      body.notes,
    );
  }

  @Post(':id/return')
  @Permissions('assets:write')
  @HttpCode(HttpStatus.OK)
  async returnAsset(@Param('id') id: string, @Body('notes') notes?: string) {
    return this.assignmentService.returnAsset(id, notes);
  }
}
