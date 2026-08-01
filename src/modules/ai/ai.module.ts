import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PredictionService } from './services/prediction.service';
import { RecommendationService } from './services/recommendation.service';
import { MaintenancePredictionService } from './services/maintenance-prediction.service';
import { TechnicianRecommendationService } from './services/technician-recommendation.service';
import { InventoryIntelligenceService } from './services/inventory-intelligence.service';
import { ProcurementIntelligenceService } from './services/procurement-intelligence.service';
import { CustomerInsightService } from './services/customer-insight.service';
import { KnowledgeEngineService } from './services/knowledge-engine.service';
import { AutomationEngineService } from './services/automation-engine.service';

import { PredictionsController } from './controllers/predictions.controller';
import { RecommendationsController } from './controllers/recommendations.controller';
import { KnowledgeController } from './controllers/knowledge.controller';
import { AIAutomationController } from './controllers/ai-automation.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    PredictionsController,
    RecommendationsController,
    KnowledgeController,
    AIAutomationController,
  ],
  providers: [
    PredictionService,
    RecommendationService,
    MaintenancePredictionService,
    TechnicianRecommendationService,
    InventoryIntelligenceService,
    ProcurementIntelligenceService,
    CustomerInsightService,
    KnowledgeEngineService,
    AutomationEngineService,
  ],
  exports: [
    PredictionService,
    RecommendationService,
    MaintenancePredictionService,
    TechnicianRecommendationService,
    InventoryIntelligenceService,
    ProcurementIntelligenceService,
    CustomerInsightService,
    KnowledgeEngineService,
    AutomationEngineService,
  ],
})
export class AIModule {}
