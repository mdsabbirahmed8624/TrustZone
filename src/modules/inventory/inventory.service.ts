import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartDto } from './dto/create-part.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. List parts with filters, total stocks, valuation, and reservations
  async findAllParts(query: {
    search?: string;
    category?: string;
    brand?: string;
    branchId?: string;
  }) {
    const where: any = {};
    if (query.category) {
      where.category = query.category;
    }
    if (query.brand) {
      where.brand = query.brand;
    }
    if (query.search) {
      const searchLower = query.search.trim().toLowerCase();
      where.OR = [
        { name: { contains: searchLower, mode: 'insensitive' } },
        { sku: { contains: searchLower, mode: 'insensitive' } },
        { brandCompatibility: { contains: searchLower, mode: 'insensitive' } },
      ];
    }

    const parts = await this.prisma.part.findMany({
      where,
      include: {
        branchInventory: true,
      },
      orderBy: { name: 'asc' },
    });

    const results = [];
    for (const part of parts) {
      // Calculate total stock (sum across all branches)
      const totalStock = part.branchInventory.reduce(
        (acc, curr) => acc + curr.quantity,
        0,
      );

      // Valuation = totalStock * basePrice
      const valuation = totalStock * Number(part.basePrice);

      // Calculate reserved stock dynamically (tickets in booked, diagnosing, repairing requiring this SKU)
      const activeTickets = await this.prisma.ticket.findMany({
        where: {
          status: { in: ['booked', 'diagnosing', 'repairing'] },
          partsRequired: { has: part.sku },
        },
        select: { id: true },
      });
      const reservedStock = activeTickets.length;

      // Filter branch specific stock if requested
      let branchStock = null;
      let isLowStock = false;
      let binLocation = null;
      if (query.branchId) {
        const bi = part.branchInventory.find(
          (b) => b.branchId === query.branchId,
        );
        branchStock = bi ? bi.quantity : 0;
        binLocation = bi ? bi.binLocation : null;
        isLowStock = branchStock < part.minimumStockBuffer;
      }

      results.push({
        ...part,
        totalStock,
        valuation,
        reservedStock,
        branchStock,
        binLocation,
        isLowStock,
      });
    }

    return results;
  }

  // 2. Fetch single part with full branch inventories and audit trail
  async findOnePart(id: string) {
    const part = await this.prisma.part.findUnique({
      where: { id },
      include: {
        branchInventory: {
          include: {
            branch: { select: { name: true } },
          },
        },
        stockMovements: {
          include: {
            branch: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        supplier: true,
      },
    });

    if (!part) {
      throw new NotFoundException(`Part with ID ${id} not found.`);
    }

    // Dynamic Reserved Count
    const activeTickets = await this.prisma.ticket.findMany({
      where: {
        status: { in: ['booked', 'diagnosing', 'repairing'] },
        partsRequired: { has: part.sku },
      },
      include: {
        customer: { select: { firstName: true, lastName: true } },
        device: { select: { brand: true, model: true } },
      },
    });

    return {
      ...part,
      reservedCount: activeTickets.length,
      reservedTickets: activeTickets.map((t) => ({
        ticketId: t.id,
        status: t.status,
        customerName: `${t.customer.firstName} ${t.customer.lastName}`,
        deviceModel: `${t.device.brand} ${t.device.model}`,
      })),
    };
  }

  // 3. Create new part in catalog
  async createPart(dto: CreatePartDto) {
    const existing = await this.prisma.part.findUnique({
      where: { sku: dto.sku },
    });

    if (existing) {
      throw new BadRequestException(
        `Part with SKU ${dto.sku} already exists in the catalog.`,
      );
    }

    return this.prisma.part.create({
      data: {
        sku: dto.sku,
        name: dto.name,
        category: dto.category,
        brand: dto.brand,
        brandCompatibility: dto.brandCompatibility,
        modelCompatibility: dto.modelCompatibility,
        basePrice: dto.basePrice,
        minimumStockBuffer: dto.minimumStockBuffer ?? 5,
        supplierId: dto.supplierId,
      },
    });
  }

  // 4. Adjust stock at a branch (manual correction or purchase)
  async adjustStock(partId: string, dto: AdjustStockDto) {
    const part = await this.prisma.part.findUnique({ where: { id: partId } });
    if (!part) throw new NotFoundException(`Part with ID ${partId} not found.`);

    // Upsert BranchInventory record
    const bi = await this.prisma.branchInventory.upsert({
      where: {
        branchId_partId: {
          branchId: dto.branchId,
          partId,
        },
      },
      update: {
        quantity: { increment: dto.quantityDelta },
      },
      create: {
        branchId: dto.branchId,
        partId,
        quantity: dto.quantityDelta >= 0 ? dto.quantityDelta : 0,
      },
    });

    // Record Stock Movement Log
    await this.prisma.stockMovement.create({
      data: {
        branchId: dto.branchId,
        partId,
        quantityDelta: dto.quantityDelta,
        type: dto.type,
      },
    });

    return bi;
  }

  // 5. Transfer stock between branches (2-step workflow: PENDING -> TRANSFERRED/CANCELLED)
  async createTransfer(partId: string, dto: CreateTransferDto) {
    const part = await this.prisma.part.findUnique({ where: { id: partId } });
    if (!part) throw new NotFoundException(`Part with ID ${partId} not found.`);

    // Check if source branch has enough quantity
    const sourceBi = await this.prisma.branchInventory.findUnique({
      where: {
        branchId_partId: {
          branchId: dto.fromBranchId,
          partId,
        },
      },
    });

    if (!sourceBi || sourceBi.quantity < dto.quantity) {
      throw new BadRequestException(
        `Insufficient stock at the source branch. Available: ${sourceBi?.quantity || 0}, requested: ${dto.quantity}`,
      );
    }

    // Deduct stock immediately from source branch and put in "PENDING" transfer transit
    await this.prisma.branchInventory.update({
      where: {
        branchId_partId: {
          branchId: dto.fromBranchId,
          partId,
        },
      },
      data: {
        quantity: { decrement: dto.quantity },
      },
    });

    // Create Stock Movement log for deduction
    await this.prisma.stockMovement.create({
      data: {
        branchId: dto.fromBranchId,
        partId,
        quantityDelta: -dto.quantity,
        type: 'transfer_transit_out',
      },
    });

    // Create Stock Transfer Record
    return this.prisma.stockTransfer.create({
      data: {
        fromBranchId: dto.fromBranchId,
        toBranchId: dto.toBranchId,
        partId,
        quantity: dto.quantity,
        status: 'PENDING',
      },
      include: {
        part: { select: { sku: true, name: true } },
        fromBranch: { select: { name: true } },
        toBranch: { select: { name: true } },
      },
    });
  }

  // 6. Complete transfer (Add stock to destination branch)
  async executeTransferStatus(
    transferId: string,
    status: 'TRANSFERRED' | 'CANCELLED',
  ) {
    const transfer = await this.prisma.stockTransfer.findUnique({
      where: { id: transferId },
    });

    if (!transfer) {
      throw new NotFoundException(
        `Stock transfer with ID ${transferId} not found.`,
      );
    }

    if (transfer.status !== 'PENDING') {
      throw new BadRequestException(
        `Transfer has already been processed. Current status: ${transfer.status}`,
      );
    }

    const updated = await this.prisma.stockTransfer.update({
      where: { id: transferId },
      data: { status },
    });

    if (status === 'TRANSFERRED') {
      // Add stock to destination branch
      await this.prisma.branchInventory.upsert({
        where: {
          branchId_partId: {
            branchId: transfer.toBranchId,
            partId: transfer.partId,
          },
        },
        update: {
          quantity: { increment: transfer.quantity },
        },
        create: {
          branchId: transfer.toBranchId,
          partId: transfer.partId,
          quantity: transfer.quantity,
        },
      });

      // Record Stock Movement log for addition
      await this.prisma.stockMovement.create({
        data: {
          branchId: transfer.toBranchId,
          partId: transfer.partId,
          quantityDelta: transfer.quantity,
          type: 'transfer_transit_in',
        },
      });
    } else if (status === 'CANCELLED') {
      // Return stock back to source branch
      await this.prisma.branchInventory.update({
        where: {
          branchId_partId: {
            branchId: transfer.fromBranchId,
            partId: transfer.partId,
          },
        },
        data: {
          quantity: { increment: transfer.quantity },
        },
      });

      // Record Stock Movement log for return
      await this.prisma.stockMovement.create({
        data: {
          branchId: transfer.fromBranchId,
          partId: transfer.partId,
          quantityDelta: transfer.quantity,
          type: 'transfer_cancelled_return',
        },
      });
    }

    return updated;
  }

  // 7. Get all stock movements audit trail
  async findAllMovements() {
    return this.prisma.stockMovement.findMany({
      include: {
        part: { select: { sku: true, name: true } },
        branch: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // 8. Get all branch transfers list
  async findAllTransfers() {
    return this.prisma.stockTransfer.findMany({
      include: {
        part: { select: { sku: true, name: true } },
        fromBranch: { select: { name: true } },
        toBranch: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
