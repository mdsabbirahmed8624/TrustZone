import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { CreatePODto } from './dto/create-po.dto';
import { FinanceService } from '../finance/finance.service';
import { eventBus, AutomationEvents } from '../../common/event-bus';

@Injectable()
export class SuppliersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly financeService: FinanceService,
  ) {}

  // 1. List all suppliers with outstanding balances
  async findAll() {
    const suppliers = await this.prisma.supplier.findMany({
      include: {
        ledger: true,
      },
      orderBy: { name: 'asc' },
    });

    return suppliers.map((s) => {
      // Calculate outstanding balance: CREDIT (we owe them) minus DEBIT (we paid them)
      const credits = s.ledger
        .filter((l) => l.type === 'CREDIT')
        .reduce((acc, curr) => acc + Number(curr.amount), 0);
      const debits = s.ledger
        .filter((l) => l.type === 'DEBIT')
        .reduce((acc, curr) => acc + Number(curr.amount), 0);
      const outstandingBalance = credits - debits;

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        contactPerson: s.contactPerson,
        address: s.address,
        rating: s.rating,
        outstandingBalance,
        createdAt: s.createdAt,
      };
    });
  }

  // 2. Fetch single supplier details with ledger history and PO records
  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        ledger: { orderBy: { createdAt: 'desc' } },
        purchaseOrders: {
          include: {
            branch: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        parts: true,
      },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found.`);
    }

    const credits = supplier.ledger
      .filter((l) => l.type === 'CREDIT')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    const debits = supplier.ledger
      .filter((l) => l.type === 'DEBIT')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    const outstandingBalance = credits - debits;

    return {
      ...supplier,
      outstandingBalance,
    };
  }

  // 3. Create new supplier profile
  async create(dto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        contactPerson: dto.contactPerson,
        address: dto.address,
        rating: dto.rating ?? 5.0,
      },
    });
  }

  // 4. Create Supplier Ledger Payment (record debit payment to supplier)
  async recordPayment(supplierId: string, amount: number, reference?: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
    });
    if (!supplier)
      throw new NotFoundException(`Supplier with ID ${supplierId} not found.`);

    const ledger = await this.prisma.supplierLedger.create({
      data: {
        supplierId,
        amount,
        type: 'DEBIT',
        reference: reference || 'Manual payment record',
      },
    });
    if (this.prisma.supplier?.update) {
      await this.prisma.supplier
        .update({
          where: { id: supplierId },
          data: { dueBalance: { decrement: Number(amount) } },
        })
        .catch(() => null);
    }
    return ledger;
  }

  // 5. Create Purchase Order (status starts as DRAFT)
  async createPurchaseOrder(dto: CreatePODto) {
    // Calculate total order amount
    const totalAmount = dto.items.reduce(
      (acc, curr) => acc + curr.quantity * curr.unitCost,
      0,
    );

    return this.prisma.purchaseOrder.create({
      data: {
        supplierId: dto.supplierId,
        branchId: dto.branchId,
        totalAmount,
        status: 'DRAFT',
        paymentStatus: 'unpaid',
        items: {
          create: dto.items.map((item) => ({
            partId: item.partId,
            quantity: item.quantity,
            unitCost: item.unitCost,
            quantityReceived: 0,
          })),
        },
      },
      include: {
        items: {
          include: {
            part: { select: { sku: true, name: true } },
          },
        },
        supplier: { select: { name: true } },
        branch: { select: { name: true } },
      },
    });
  }

  // 6. List all Purchase Orders
  async findAllPurchaseOrders(query?: { branchId?: string }) {
    const where: any = {};
    if (query?.branchId) {
      where.branchId = query.branchId;
    }

    return this.prisma.purchaseOrder.findMany({
      where,
      include: {
        items: {
          include: {
            part: { select: { sku: true, name: true } },
          },
        },
        supplier: { select: { name: true } },
        branch: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 7. Fetch Single Purchase Order Details
  async findOnePurchaseOrder(id: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            part: {
              select: { id: true, sku: true, name: true, basePrice: true },
            },
          },
        },
        supplier: true,
        branch: true,
      },
    });

    if (!po) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found.`);
    }

    return po;
  }

  // 8. Update Purchase Order status (supporting PO workflow & partial receiving)
  async updatePurchaseOrderStatus(
    id: string,
    status: 'APPROVED' | 'ORDERED' | 'RECEIVED' | 'CANCELLED',
    receivedItems?: { itemId: string; quantityReceived: number }[],
  ) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!po) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found.`);
    }

    // Standard PO State validations
    if (po.status === 'RECEIVED' || po.status === 'CANCELLED') {
      throw new BadRequestException(
        `Cannot update status of a finalized PO. Current status: ${po.status}`,
      );
    }

    // If status is RECEIVED, write CREDIT to supplier ledger & record PO Receipt journal (Debit Inventory, Credit A/P)
    if (status === 'RECEIVED' && po.status !== 'RECEIVED') {
      await this.prisma.supplierLedger.create({
        data: {
          supplierId: po.supplierId,
          amount: po.totalAmount,
          type: 'CREDIT',
          reference: `Purchase Order received: ${po.id.substring(0, 8)}`,
        },
      });

      await this.financeService.recordPOReceiptJournal(
        id,
        'd1111111-1111-1111-1111-111111111111',
      );
    }

    // If status is RECEIVED (or receivedItems are passed) -> execute partial or full receiving
    if (status === 'RECEIVED' && receivedItems && receivedItems.length > 0) {
      for (const itemInput of receivedItems) {
        const item = po.items.find((i) => i.id === itemInput.itemId);
        if (!item) continue;

        // Calculate delta (how many new parts are being checked in right now)
        const newReceived = itemInput.quantityReceived;
        const delta = newReceived - item.quantityReceived;

        if (delta > 0) {
          // Update item's received count in database
          await this.prisma.purchaseOrderItem.update({
            where: { id: item.id },
            data: { quantityReceived: newReceived },
          });

          // Add this delta to BranchInventory
          await this.prisma.branchInventory.upsert({
            where: {
              branchId_partId: {
                branchId: po.branchId,
                partId: item.partId,
              },
            },
            update: {
              quantity: { increment: delta },
            },
            create: {
              branchId: po.branchId,
              partId: item.partId,
              quantity: delta,
            },
          });

          // Log Stock Movement audit trail
          await this.prisma.stockMovement.create({
            data: {
              branchId: po.branchId,
              partId: item.partId,
              quantityDelta: delta,
              type: 'purchase_receipt',
            },
          });
        }
      }
    } else if (
      status === 'RECEIVED' &&
      (!receivedItems || receivedItems.length === 0)
    ) {
      // Full Receive fallback: receive all remaining ordered parts
      for (const item of po.items) {
        const delta = item.quantity - item.quantityReceived;
        if (delta > 0) {
          await this.prisma.purchaseOrderItem.update({
            where: { id: item.id },
            data: { quantityReceived: item.quantity },
          });

          await this.prisma.branchInventory.upsert({
            where: {
              branchId_partId: {
                branchId: po.branchId,
                partId: item.partId,
              },
            },
            update: {
              quantity: { increment: delta },
            },
            create: {
              branchId: po.branchId,
              partId: item.partId,
              quantity: delta,
            },
          });

          await this.prisma.stockMovement.create({
            data: {
              branchId: po.branchId,
              partId: item.partId,
              quantityDelta: delta,
              type: 'purchase_receipt',
            },
          });
        }
      }
    }

    // Save status
    const updatedPo = await this.prisma.purchaseOrder.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            part: { select: { sku: true, name: true } },
          },
        },
      },
    });

    // Write Audit Trail
    await this.prisma.auditTrail.create({
      data: {
        userId: null,
        action: 'UPDATE',
        affectedModule: 'SUPPLIERS',
        recordId: id,
        beforeValue: JSON.parse(JSON.stringify(po)),
        afterValue: JSON.parse(JSON.stringify(updatedPo)),
      },
    });

    if (status === 'RECEIVED') {
      eventBus.emit(AutomationEvents.PURCHASE_RECEIVED, {
        purchaseOrderId: id,
      });
    }

    return updatedPo;
  }

  // 9. Update Purchase Order Payment Status
  async updatePOPaymentStatus(
    id: string,
    paymentStatus: 'unpaid' | 'partially_paid' | 'paid',
  ) {
    const po = await this.prisma.purchaseOrder.findUnique({ where: { id } });
    if (!po)
      throw new NotFoundException(`Purchase Order with ID ${id} not found.`);

    const updated = await this.prisma.purchaseOrder.update({
      where: { id },
      data: { paymentStatus },
    });

    // If fully paid, add DEBIT ledger record automatically to balance the credit
    if (paymentStatus === 'paid') {
      // Check if DEBIT ledger record already exists to avoid duplication
      const existingDebit = await this.prisma.supplierLedger.findFirst({
        where: {
          supplierId: po.supplierId,
          type: 'DEBIT',
          reference: `PO Payment Settled: ${id.substring(0, 8)}`,
        },
      });

      if (!existingDebit) {
        const cashAccount =
          (await this.prisma.financialAccount.findFirst({
            where: {
              branchId: po.branchId,
              accountType: 'CASH',
            },
          })) ||
          (await this.prisma.financialAccount.findFirst({
            where: { accountType: 'CASH' },
          }));

        if (cashAccount) {
          await this.financeService.paySupplier(
            {
              supplierId: po.supplierId,
              amount: Number(po.totalAmount),
              accountId: cashAccount.id,
              reference: `PO Payment Settled: ${id.substring(0, 8)}`,
            },
            'd1111111-1111-1111-1111-111111111111',
          );
        } else {
          await this.prisma.supplierLedger.create({
            data: {
              supplierId: po.supplierId,
              amount: po.totalAmount,
              type: 'DEBIT',
              reference: `PO Payment Settled: ${id.substring(0, 8)}`,
            },
          });
        }
      }
    }

    return updated;
  }
}
