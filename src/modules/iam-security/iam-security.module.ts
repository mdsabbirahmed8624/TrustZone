import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

// Services
import { IdentityService } from './services/identity.service';
import { AuthenticationService } from './services/authentication.service';
import { MFAService } from './services/mfa.service';
import { SSOService } from './services/sso.service';
import { SessionService } from './services/session.service';
import { PermissionService } from './services/permission.service';
import { DeviceTrustService } from './services/device-trust.service';
import { RiskEngineService } from './services/risk-engine.service';
import { SecurityMonitoringService } from './services/security-monitoring.service';
import { MicroSegmentationBook3Service } from './services/micro-segmentation-book3.service';
import { QuantumIdentityMeshBook4Service } from './services/quantum-identity-mesh-book4.service';
import { CrossCloudTelemetryBook5Service } from './services/cross-cloud-telemetry-book5.service';

// Controllers
import { IamAuthController } from './controllers/auth.controller';
import { IdentityController } from './controllers/identity.controller';
import { SessionsController } from './controllers/sessions.controller';
import { MfaController } from './controllers/mfa.controller';
import { SsoController } from './controllers/sso.controller';
import { SecurityController } from './controllers/security.controller';
import { IamPermissionsController } from './controllers/permissions.controller';
import { MicroSegmentationBook3Controller } from './controllers/micro-segmentation-book3.controller';
import { QuantumIdentityMeshBook4Controller } from './controllers/quantum-identity-mesh-book4.controller';
import { CrossCloudTelemetryBook5Controller } from './controllers/cross-cloud-telemetry-book5.controller';

@Module({
  imports: [PrismaModule],
  providers: [
    IdentityService,
    AuthenticationService,
    MFAService,
    SSOService,
    SessionService,
    PermissionService,
    DeviceTrustService,
    RiskEngineService,
    SecurityMonitoringService,
    MicroSegmentationBook3Service,
    QuantumIdentityMeshBook4Service,
    CrossCloudTelemetryBook5Service,
  ],
  controllers: [
    CrossCloudTelemetryBook5Controller,
    QuantumIdentityMeshBook4Controller,
    MicroSegmentationBook3Controller,
    IamAuthController,
    IdentityController,
    SessionsController,
    MfaController,
    SsoController,
    SecurityController,
    IamPermissionsController,
  ],
  exports: [
    IdentityService,
    AuthenticationService,
    MFAService,
    SSOService,
    SessionService,
    PermissionService,
    DeviceTrustService,
    RiskEngineService,
    SecurityMonitoringService,
    MicroSegmentationBook3Service,
    QuantumIdentityMeshBook4Service,
    CrossCloudTelemetryBook5Service,
  ],
})
export class IamSecurityModule {}
