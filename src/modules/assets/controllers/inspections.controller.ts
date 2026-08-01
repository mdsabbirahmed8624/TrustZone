import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InspectionService } from '../services/inspection.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('assets/inspections')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InspectionsController {
  constructor(private readonly inspectionService: InspectionService) {}

  @Post()
  @Permissions('assets:write')
  @HttpCode(HttpStatus.CREATED)
  async submitInspection(
    @Body()
    body: {
      assetId: string;
      inspectorName: string;
      condition?: string;
      score?: number;
      notes?: string;
      passed?: boolean;
    },
  ) {
    return this.inspectionService.submitInspection(body);
  }
}
