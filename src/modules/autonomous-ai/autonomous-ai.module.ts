import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { AutonomousAIService } from './autonomous-ai.service';
import { AutonomousAIController } from './autonomous-ai.controller';
import { AutonomousAIBook2Service } from './services/autonomous-ai-book2.service';
import { AutonomousAIBook2Controller } from './controllers/autonomous-ai-book2.controller';
import { AutonomousAIBook3Service } from './services/autonomous-ai-book3.service';
import { AutonomousAIBook3Controller } from './controllers/autonomous-ai-book3.controller';
import { AutonomousAIBook4Service } from './services/autonomous-ai-book4.service';
import { AutonomousAIBook4Controller } from './controllers/autonomous-ai-book4.controller';
import { AutonomousAIBook5Service } from './services/autonomous-ai-book5.service';
import { AutonomousAIBook5Controller } from './controllers/autonomous-ai-book5.controller';
import { AutonomousAIBook7Service } from './services/autonomous-ai-book7.service';
import { AutonomousAIBook7Controller } from './controllers/autonomous-ai-book7.controller';
import { AutonomousAIBook8Service } from './services/autonomous-ai-book8.service';
import { AutonomousAIBook8Controller } from './controllers/autonomous-ai-book8.controller';
import { AutonomousAIBook9Service } from './services/autonomous-ai-book9.service';
import { AutonomousAIBook9Controller } from './controllers/autonomous-ai-book9.controller';
import { AutonomousAIBook10Service } from './services/autonomous-ai-book10.service';
import { AutonomousAIBook10Controller } from './controllers/autonomous-ai-book10.controller';
import { FederatedLearningBook2Service } from './services/federated-learning-book2.service';
import { FederatedLearningBook2Controller } from './controllers/federated-learning-book2.controller';
import { SwarmSelfHealingBook3Service } from './services/swarm-self-healing-book3.service';
import { SwarmSelfHealingBook3Controller } from './controllers/swarm-self-healing-book3.controller';
import { GaPerformanceTuningBook5Service } from './services/ga-performance-tuning-book5.service';
import { GaPerformanceTuningBook5Controller } from './controllers/ga-performance-tuning-book5.controller';
import { SelfOptimizationBook7Service } from './services/self-optimization-book7.service';
import { SelfOptimizationBook7Controller } from './controllers/self-optimization-book7.controller';
import { AiSafetyBoundaryBook8Service } from './services/ai-safety-boundary-book8.service';
import { AiSafetyBoundaryBook8Controller } from './controllers/ai-safety-boundary-book8.controller';
import { AiModelDriftBook9Service } from './services/ai-model-drift-book9.service';
import { AiModelDriftBook9Controller } from './controllers/ai-model-drift-book9.controller';
import { AiGovernanceEthicsBook10Service } from './services/ai-governance-ethics-book10.service';
import { AiGovernanceEthicsBook10Controller } from './controllers/ai-governance-ethics-book10.controller';
import { SpatialTelemetryBook1Service } from './services/spatial-telemetry-book1.service';
import { SpatialTelemetryBook1Controller } from './controllers/spatial-telemetry-book1.controller';
import { EdgeMeshDispatchBook1Service } from './services/edge-mesh-dispatch-book1.service';
import { EdgeMeshDispatchBook1Controller } from './controllers/edge-mesh-dispatch-book1.controller';
import { ZeroKnowledgePrivacyBook2Service } from './services/zero-knowledge-privacy-book2.service';
import { ZeroKnowledgePrivacyBook2Controller } from './controllers/zero-knowledge-privacy-book2.controller';
import { NeuromorphicAiBook2Service } from './services/neuromorphic-ai-book2.service';
import { NeuromorphicAiBook2Controller } from './controllers/neuromorphic-ai-book2.controller';
import { HolographicDiagnosticsBook3Service } from './services/holographic-diagnostics-book3.service';
import { HolographicDiagnosticsBook3Controller } from './controllers/holographic-diagnostics-book3.controller';
import { QuantumEdgeSecurityBook3Service } from './services/quantum-edge-security-book3.service';
import { QuantumEdgeSecurityBook3Controller } from './controllers/quantum-edge-security-book3.controller';
import { SupplyChainPredictorBook4Service } from './services/supply-chain-predictor-book4.service';
import { SupplyChainPredictorBook4Controller } from './controllers/supply-chain-predictor-book4.controller';
import { QuantumIdentityMeshBook4Service } from './services/quantum-identity-mesh-book4.service';
import { QuantumIdentityMeshBook4Controller } from './controllers/quantum-identity-mesh-book4.controller';
import { SwarmRoboticsOrchestratorBook5Service } from './services/swarm-robotics-orchestrator-book5.service';
import { SwarmRoboticsOrchestratorBook5Controller } from './controllers/swarm-robotics-orchestrator-book5.controller';
import { GenerativeAiTuningEngineBook5Service } from './services/generative-ai-tuning-engine-book5.service';
import { GenerativeAiTuningEngineBook5Controller } from './controllers/generative-ai-tuning-engine-book5.controller';
import { DigitalTwinSimulationBook6Service } from './services/digital-twin-simulation-book6.service';
import { DigitalTwinSimulationBook6Controller } from './controllers/digital-twin-simulation-book6.controller';
import { PredictiveComplianceGovernanceBook6Service } from './services/predictive-compliance-governance-book6.service';
import { PredictiveComplianceGovernanceBook6Controller } from './controllers/predictive-compliance-governance-book6.controller';
import { SovereignMicrosegmentationBook7Service } from './services/sovereign-microsegmentation-book7.service';
import { SovereignMicrosegmentationBook7Controller } from './controllers/sovereign-microsegmentation-book7.controller';
import { ExecutiveSignoffBook8Service } from './services/executive-signoff-book8.service';
import { ExecutiveSignoffBook8Controller } from './controllers/executive-signoff-book8.controller';
import { MilestoneCompletionBook9Service } from './services/milestone-completion-book9.service';
import { MilestoneCompletionBook9Controller } from './controllers/milestone-completion-book9.controller';
import { MasterPlatformReleaseBook10Service } from './services/master-platform-release-book10.service';
import { MasterPlatformReleaseBook10Controller } from './controllers/master-platform-release-book10.controller';
import { GlobalMultiCloudSovereignMeshBook1Service } from './services/global-multicloud-mesh-book1.service';
import { GlobalMultiCloudSovereignMeshBook1Controller } from './controllers/global-multicloud-mesh-book1.controller';
import { AutonomousLoadBalancingGridBook1Service } from './services/autonomous-load-balancing-book1.service';
import { AutonomousLoadBalancingGridBook1Controller } from './controllers/autonomous-load-balancing-book1.controller';
import { AutonomousDatabaseShardBook2Service } from './services/autonomous-database-shard-book2.service';
import { AutonomousDatabaseShardBook2Controller } from './controllers/autonomous-database-shard-book2.controller';
import { SovereignZeroTrustLedgerBook2Service } from './services/sovereign-zerotrust-ledger-book2.service';
import { SovereignZeroTrustLedgerBook2Controller } from './controllers/sovereign-zerotrust-ledger-book2.controller';
import { SovereignQuantumIdentityFederationBook3Service } from './services/sovereign-quantum-identity-book3.service';
import { SovereignQuantumIdentityFederationBook3Controller } from './controllers/sovereign-quantum-identity-book3.controller';
import { NeuromorphicEdgeDiagnosticsMeshBook3Service } from './services/neuromorphic-edge-diagnostics-book3.service';
import { NeuromorphicEdgeDiagnosticsMeshBook3Controller } from './controllers/neuromorphic-edge-diagnostics-book3.controller';
import { PredictiveAutonomousSupplyChainMeshBook4Service } from './services/predictive-supplychain-mesh-book4.service';
import { PredictiveAutonomousSupplyChainMeshBook4Controller } from './controllers/predictive-supplychain-mesh-book4.controller';
import { SelfHealingQuantumVaultBook4Service } from './services/self-healing-quantum-vault-book4.service';
import { SelfHealingQuantumVaultBook4Controller } from './controllers/self-healing-quantum-vault-book4.controller';
import { AutonomousSpatialTelemetryEdgeMeshBook5Service } from './services/spatial-telemetry-edgemesh-book5.service';
import { AutonomousSpatialTelemetryEdgeMeshBook5Controller } from './controllers/spatial-telemetry-edgemesh-book5.controller';
import { SelfOptimizingZeroTrustMicrosegmentationBook5Service } from './services/self-optimization-microsegmentation-book5.service';
import { SelfOptimizingZeroTrustMicrosegmentationBook5Controller } from './controllers/self-optimization-microsegmentation-book5.controller';
import { AutonomousSwarmRoboticsGridBook6Service } from './services/quantum-robotics-book6.service';
import { AutonomousSwarmRoboticsGridBook6Controller } from './controllers/quantum-robotics-book6.controller';
import { GenerativeAIHyperTuningEngineBook6Service } from './services/quantum-robotics-genai-tuning-book6.service';
import { GenerativeAIHyperTuningEngineBook6Controller } from './controllers/quantum-robotics-genai-tuning-book6.controller';
import { SovereignMultiTenantMicrosegmentationBook7Service } from './services/sovereign-multitenant-book7.service';
import { SovereignMultiTenantMicrosegmentationBook7Controller } from './controllers/sovereign-multitenant-book7.controller';
import { GlobalCrossCloudGATuningGridBook7Service } from './services/ga-tuning-crosscloud-book7.service';
import { GlobalCrossCloudGATuningGridBook7Controller } from './controllers/ga-tuning-crosscloud-book7.controller';
import { HolographicQuantumSecurityEnclaveBook8Service } from './services/holographic-quantum-security-book8.service';
import { HolographicQuantumSecurityEnclaveBook8Controller } from './controllers/holographic-quantum-security-book8.controller';
import { DigitalTwinComplianceMatrixBook8Service } from './services/digital-twin-compliance-book8.service';
import { DigitalTwinComplianceMatrixBook8Controller } from './controllers/digital-twin-compliance-book8.controller';
import { ZeroKnowledgePrivacyProtectionMeshBook9Service } from './services/zk-privacy-neuromorphic-book9.service';
import { ZeroKnowledgePrivacyProtectionMeshBook9Controller } from './controllers/zk-privacy-neuromorphic-book9.controller';
import { NeuromorphicAIEdgeGridBook9Service } from './services/neuromorphic-edge-grid-book9.service';
import { NeuromorphicAIEdgeGridBook9Controller } from './controllers/neuromorphic-edge-grid-book9.controller';
import { Phase15MasterPlatformReleaseBook10Service } from './services/phase15-master-release-book10.service';
import { Phase15MasterPlatformReleaseBook10Controller } from './controllers/phase15-master-release-book10.controller';
import { Phase15AIGovernanceEthicsComplianceBook10Service } from './services/phase15-ai-governance-book10.service';
import { Phase15AIGovernanceEthicsComplianceBook10Controller } from './controllers/phase15-ai-governance-book10.controller';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [
    Phase15MasterPlatformReleaseBook10Controller,
    Phase15AIGovernanceEthicsComplianceBook10Controller,
    ZeroKnowledgePrivacyProtectionMeshBook9Controller,
    NeuromorphicAIEdgeGridBook9Controller,
    HolographicQuantumSecurityEnclaveBook8Controller,
    DigitalTwinComplianceMatrixBook8Controller,
    SovereignMultiTenantMicrosegmentationBook7Controller,
    GlobalCrossCloudGATuningGridBook7Controller,
    AutonomousSwarmRoboticsGridBook6Controller,
    GenerativeAIHyperTuningEngineBook6Controller,
    AutonomousSpatialTelemetryEdgeMeshBook5Controller,
    SelfOptimizingZeroTrustMicrosegmentationBook5Controller,
    PredictiveAutonomousSupplyChainMeshBook4Controller,
    SelfHealingQuantumVaultBook4Controller,
    SovereignQuantumIdentityFederationBook3Controller,
    NeuromorphicEdgeDiagnosticsMeshBook3Controller,
    AutonomousDatabaseShardBook2Controller,
    SovereignZeroTrustLedgerBook2Controller,
    GlobalMultiCloudSovereignMeshBook1Controller,
    AutonomousLoadBalancingGridBook1Controller,
    MasterPlatformReleaseBook10Controller,
    MilestoneCompletionBook9Controller,
    ExecutiveSignoffBook8Controller,
    SovereignMicrosegmentationBook7Controller,
    DigitalTwinSimulationBook6Controller,
    PredictiveComplianceGovernanceBook6Controller,
    SwarmRoboticsOrchestratorBook5Controller,
    GenerativeAiTuningEngineBook5Controller,
    SupplyChainPredictorBook4Controller,
    QuantumIdentityMeshBook4Controller,
    HolographicDiagnosticsBook3Controller,
    QuantumEdgeSecurityBook3Controller,
    ZeroKnowledgePrivacyBook2Controller,
    NeuromorphicAiBook2Controller,
    SpatialTelemetryBook1Controller,
    EdgeMeshDispatchBook1Controller,
    AiGovernanceEthicsBook10Controller,
    AiModelDriftBook9Controller,
    AiSafetyBoundaryBook8Controller,
    SelfOptimizationBook7Controller,
    GaPerformanceTuningBook5Controller,
    SwarmSelfHealingBook3Controller,
    FederatedLearningBook2Controller,
    AutonomousAIBook10Controller,
    AutonomousAIBook9Controller,
    AutonomousAIBook8Controller,
    AutonomousAIBook7Controller,
    AutonomousAIBook5Controller,
    AutonomousAIBook4Controller,
    AutonomousAIBook3Controller,
    AutonomousAIBook2Controller,
    AutonomousAIController,
  ],
  providers: [
    AutonomousAIService,
    AutonomousAIBook2Service,
    AutonomousAIBook3Service,
    AutonomousAIBook4Service,
    AutonomousAIBook5Service,
    AutonomousAIBook7Service,
    AutonomousAIBook8Service,
    AutonomousAIBook9Service,
    AutonomousAIBook10Service,
    FederatedLearningBook2Service,
    SwarmSelfHealingBook3Service,
    GaPerformanceTuningBook5Service,
    SelfOptimizationBook7Service,
    AiSafetyBoundaryBook8Service,
    AiModelDriftBook9Service,
    AiGovernanceEthicsBook10Service,
    SpatialTelemetryBook1Service,
    EdgeMeshDispatchBook1Service,
    ZeroKnowledgePrivacyBook2Service,
    NeuromorphicAiBook2Service,
    HolographicDiagnosticsBook3Service,
    QuantumEdgeSecurityBook3Service,
    SupplyChainPredictorBook4Service,
    QuantumIdentityMeshBook4Service,
    SwarmRoboticsOrchestratorBook5Service,
    GenerativeAiTuningEngineBook5Service,
    DigitalTwinSimulationBook6Service,
    PredictiveComplianceGovernanceBook6Service,
    SovereignMicrosegmentationBook7Service,
    ExecutiveSignoffBook8Service,
    MilestoneCompletionBook9Service,
    MasterPlatformReleaseBook10Service,
    GlobalMultiCloudSovereignMeshBook1Service,
    AutonomousLoadBalancingGridBook1Service,
    AutonomousDatabaseShardBook2Service,
    SovereignZeroTrustLedgerBook2Service,
    SovereignQuantumIdentityFederationBook3Service,
    NeuromorphicEdgeDiagnosticsMeshBook3Service,
    PredictiveAutonomousSupplyChainMeshBook4Service,
    SelfHealingQuantumVaultBook4Service,
    AutonomousSpatialTelemetryEdgeMeshBook5Service,
    SelfOptimizingZeroTrustMicrosegmentationBook5Service,
    AutonomousSwarmRoboticsGridBook6Service,
    GenerativeAIHyperTuningEngineBook6Service,
    SovereignMultiTenantMicrosegmentationBook7Service,
    GlobalCrossCloudGATuningGridBook7Service,
    HolographicQuantumSecurityEnclaveBook8Service,
    DigitalTwinComplianceMatrixBook8Service,
    ZeroKnowledgePrivacyProtectionMeshBook9Service,
    NeuromorphicAIEdgeGridBook9Service,
    Phase15MasterPlatformReleaseBook10Service,
    Phase15AIGovernanceEthicsComplianceBook10Service,
  ],
  exports: [
    AutonomousAIService,
    AutonomousAIBook2Service,
    AutonomousAIBook3Service,
    AutonomousAIBook4Service,
    AutonomousAIBook5Service,
    AutonomousAIBook7Service,
    AutonomousAIBook8Service,
    AutonomousAIBook9Service,
    AutonomousAIBook10Service,
    FederatedLearningBook2Service,
    SwarmSelfHealingBook3Service,
    GaPerformanceTuningBook5Service,
    SelfOptimizationBook7Service,
    AiSafetyBoundaryBook8Service,
    AiModelDriftBook9Service,
    AiGovernanceEthicsBook10Service,
    SpatialTelemetryBook1Service,
    EdgeMeshDispatchBook1Service,
    ZeroKnowledgePrivacyBook2Service,
    NeuromorphicAiBook2Service,
    HolographicDiagnosticsBook3Service,
    QuantumEdgeSecurityBook3Service,
    SupplyChainPredictorBook4Service,
    QuantumIdentityMeshBook4Service,
    SwarmRoboticsOrchestratorBook5Service,
    GenerativeAiTuningEngineBook5Service,
    DigitalTwinSimulationBook6Service,
    PredictiveComplianceGovernanceBook6Service,
    SovereignMicrosegmentationBook7Service,
    ExecutiveSignoffBook8Service,
    MilestoneCompletionBook9Service,
    MasterPlatformReleaseBook10Service,
    GlobalMultiCloudSovereignMeshBook1Service,
    AutonomousLoadBalancingGridBook1Service,
    AutonomousDatabaseShardBook2Service,
    SovereignZeroTrustLedgerBook2Service,
    SovereignQuantumIdentityFederationBook3Service,
    NeuromorphicEdgeDiagnosticsMeshBook3Service,
    PredictiveAutonomousSupplyChainMeshBook4Service,
    SelfHealingQuantumVaultBook4Service,
    AutonomousSpatialTelemetryEdgeMeshBook5Service,
    SelfOptimizingZeroTrustMicrosegmentationBook5Service,
    AutonomousSwarmRoboticsGridBook6Service,
    GenerativeAIHyperTuningEngineBook6Service,
    SovereignMultiTenantMicrosegmentationBook7Service,
    GlobalCrossCloudGATuningGridBook7Service,
    HolographicQuantumSecurityEnclaveBook8Service,
    DigitalTwinComplianceMatrixBook8Service,
    ZeroKnowledgePrivacyProtectionMeshBook9Service,
    NeuromorphicAIEdgeGridBook9Service,
    Phase15MasterPlatformReleaseBook10Service,
    Phase15AIGovernanceEthicsComplianceBook10Service,
  ],
})
export class AutonomousAIModule {}
