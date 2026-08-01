import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

// Existing Book 1-10 components
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';

// Phase 11 Book 5 Services
import { LeadManagementService } from './services/lead-management.service';
import { OpportunityService } from './services/opportunity.service';
import { PipelineService } from './services/pipeline.service';
import { SalesAutomationService } from './services/sales-automation.service';
import { CampaignService } from './services/campaign.service';
import { CustomerJourneyService } from './services/customer-journey.service';
import { SegmentationService } from './services/segmentation.service';
import { CommunicationService } from './services/communication.service';
import { ReminderService } from './services/reminder.service';
import { CRMAnalyticsService } from './services/crm-analytics.service';

// Phase 11 Book 5 Controllers
import { LeadsController } from './controllers/leads.controller';
import { OpportunitiesController } from './controllers/opportunities.controller';
import { PipelineController } from './controllers/pipeline.controller';
import { CampaignsController } from './controllers/campaigns.controller';
import { JourneyController } from './controllers/journey.controller';
import { CommunicationsController } from './controllers/communications.controller';
import { CrmAnalyticsController } from './controllers/crm-analytics.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    CrmController,
    LeadsController,
    OpportunitiesController,
    PipelineController,
    CampaignsController,
    JourneyController,
    CommunicationsController,
    CrmAnalyticsController,
  ],
  providers: [
    CrmService,
    LeadManagementService,
    OpportunityService,
    PipelineService,
    SalesAutomationService,
    CampaignService,
    CustomerJourneyService,
    SegmentationService,
    CommunicationService,
    ReminderService,
    CRMAnalyticsService,
  ],
  exports: [
    CrmService,
    LeadManagementService,
    OpportunityService,
    PipelineService,
    SalesAutomationService,
    CampaignService,
    CustomerJourneyService,
    SegmentationService,
    CommunicationService,
    ReminderService,
    CRMAnalyticsService,
  ],
})
export class CrmModule {}
