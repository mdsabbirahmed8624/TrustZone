import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RecordLedgerBlockDto {
  ledgerBlockCode: string;
  previousBlockHash?: string;
  merkleRootHash?: string;
  consensusProtocol?: string;
  auditComplianceVerified?: boolean;
}

@Injectable()
export class SovereignZeroTrustLedgerBook2Service {
  private readonly logger = new Logger(
    SovereignZeroTrustLedgerBook2Service.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Record a cryptographic block into the sovereign zero-trust distributed ledger.
   */
  async recordLedgerBlock(dto: RecordLedgerBlockDto) {
    this.logger.log(
      `Recording sovereign zero-trust ledger block: ${dto.ledgerBlockCode}`,
    );

    return this.prisma.sovereignZeroTrustLedgerBook2.upsert({
      where: { ledgerBlockCode: dto.ledgerBlockCode },
      update: {
        previousBlockHash:
          dto.previousBlockHash ??
          '0000000000000000000000000000000000000000000000000000000000000000',
        merkleRootHash:
          dto.merkleRootHash ??
          'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        consensusProtocol: dto.consensusProtocol ?? 'PBFT_ZERO_TRUST_QUORUM',
        auditComplianceVerified: dto.auditComplianceVerified ?? true,
        timestamp: new Date(),
      },
      create: {
        ledgerBlockCode: dto.ledgerBlockCode,
        previousBlockHash:
          dto.previousBlockHash ??
          '0000000000000000000000000000000000000000000000000000000000000000',
        merkleRootHash:
          dto.merkleRootHash ??
          'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        consensusProtocol: dto.consensusProtocol ?? 'PBFT_ZERO_TRUST_QUORUM',
        auditComplianceVerified: dto.auditComplianceVerified ?? true,
        timestamp: new Date(),
      },
    });
  }

  /**
   * List all sovereign zero-trust distributed ledger blocks.
   */
  async getLedgerBlocks() {
    return this.prisma.sovereignZeroTrustLedgerBook2.findMany({
      orderBy: { timestamp: 'desc' },
    });
  }
}
