import { Test, TestingModule } from '@nestjs/testing';
import { SwarmRoboticsOrchestratorBook5Service } from './services/swarm-robotics-orchestrator-book5.service';
import { SwarmRoboticsOrchestratorBook5Controller } from './controllers/swarm-robotics-orchestrator-book5.controller';
import { GenerativeAiTuningEngineBook5Service } from './services/generative-ai-tuning-engine-book5.service';
import { GenerativeAiTuningEngineBook5Controller } from './controllers/generative-ai-tuning-engine-book5.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 14 Book 5 — Swarm Robotics Fleet Orchestrator & Generative AI Cross-Cloud Tuning Engine', () => {
  let swarmService: SwarmRoboticsOrchestratorBook5Service;
  let swarmController: SwarmRoboticsOrchestratorBook5Controller;
  let genAiService: GenerativeAiTuningEngineBook5Service;
  let genAiController: GenerativeAiTuningEngineBook5Controller;

  const mockPrismaService = {
    swarmRoboticsOrchestratorBook5: {
      upsert: jest.fn().mockResolvedValue({
        id: 'uuid-swarm-01',
        fleetCode: 'SWARM-ROBOT-P14-B5-01',
        robotUnitType: 'AUTONOMOUS_REPAIR_ARM',
        activeUnitsCount: 24,
        taskAllocationStatus: 'OPTIMAL_DISPATCHED',
        fleetEfficiencyScore: 0.994,
      }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    generativeAiTuningEngineBook5: {
      upsert: jest.fn().mockResolvedValue({
        id: 'uuid-genai-01',
        tuningJobCode: 'GENAI-TUNE-P14-B5-01',
        targetModelArchitecture: 'TRUSTZONE_LLM_70B_QUANTIZED',
        executionCloudTarget: 'HYBRID_GCP_AWS_QUANTUM',
        hyperparameterScore: 0.989,
        jobExecutionStatus: 'TRAINING_CONVERGED',
      }),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        SwarmRoboticsOrchestratorBook5Controller,
        GenerativeAiTuningEngineBook5Controller,
      ],
      providers: [
        SwarmRoboticsOrchestratorBook5Service,
        GenerativeAiTuningEngineBook5Service,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    swarmService = module.get(SwarmRoboticsOrchestratorBook5Service);
    swarmController = module.get(SwarmRoboticsOrchestratorBook5Controller);
    genAiService = module.get(GenerativeAiTuningEngineBook5Service);
    genAiController = module.get(GenerativeAiTuningEngineBook5Controller);
  });

  it('should be defined — SwarmRoboticsOrchestratorBook5Service', () => {
    expect(swarmService).toBeDefined();
  });

  it('should be defined — SwarmRoboticsOrchestratorBook5Controller', () => {
    expect(swarmController).toBeDefined();
  });

  it('should be defined — GenerativeAiTuningEngineBook5Service', () => {
    expect(genAiService).toBeDefined();
  });

  it('should be defined — GenerativeAiTuningEngineBook5Controller', () => {
    expect(genAiController).toBeDefined();
  });

  it('should dispatch robotics fleet', async () => {
    const result = await swarmService.dispatchFleet({
      fleetCode: 'SWARM-ROBOT-P14-B5-01',
    });
    expect(result).toBeDefined();
    expect(result.fleetCode).toBe('SWARM-ROBOT-P14-B5-01');
    expect(
      mockPrismaService.swarmRoboticsOrchestratorBook5.upsert,
    ).toHaveBeenCalled();
  });

  it('should execute generative AI tuning job', async () => {
    const result = await genAiService.executeTuningJob({
      tuningJobCode: 'GENAI-TUNE-P14-B5-01',
    });
    expect(result).toBeDefined();
    expect(result.tuningJobCode).toBe('GENAI-TUNE-P14-B5-01');
    expect(
      mockPrismaService.generativeAiTuningEngineBook5.upsert,
    ).toHaveBeenCalled();
  });

  it('should get fleets via controller', async () => {
    await swarmController.findAll();
    expect(
      mockPrismaService.swarmRoboticsOrchestratorBook5.findMany,
    ).toHaveBeenCalled();
  });

  it('should get tuning jobs via controller', async () => {
    await genAiController.findAll();
    expect(
      mockPrismaService.generativeAiTuningEngineBook5.findMany,
    ).toHaveBeenCalled();
  });
});
