import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RegisterNeuromorphicMeshDto {
  meshNodeCode: string;
  spikeNeuralLatencyMs?: number;
  diagnosticAccuracyPercent?: number;
  hardwareAcceleratedEngine?: string;
  meshStatus?: string;
}

@Injectable()
export class NeuromorphicEdgeDiagnosticsMeshBook3Service {
  private readonly logger = new Logger(
    NeuromorphicEdgeDiagnosticsMeshBook3Service.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Register or calibrate a neuromorphic edge diagnostics mesh node.
   */
  async registerMeshNode(dto: RegisterNeuromorphicMeshDto) {
    this.logger.log(
      `Registering neuromorphic edge diagnostics node: ${dto.meshNodeCode}`,
    );

    return this.prisma.neuromorphicEdgeDiagnosticsMeshBook3.upsert({
      where: { meshNodeCode: dto.meshNodeCode },
      update: {
        spikeNeuralLatencyMs: dto.spikeNeuralLatencyMs ?? 0.42,
        diagnosticAccuracyPercent: dto.diagnosticAccuracyPercent ?? 99.98,
        hardwareAcceleratedEngine:
          dto.hardwareAcceleratedEngine ?? 'TENSOR_NEUROMORPHIC_NPU',
        meshStatus: dto.meshStatus ?? 'ACTIVE_HEALTHY',
        lastDiagnosedAt: new Date(),
      },
      create: {
        meshNodeCode: dto.meshNodeCode,
        spikeNeuralLatencyMs: dto.spikeNeuralLatencyMs ?? 0.42,
        diagnosticAccuracyPercent: dto.diagnosticAccuracyPercent ?? 99.98,
        hardwareAcceleratedEngine:
          dto.hardwareAcceleratedEngine ?? 'TENSOR_NEUROMORPHIC_NPU',
        meshStatus: dto.meshStatus ?? 'ACTIVE_HEALTHY',
        lastDiagnosedAt: new Date(),
      },
    });
  }

  /**
   * List all neuromorphic edge diagnostics mesh nodes.
   */
  async getMeshNodes() {
    return this.prisma.neuromorphicEdgeDiagnosticsMeshBook3.findMany({
      orderBy: { lastDiagnosedAt: 'desc' },
    });
  }
}
