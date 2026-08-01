import { Test, TestingModule } from '@nestjs/testing';
import { AutonomousDatabaseShardBook2Service } from './services/autonomous-database-shard-book2.service';
import { AutonomousDatabaseShardBook2Controller } from './controllers/autonomous-database-shard-book2.controller';
import { SovereignZeroTrustLedgerBook2Service } from './services/sovereign-zerotrust-ledger-book2.service';
import { SovereignZeroTrustLedgerBook2Controller } from './controllers/sovereign-zerotrust-ledger-book2.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('Phase 15 Book 2 — Autonomous Database Sharding & Sovereign Zero-Trust Distributed Ledger', () => {
  let shardService: AutonomousDatabaseShardBook2Service;
  let shardController: AutonomousDatabaseShardBook2Controller;
  let ledgerService: SovereignZeroTrustLedgerBook2Service;
  let ledgerController: SovereignZeroTrustLedgerBook2Controller;

  const mockPrismaService = {
    autonomousDatabaseShardBook2: {
      upsert: jest.fn().mockResolvedValue({
        id: 'shard-uuid-001',
        shardCode: 'SHARD-EU-WEST-01',
        shardRegion: 'EU_CENTRAL_GERMANY',
        assignedTenantCount: 1500,
        shardStatus: 'ACTIVE_HEALTHY',
        latencyMs: 2.1,
        lastRebalancedAt: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'shard-uuid-001',
          shardCode: 'SHARD-EU-WEST-01',
          shardRegion: 'EU_CENTRAL_GERMANY',
          assignedTenantCount: 1500,
          shardStatus: 'ACTIVE_HEALTHY',
          latencyMs: 2.1,
          lastRebalancedAt: new Date(),
          createdAt: new Date(),
        },
      ]),
    },
    sovereignZeroTrustLedgerBook2: {
      upsert: jest.fn().mockResolvedValue({
        id: 'ledger-uuid-001',
        ledgerBlockCode: 'LEDGER-BLOCK-P15-B2-01',
        previousBlockHash:
          '0000000000000000000000000000000000000000000000000000000000000000',
        merkleRootHash:
          'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        consensusProtocol: 'PBFT_ZERO_TRUST_QUORUM',
        auditComplianceVerified: true,
        timestamp: new Date(),
        createdAt: new Date(),
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'ledger-uuid-001',
          ledgerBlockCode: 'LEDGER-BLOCK-P15-B2-01',
          previousBlockHash:
            '0000000000000000000000000000000000000000000000000000000000000000',
          merkleRootHash:
            'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          consensusProtocol: 'PBFT_ZERO_TRUST_QUORUM',
          auditComplianceVerified: true,
          timestamp: new Date(),
          createdAt: new Date(),
        },
      ]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        AutonomousDatabaseShardBook2Controller,
        SovereignZeroTrustLedgerBook2Controller,
      ],
      providers: [
        AutonomousDatabaseShardBook2Service,
        SovereignZeroTrustLedgerBook2Service,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    shardService = module.get<AutonomousDatabaseShardBook2Service>(
      AutonomousDatabaseShardBook2Service,
    );
    shardController = module.get<AutonomousDatabaseShardBook2Controller>(
      AutonomousDatabaseShardBook2Controller,
    );
    ledgerService = module.get<SovereignZeroTrustLedgerBook2Service>(
      SovereignZeroTrustLedgerBook2Service,
    );
    ledgerController = module.get<SovereignZeroTrustLedgerBook2Controller>(
      SovereignZeroTrustLedgerBook2Controller,
    );
  });

  // Instantiation tests
  it('should be defined — AutonomousDatabaseShardBook2Service', () => {
    expect(shardService).toBeDefined();
  });

  it('should be defined — AutonomousDatabaseShardBook2Controller', () => {
    expect(shardController).toBeDefined();
  });

  it('should be defined — SovereignZeroTrustLedgerBook2Service', () => {
    expect(ledgerService).toBeDefined();
  });

  it('should be defined — SovereignZeroTrustLedgerBook2Controller', () => {
    expect(ledgerController).toBeDefined();
  });

  // Service method tests
  it('should register autonomous multi-region database shard', async () => {
    const result = await shardService.registerShard({
      shardCode: 'SHARD-EU-WEST-01',
    });
    expect(result).toBeDefined();
    expect(result.shardCode).toBe('SHARD-EU-WEST-01');
    expect(result.shardStatus).toBe('ACTIVE_HEALTHY');
  });

  it('should record cryptographic block into sovereign zero-trust distributed ledger', async () => {
    const result = await ledgerService.recordLedgerBlock({
      ledgerBlockCode: 'LEDGER-BLOCK-P15-B2-01',
    });
    expect(result).toBeDefined();
    expect(result.ledgerBlockCode).toBe('LEDGER-BLOCK-P15-B2-01');
    expect(result.auditComplianceVerified).toBe(true);
  });

  // Controller list delegation tests
  it('should list database shards via controller', async () => {
    const result = await shardController.getShards();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should list ledger blocks via controller', async () => {
    const result = await ledgerController.getLedgerBlocks();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});
