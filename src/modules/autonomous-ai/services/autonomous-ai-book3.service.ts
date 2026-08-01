import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface AllocateWorkloadDto {
  branchId: string;
  technicianId: string;
  predictedCapacityHours: number;
  allocatedWorkloadHours: number;
  recommendations: string[];
}

export interface LogIncidentDto {
  incidentCode: string;
  severity?: string;
  rootCause: string;
  resolutionAction: string;
}

@Injectable()
export class AutonomousAIBook3Service {
  constructor(private readonly prisma: PrismaService) {}

  // ----------------------------------------------------
  // 1. PREDICTIVE AI WORKLOAD & CAPACITY ALLOCATION
  // ----------------------------------------------------
  async allocateTechnicianWorkload(dto: AllocateWorkloadDto) {
    const optimizationScore = Number(
      Math.min(
        100,
        Math.max(
          0,
          100 -
            Math.abs(dto.allocatedWorkloadHours - dto.predictedCapacityHours) *
              10,
        ),
      ).toFixed(1),
    );

    return this.prisma.aIWorkloadAllocation.create({
      data: {
        branchId: dto.branchId,
        technicianId: dto.technicianId,
        predictedCapacityHours: dto.predictedCapacityHours,
        allocatedWorkloadHours: dto.allocatedWorkloadHours,
        optimizationScore,
        recommendationJson: JSON.stringify(dto.recommendations || []),
      },
    });
  }

  async getWorkloadAllocations(branchId?: string) {
    return this.prisma.aIWorkloadAllocation.findMany({
      where: branchId ? { branchId } : undefined,
      orderBy: { allocatedDate: 'desc' },
    });
  }

  // ----------------------------------------------------
  // 2. SELF-HEALING WORKFLOW INCIDENT RESOLUTION
  // ----------------------------------------------------
  async logSelfHealingIncident(dto: LogIncidentDto) {
    return this.prisma.selfHealingWorkflowIncident.create({
      data: {
        incidentCode: dto.incidentCode,
        severity: dto.severity ?? 'MEDIUM',
        rootCause: dto.rootCause,
        resolutionAction: dto.resolutionAction,
        status: 'RESOLVED',
        resolvedAt: new Date(),
      },
    });
  }

  async getIncidents() {
    return this.prisma.selfHealingWorkflowIncident.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
