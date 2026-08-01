import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RegisterSwarmAgentDto {
  agentCode: string;
  swarmClusterId: string;
  targetService: string;
  remediationAction?: string;
  recoveryTimeMs?: number;
}

@Injectable()
export class SwarmSelfHealingBook3Service {
  constructor(private readonly prisma: PrismaService) {}

  async registerSwarmAgent(dto: RegisterSwarmAgentDto) {
    return this.prisma.swarmSelfHealingAgent.upsert({
      where: { agentCode: dto.agentCode },
      update: {
        swarmClusterId: dto.swarmClusterId,
        targetService: dto.targetService,
        remediationAction: dto.remediationAction ?? 'AUTO_FAILOVER',
        recoveryTimeMs: dto.recoveryTimeMs ?? 350,
        status: 'HEALTHY',
        lastIncidentAt: new Date(),
      },
      create: {
        agentCode: dto.agentCode,
        swarmClusterId: dto.swarmClusterId,
        targetService: dto.targetService,
        remediationAction: dto.remediationAction ?? 'AUTO_FAILOVER',
        recoveryTimeMs: dto.recoveryTimeMs ?? 350,
        status: 'HEALTHY',
        lastIncidentAt: new Date(),
      },
    });
  }

  async getSwarmAgents() {
    return this.prisma.swarmSelfHealingAgent.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
