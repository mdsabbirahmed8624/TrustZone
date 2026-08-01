import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EnterpriseBIService } from './enterprise-bi.service';
import { EnterpriseBIController } from './enterprise-bi.controller';
import { EnterpriseBIBook2Service } from './services/enterprise-bi-book2.service';
import { EnterpriseBIBook2Controller } from './controllers/enterprise-bi-book2.controller';
import { GovernanceBook4Service } from './services/governance-book4.service';
import { GovernanceBook4Controller } from './controllers/governance-book4.controller';
import { SystemAuditBook5Service } from './services/system-audit-book5.service';
import { SystemAuditBook5Controller } from './controllers/system-audit-book5.controller';
import { CertificationBook6Service } from './services/certification-book6.service';
import { CertificationBook6Controller } from './controllers/certification-book6.controller';
import { SignoffBook8Service } from './services/signoff-book8.service';
import { SignoffBook8Controller } from './controllers/signoff-book8.controller';
import { MilestoneBook9Service } from './services/milestone-book9.service';
import { MilestoneBook9Controller } from './controllers/milestone-book9.controller';
import { MasterReleaseBook10Service } from './services/master-release-book10.service';
import { MasterReleaseBook10Controller } from './controllers/master-release-book10.controller';

import { MilestoneCertificationBook6Service } from '../system-audit/services/milestone-certification-book6.service';
import { MilestoneCertificationBook6Controller } from '../system-audit/controllers/milestone-certification-book6.controller';
import { LiveTelemetryStreamBook6Service } from '../system-audit/services/live-telemetry-stream-book6.service';
import { LiveTelemetryStreamBook6Controller } from '../system-audit/controllers/live-telemetry-stream-book6.controller';

import { ExecutiveSignoffBook8Service } from './services/executive-signoff-book8.service';
import { ExecutiveSignoffBook8Controller } from './controllers/executive-signoff-book8.controller';

import { MilestoneCompletionBook9Service } from './services/milestone-completion-book9.service';
import { MilestoneCompletionBook9Controller } from './controllers/milestone-completion-book9.controller';

import { MasterPlatformReleaseBook10Service } from './services/master-platform-release-book10.service';
import { MasterPlatformReleaseBook10Controller } from './controllers/master-platform-release-book10.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    MasterPlatformReleaseBook10Controller,
    MilestoneCompletionBook9Controller,
    ExecutiveSignoffBook8Controller,
    MilestoneCertificationBook6Controller,
    LiveTelemetryStreamBook6Controller,
    MasterReleaseBook10Controller,
    MilestoneBook9Controller,
    SignoffBook8Controller,
    CertificationBook6Controller,
    SystemAuditBook5Controller,
    GovernanceBook4Controller,
    EnterpriseBIBook2Controller,
    EnterpriseBIController,
  ],
  providers: [
    EnterpriseBIService,
    EnterpriseBIBook2Service,
    GovernanceBook4Service,
    SystemAuditBook5Service,
    CertificationBook6Service,
    SignoffBook8Service,
    MilestoneBook9Service,
    MasterReleaseBook10Service,
    MilestoneCertificationBook6Service,
    LiveTelemetryStreamBook6Service,
    ExecutiveSignoffBook8Service,
    MilestoneCompletionBook9Service,
    MasterPlatformReleaseBook10Service,
  ],
  exports: [
    EnterpriseBIService,
    EnterpriseBIBook2Service,
    GovernanceBook4Service,
    SystemAuditBook5Service,
    CertificationBook6Service,
    SignoffBook8Service,
    MilestoneBook9Service,
    MasterReleaseBook10Service,
    MilestoneCertificationBook6Service,
    LiveTelemetryStreamBook6Service,
    ExecutiveSignoffBook8Service,
    MilestoneCompletionBook9Service,
    MasterPlatformReleaseBook10Service,
  ],
})
export class EnterpriseBIModule {}
