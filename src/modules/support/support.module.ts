import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

// Services
import { TicketService } from './services/ticket.service';
import { WarrantyService } from './services/warranty.service';
import { SLAService } from './services/sla.service';
import { EscalationService } from './services/escalation.service';
import { KnowledgeBaseService } from './services/knowledge-base.service';
import { ComplaintService } from './services/complaint.service';
import { FeedbackService } from './services/feedback.service';
import { SurveyService } from './services/survey.service';
import { SupportAnalyticsService } from './services/support-analytics.service';
import { HelpDeskService } from './services/help-desk.service';

// Controllers
import { TicketsController } from './controllers/tickets.controller';
import { SupportWarrantyController } from './controllers/warranty.controller';
import { SLAController } from './controllers/sla.controller';
import { EscalationsController } from './controllers/escalations.controller';
import { KnowledgeController } from './controllers/knowledge.controller';
import { ComplaintsController } from './controllers/complaints.controller';
import { FeedbackController } from './controllers/feedback.controller';
import { SupportAnalyticsController } from './controllers/support-analytics.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    TicketsController,
    SupportWarrantyController,
    SLAController,
    EscalationsController,
    KnowledgeController,
    ComplaintsController,
    FeedbackController,
    SupportAnalyticsController,
  ],
  providers: [
    TicketService,
    WarrantyService,
    SLAService,
    EscalationService,
    KnowledgeBaseService,
    ComplaintService,
    FeedbackService,
    SurveyService,
    SupportAnalyticsService,
    HelpDeskService,
  ],
  exports: [
    TicketService,
    WarrantyService,
    SLAService,
    EscalationService,
    KnowledgeBaseService,
    ComplaintService,
    FeedbackService,
    SurveyService,
    SupportAnalyticsService,
    HelpDeskService,
  ],
})
export class SupportModule {}
