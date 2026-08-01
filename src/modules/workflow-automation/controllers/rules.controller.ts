import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RuleEngineService } from '../services/rule-engine.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('rules')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RulesController {
  constructor(private readonly ruleEngineService: RuleEngineService) {}

  @Post()
  @Permissions('rules:write')
  @HttpCode(HttpStatus.CREATED)
  async createRule(
    @Body()
    body: {
      name: string;
      triggerEvent: string;
      conditionGroup: any;
      actions: any[];
      priority?: number;
      description?: string;
    },
  ) {
    return this.ruleEngineService.createRule(
      body.name,
      body.triggerEvent,
      body.conditionGroup,
      body.actions,
      body.priority || 10,
      body.description,
    );
  }

  @Post('eval')
  @Permissions('rules:read')
  @HttpCode(HttpStatus.OK)
  async evaluateEventRules(
    @Body() body: { triggerEvent: string; payload: Record<string, any> },
  ) {
    return this.ruleEngineService.evaluateEventRules(
      body.triggerEvent,
      body.payload || {},
    );
  }
}
