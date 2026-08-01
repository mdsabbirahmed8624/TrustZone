import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

// Services
import { WorkflowEngineService } from './services/workflow-engine.service';
import { BackgroundJobService } from './services/background-job.service';
import { SchedulerEngineService } from './services/scheduler-engine.service';
import { EventAutomationService } from './services/event-automation.service';
import { RuleEngineService } from './services/rule-engine.service';
import { ApprovalService } from './services/approval.service';
import { ReminderService } from './services/reminder.service';
import { EscalationService } from './services/escalation.service';

// Controllers
import { WorkflowsController } from './controllers/workflows.controller';
import { JobsController } from './controllers/jobs.controller';
import { SchedulerController } from './controllers/scheduler.controller';
import { EventsController } from './controllers/events.controller';
import { RulesController } from './controllers/rules.controller';
import { ApprovalsController } from './controllers/approvals.controller';
import { RemindersController } from './controllers/reminders.controller';

@Module({
  imports: [PrismaModule],
  providers: [
    WorkflowEngineService,
    BackgroundJobService,
    SchedulerEngineService,
    EventAutomationService,
    RuleEngineService,
    ApprovalService,
    ReminderService,
    EscalationService,
  ],
  controllers: [
    WorkflowsController,
    JobsController,
    SchedulerController,
    EventsController,
    RulesController,
    ApprovalsController,
    RemindersController,
  ],
  exports: [
    WorkflowEngineService,
    BackgroundJobService,
    SchedulerEngineService,
    EventAutomationService,
    RuleEngineService,
    ApprovalService,
    ReminderService,
    EscalationService,
  ],
})
export class WorkflowAutomationModule {}
