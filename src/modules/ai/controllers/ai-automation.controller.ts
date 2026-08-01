import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { AutomationEngineService } from '../services/automation-engine.service';

@Controller('automation/eval')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AIAutomationController {
  constructor(private readonly automationService: AutomationEngineService) {}

  @Post('trigger')
  @Permissions('write:automation')
  @HttpCode(HttpStatus.OK)
  async triggerEvaluation(
    @Body('event') event: string,
    @Body('payload') payload: any,
  ) {
    return {
      success: true,
      data: await this.automationService.triggerRuleEvaluation(event, payload),
    };
  }
}
