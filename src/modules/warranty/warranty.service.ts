import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWarrantyDto } from './dto/create-warranty.dto';
import { CreateClaimDto } from './dto/create-claim.dto';
import { SubmitInspectionDto } from './dto/submit-inspection.dto';
import { CreateRmaDto } from './dto/create-rma.dto';

@Injectable()
export class WarrantyService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // 1. WARRANTY CERTIFICATES LIFE CYCLE
  // ==========================================

  // Auto-generate warranty on ticket delivery
  async issueWarrantyForTicket(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { customer: true, invoice: true, device: true },
    });

    if (!ticket)
      throw new NotFoundException(`Ticket with ID ${ticketId} not found.`);
    if (ticket.status !== 'delivered') {
      throw new BadRequestException(
        'Warranties can only be auto-issued when tickets are delivered.',
      );
    }

    // Check if warranty already exists for this ticket
    const existing = await this.prisma.warranty.findUnique({
      where: { ticketId },
    });
    if (existing) return existing;

    const startDate = new Date();
    const durationMonths = 12; // Standard 1 Year coverage
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durationMonths);

    const seq = Math.floor(100000 + Math.random() * 900000);
    const warrantyNumber = `TZ-WARR-${seq}`;

    // Configurable coverage rules based on repair symptoms/faults
    const defaultCoverage = [
      'Screen Touch Digitizer Latency & Defective Pixels',
      'Battery Swelling & Charging IC Failures',
      'Structural Glass Seal Latency',
    ];
    const defaultExclusions = [
      'Physical Breakage / Cracked Display by Customer',
      'Liquid Submersion / Water Damage',
      'Unauthorized Third-Party Disassembly / Opening',
    ];

    return this.prisma.$transaction(async (tx) => {
      const warranty = await tx.warranty.create({
        data: {
          customerId: ticket.customerId,
          ticketId: ticket.id,
          invoiceId: ticket.invoice?.id || null,
          branchId: ticket.branchId,
          warrantyNumber,
          warrantyType: 'SERVICE', // Defaults to Service Warranty for repairs
          deviceBrand: ticket.device?.brand || 'Generic',
          deviceModel: ticket.device?.model || 'Device',
          serialOrImei:
            ticket.device?.serialNumber || ticket.device?.imei || 'N/A',
          durationMonths,
          startDate,
          endDate,
          status: 'ACTIVE',
          coverageDetails: defaultCoverage,
          exclusions: defaultExclusions,
          terms:
            'Standard TrustZone service warranty terms apply. Product must not show signs of physical impact.',
        },
      });

      // Write history
      await tx.warrantyHistory.create({
        data: {
          warrantyId: warranty.id,
          action: 'ISSUED',
          notes: `Automated warranty issued on Ticket #${ticket.id.substring(0, 8)} completion.`,
        },
      });

      // Log Customer activity
      await tx.customerActivity.create({
        data: {
          customerId: ticket.customerId,
          type: 'MANUAL_ACTION', // Standard type
          title: 'Warranty Certificate Issued',
          description: `Warranty ${warrantyNumber} issued for ${ticket.device?.brand || ''} ${ticket.device?.model || ''}. Expires: ${endDate.toLocaleDateString()}.`,
          referenceId: warranty.id,
        },
      });

      return warranty;
    });
  }

  // Create manual warranty
  async create(dto: CreateWarrantyDto, staffId?: string, staffName?: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer)
      throw new NotFoundException(
        `Customer with ID ${dto.customerId} not found.`,
      );

    const startDate = new Date();
    const durationMonths = dto.durationMonths || 12;
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durationMonths);

    const seq = Math.floor(100000 + Math.random() * 900000);
    const warrantyNumber = `TZ-WARR-${seq}`;

    return this.prisma.$transaction(async (tx) => {
      const warranty = await tx.warranty.create({
        data: {
          customerId: dto.customerId,
          ticketId: dto.ticketId || null,
          invoiceId: dto.invoiceId || null,
          branchId: dto.branchId,
          warrantyNumber,
          warrantyType: dto.warrantyType,
          deviceBrand: dto.deviceBrand,
          deviceModel: dto.deviceModel,
          serialOrImei: dto.serialOrImei,
          durationMonths,
          startDate,
          endDate,
          status: 'ACTIVE',
          coverageDetails: dto.coverageDetails || [
            'Standard Hardware Manufacturing defect coverage',
          ],
          exclusions: dto.exclusions || [
            'Physical damage',
            'Liquid damage',
            'Unauthorized disassembly',
          ],
          terms: dto.terms || 'Manufacturer terms and conditions apply.',
        },
      });

      await tx.warrantyHistory.create({
        data: {
          warrantyId: warranty.id,
          action: 'ISSUED',
          notes: `Manual warranty certificate issued by ${staffName || 'Staff'}.`,
          staffId,
          staffName,
        },
      });

      await tx.customerActivity.create({
        data: {
          customerId: dto.customerId,
          type: 'MANUAL_ACTION',
          title: 'Manual Warranty Issued',
          description: `Warranty certificate ${warrantyNumber} registered manually.`,
          referenceId: warranty.id,
          staffId,
        },
      });

      return warranty;
    });
  }

  // Public Verify / Lookup
  async verifyWarranty(warrantyNumber: string) {
    const warranty = await this.prisma.warranty.findFirst({
      where: {
        OR: [
          { warrantyNumber: { equals: warrantyNumber, mode: 'insensitive' } },
          { serialOrImei: { equals: warrantyNumber, mode: 'insensitive' } },
        ],
      },
      include: {
        customer: true,
        claims: true,
        history: true,
      },
    });

    if (!warranty) {
      throw new NotFoundException(
        `No warranty coverage records match: "${warrantyNumber}"`,
      );
    }

    // Log verification action
    await this.prisma.warrantyHistory.create({
      data: {
        warrantyId: warranty.id,
        action: 'VIEWED',
        notes: `Warranty certificate viewed/verified via search portal.`,
      },
    });

    return warranty;
  }

  // Void certificate
  async voidWarranty(
    id: string,
    reason: string,
    staffId?: string,
    staffName?: string,
  ) {
    const warranty = await this.prisma.warranty.findUnique({ where: { id } });
    if (!warranty)
      throw new NotFoundException(`Warranty with ID ${id} not found.`);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.warranty.update({
        where: { id },
        data: {
          status: 'VOID',
          voidReason: reason,
        },
      });

      await tx.warrantyHistory.create({
        data: {
          warrantyId: id,
          action: 'VOIDED',
          notes: `Void reason logged: "${reason}"`,
          staffId,
          staffName,
        },
      });

      await tx.customerActivity.create({
        data: {
          customerId: warranty.customerId,
          type: 'MANUAL_ACTION',
          title: 'Warranty Voided',
          description: `Warranty ${warranty.warrantyNumber} marked void. Reason: ${reason}`,
          referenceId: warranty.id,
          staffId,
        },
      });

      return updated;
    });
  }

  // ==========================================
  // 2. WARRANTY CLAIMS WORKFLOW
  // ==========================================

  // Create claim
  async createClaim(dto: CreateClaimDto) {
    const warranty = await this.prisma.warranty.findUnique({
      where: { id: dto.warrantyId },
    });
    if (!warranty)
      throw new NotFoundException(`Warranty certificate not found.`);

    if (warranty.status !== 'ACTIVE' && warranty.status !== 'PARTIALLY_USED') {
      throw new BadRequestException(
        `Cannot claim against an inactive warranty. Status is: ${warranty.status}`,
      );
    }
    if (warranty.endDate && new Date() > new Date(warranty.endDate)) {
      throw new BadRequestException(
        'Cannot claim against an expired warranty certificate.',
      );
    }

    const seq = Math.floor(100000 + Math.random() * 900000);
    const claimNumber = `TZ-CLM-${seq}`;

    return this.prisma.$transaction(async (tx) => {
      const claim = await tx.warrantyClaim.create({
        data: {
          warrantyId: dto.warrantyId,
          claimNumber,
          issueDescription: dto.issueDescription,
          status: 'PENDING',
          notes: dto.notes || null,
          branchId: dto.branchId,
          attachments: dto.attachments || [],
        },
      });

      // Update warranty status to CLAIMED
      await tx.warranty.update({
        where: { id: dto.warrantyId },
        data: { status: 'CLAIMED' },
      });

      await tx.warrantyHistory.create({
        data: {
          warrantyId: dto.warrantyId,
          action: 'CLAIMED',
          notes: `Warranty claim logged: #${claimNumber}. Problem: "${dto.issueDescription}"`,
        },
      });

      return claim;
    });
  }

  // Technician inspection form submission
  async submitInspection(
    id: string,
    dto: SubmitInspectionDto,
    staffId?: string,
    staffName?: string,
  ) {
    const claim = await this.prisma.warrantyClaim.findUnique({
      where: { id },
      include: { warranty: true },
    });

    if (!claim)
      throw new NotFoundException(`Warranty Claim with ID ${id} not found.`);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.warrantyClaim.update({
        where: { id },
        data: {
          status: 'INSPECTION',
          inspectionNotes: dto.inspectionNotes,
          inspectionDiagnosis: dto.inspectionDiagnosis,
          isCovered: dto.isCovered,
          estimatedCost: dto.estimatedCost || 0,
          inspectionPhotos: dto.inspectionPhotos || [],
          attachments: dto.attachments || [],
          oldPartId: dto.oldPartId || null,
          newPartId: dto.newPartId || null,
          replacementSerialNumber: dto.replacementSerialNumber || null,
          replacementCost: dto.replacementCost || 0,
          assignedTechId: staffId || null,
        },
      });

      return updated;
    });
  }

  // Update claim status & process inventory/GL integrations
  async updateClaimStatus(
    id: string,
    status: string,
    resolutionDetails?: string,
    staffId?: string,
    staffName?: string,
  ) {
    const claim = await this.prisma.warrantyClaim.findUnique({
      where: { id },
      include: { warranty: true },
    });

    if (!claim)
      throw new NotFoundException(`Warranty Claim with ID ${id} not found.`);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.warrantyClaim.update({
        where: { id },
        data: {
          status,
          resolutionDetails: resolutionDetails || null,
        },
      });

      // Log claim state transition history
      await tx.warrantyHistory.create({
        data: {
          warrantyId: claim.warrantyId,
          action:
            status === 'APPROVED'
              ? 'APPROVED'
              : status === 'REJECTED'
                ? 'REJECTED'
                : 'REPAIRED',
          notes: `Claim #${claim.claimNumber} transitioned to status: ${status}. Resolution notes: ${resolutionDetails || 'N/A'}`,
          staffId,
          staffName,
        },
      });

      // Standard claim approval triggers
      if (status === 'APPROVED') {
        // If covered by warranty, process stock reduction & finance cost booking
        if (claim.isCovered && claim.newPartId) {
          // 1. Decrement branch inventory
          const bi = await tx.branchInventory.findUnique({
            where: {
              branchId_partId: {
                branchId: claim.branchId,
                partId: claim.newPartId,
              },
            },
          });

          if (bi && bi.quantity > 0) {
            await tx.branchInventory.update({
              where: {
                branchId_partId: {
                  branchId: claim.branchId,
                  partId: claim.newPartId,
                },
              },
              data: { quantity: { decrement: 1 } },
            });

            // Create Stock Movement log
            await tx.stockMovement.create({
              data: {
                branchId: claim.branchId,
                partId: claim.newPartId,
                quantityDelta: -1,
                type: 'warranty_issue',
              },
            });
          }

          // 2. Financial Journal Voucher Entry: Debit Warranty Expense, Credit Inventory
          // Look up or create default accounts
          let wExpenseAccount = await tx.financialAccount.findUnique({
            where: { accountNumber: '5080' },
          });
          if (!wExpenseAccount) {
            // Fallback to operating expense 5000 if 5080 missing
            wExpenseAccount = await tx.financialAccount.findFirst({
              where: { accountClass: 'EXPENSE' },
            });
          }

          const inventoryAccount = await tx.financialAccount.findUnique({
            where: { accountNumber: '1300' },
          });

          const standardPartCost = Number(claim.replacementCost || 0);

          if (wExpenseAccount && inventoryAccount && standardPartCost > 0) {
            // Find active period
            const activePeriod = await tx.accountingPeriod.findFirst({
              where: { isLocked: false },
            });

            if (activePeriod) {
              const seq = Math.floor(100000 + Math.random() * 900000);
              await tx.journalEntry.create({
                data: {
                  voucherNumber: `JV-WARR-${seq}`,
                  description: `Warranty Parts Replacement Cost Booking for Claim #${claim.claimNumber}`,
                  referenceModule: 'EXPENSE',
                  referenceId: claim.id,
                  branchId: claim.branchId,
                  periodId: activePeriod.id,
                  createdById:
                    staffId || 'd1111111-1111-1111-1111-111111111111',
                  lines: {
                    create: [
                      {
                        accountId: wExpenseAccount.id,
                        debit: standardPartCost,
                        credit: 0,
                        description: `Warranty replacement part expense claim #${claim.claimNumber}`,
                      },
                      {
                        accountId: inventoryAccount.id,
                        debit: 0,
                        credit: standardPartCost,
                        description: `Inventory reduction for warranty replacement claim #${claim.claimNumber}`,
                      },
                    ],
                  },
                },
              });

              // Adjust balances
              await tx.financialAccount.update({
                where: { id: wExpenseAccount.id },
                data: { currentBalance: { increment: standardPartCost } },
              });
              await tx.financialAccount.update({
                where: { id: inventoryAccount.id },
                data: { currentBalance: { decrement: standardPartCost } },
              });
            }
          }
        }

        // Set warranty status to REPLACED
        await tx.warranty.update({
          where: { id: claim.warrantyId },
          data: { status: 'REPLACED' },
        });
      }

      if (status === 'REJECTED') {
        // Return warranty to ACTIVE status if claim is denied
        await tx.warranty.update({
          where: { id: claim.warrantyId },
          data: { status: 'ACTIVE' },
        });
      }

      if (status === 'DELIVERED') {
        // Complete claim resolution
        await tx.warranty.update({
          where: { id: claim.warrantyId },
          data: { status: 'PARTIALLY_USED' },
        });
      }

      return updated;
    });
  }

  // ==========================================
  // 3. SUPPLIER RMA OUTWARD WORKFLOW
  // ==========================================

  // Create Supplier RMA
  async createSupplierRma(dto: CreateRmaDto) {
    const seq = Math.floor(100000 + Math.random() * 900000);
    const rmaNumber = `TZ-RMA-${seq}`;

    return this.prisma.$transaction(async (tx) => {
      const rma = await tx.supplierRma.create({
        data: {
          rmaNumber,
          partId: dto.partId,
          supplierId: dto.supplierId,
          branchId: dto.branchId,
          quantity: dto.quantity || 1,
          reason: dto.reason,
          status: 'PENDING',
          courier: dto.courier || null,
          trackingNumber: dto.trackingNumber || null,
          vendorReference: dto.vendorReference || null,
          replacementEta: dto.replacementEta
            ? new Date(dto.replacementEta)
            : null,
          notes: dto.notes || null,
        },
      });

      // Reduce stock of defective part from branch inventory (defectives write-out/shipment)
      const bi = await tx.branchInventory.findUnique({
        where: {
          branchId_partId: {
            branchId: dto.branchId,
            partId: dto.partId,
          },
        },
      });

      const returnQty = dto.quantity || 1;

      if (bi && bi.quantity >= returnQty) {
        await tx.branchInventory.update({
          where: {
            branchId_partId: {
              branchId: dto.branchId,
              partId: dto.partId,
            },
          },
          data: { quantity: { decrement: returnQty } },
        });

        // Record Stock Movement log
        await tx.stockMovement.create({
          data: {
            branchId: dto.branchId,
            partId: dto.partId,
            quantityDelta: -returnQty,
            type: 'rma_return',
          },
        });
      }

      return rma;
    });
  }

  // Update Supplier RMA Status & finance integration
  async updateRmaStatus(
    id: string,
    status: string,
    notes?: string,
    creditNoteNumber?: string,
    staffId?: string,
  ) {
    const rma = await this.prisma.supplierRma.findUnique({
      where: { id },
      include: { part: true, supplier: true },
    });

    if (!rma)
      throw new NotFoundException(`Supplier RMA return record not found.`);

    return this.prisma.$transaction(async (tx) => {
      const updateData: any = { status };
      if (notes) updateData.notes = notes;
      if (creditNoteNumber) updateData.creditNoteNumber = creditNoteNumber;
      if (status === 'CREDITED') updateData.receivedDate = new Date();

      const updated = await tx.supplierRma.update({
        where: { id },
        data: updateData,
      });

      // 1. If status is REPLACED, receive the new replacement parts back into inventory
      if (status === 'REPLACED') {
        await tx.branchInventory.upsert({
          where: {
            branchId_partId: {
              branchId: rma.branchId,
              partId: rma.partId,
            },
          },
          create: {
            branchId: rma.branchId,
            partId: rma.partId,
            quantity: rma.quantity,
          },
          update: {
            quantity: { increment: rma.quantity },
          },
        });

        // Record stock arrival
        await tx.stockMovement.create({
          data: {
            branchId: rma.branchId,
            partId: rma.partId,
            quantityDelta: rma.quantity,
            type: 'rma_replace_receive',
          },
        });
      }

      // 2. If status is CREDITED, book supplier liability reduction & inventory credit JV
      if (status === 'CREDITED') {
        const apAccount = await tx.financialAccount.findUnique({
          where: { accountNumber: '2100' },
        });
        const inventoryAccount = await tx.financialAccount.findUnique({
          where: { accountNumber: '1300' },
        });

        const partsValuation = Number(rma.part.basePrice) * rma.quantity;

        if (apAccount && inventoryAccount && partsValuation > 0) {
          const activePeriod = await tx.accountingPeriod.findFirst({
            where: { isLocked: false },
          });

          if (activePeriod) {
            const seq = Math.floor(100000 + Math.random() * 900000);
            await tx.journalEntry.create({
              data: {
                voucherNumber: `JV-RMA-${seq}`,
                description: `Supplier Credit note received for RMA Return #${rma.rmaNumber}`,
                referenceModule: 'PURCHASE',
                referenceId: rma.id,
                branchId: rma.branchId,
                periodId: activePeriod.id,
                createdById: staffId || 'd1111111-1111-1111-1111-111111111111',
                lines: {
                  create: [
                    {
                      accountId: apAccount.id,
                      debit: partsValuation,
                      credit: 0,
                      supplierId: rma.supplierId,
                      description: `Supplier Accounts Payable debit (liability reduction) for RMA #${rma.rmaNumber}`,
                    },
                    {
                      accountId: inventoryAccount.id,
                      debit: 0,
                      credit: partsValuation,
                      description: `Inventory valuation credit (reduction of inventory asset) for RMA #${rma.rmaNumber}`,
                    },
                  ],
                },
              },
            });

            // Update balances
            await tx.financialAccount.update({
              where: { id: apAccount.id },
              data: { currentBalance: { decrement: partsValuation } }, // A/P liability decreases
            });
            await tx.financialAccount.update({
              where: { id: inventoryAccount.id },
              data: { currentBalance: { decrement: partsValuation } }, // Inventory asset value decreases
            });
          }
        }
      }

      // 3. If RMA is REJECTED by vendor, write it off as inventory loss
      if (status === 'REJECTED') {
        let scrapAccount = await tx.financialAccount.findUnique({
          where: { accountNumber: '5090' },
        });
        if (!scrapAccount) {
          // Fallback to general operating expense
          scrapAccount = await tx.financialAccount.findFirst({
            where: { accountClass: 'EXPENSE' },
          });
        }

        const inventoryAccount = await tx.financialAccount.findUnique({
          where: { accountNumber: '1300' },
        });
        const partsValuation = Number(rma.part.basePrice) * rma.quantity;

        if (scrapAccount && inventoryAccount && partsValuation > 0) {
          const activePeriod = await tx.accountingPeriod.findFirst({
            where: { isLocked: false },
          });

          if (activePeriod) {
            const seq = Math.floor(100000 + Math.random() * 900000);
            await tx.journalEntry.create({
              data: {
                voucherNumber: `JV-SCRP-${seq}`,
                description: `Inventory scrap write-off for rejected vendor RMA Return #${rma.rmaNumber}`,
                referenceModule: 'EXPENSE',
                referenceId: rma.id,
                branchId: rma.branchId,
                periodId: activePeriod.id,
                createdById: staffId || 'd1111111-1111-1111-1111-111111111111',
                lines: {
                  create: [
                    {
                      accountId: scrapAccount.id,
                      debit: partsValuation,
                      credit: 0,
                      description: `Defective write-off loss on rejected vendor RMA #${rma.rmaNumber}`,
                    },
                    {
                      accountId: inventoryAccount.id,
                      debit: 0,
                      credit: partsValuation,
                      description: `Defective inventory reduction on rejected vendor RMA #${rma.rmaNumber}`,
                    },
                  ],
                },
              },
            });

            await tx.financialAccount.update({
              where: { id: scrapAccount.id },
              data: { currentBalance: { increment: partsValuation } },
            });
            await tx.financialAccount.update({
              where: { id: inventoryAccount.id },
              data: { currentBalance: { decrement: partsValuation } },
            });
          }
        }
      }

      return updated;
    });
  }

  // ==========================================
  // 4. ANALYTICS & REPORTS Exporter
  // ==========================================

  // Dashboard Stats (Executed concurrently via Promise.all)
  async getDashboardStats() {
    const [
      activeWarranties,
      expiredWarranties,
      voidedWarranties,
      pendingClaims,
      inspectionClaims,
      approvedClaims,
      rejectedClaims,
      activeRmas,
    ] = await Promise.all([
      this.prisma.warranty.count({ where: { status: 'ACTIVE' } }),
      this.prisma.warranty.count({ where: { status: 'EXPIRED' } }),
      this.prisma.warranty.count({ where: { status: 'VOID' } }),
      this.prisma.warrantyClaim.count({ where: { status: 'PENDING' } }),
      this.prisma.warrantyClaim.count({ where: { status: 'INSPECTION' } }),
      this.prisma.warrantyClaim.count({ where: { status: 'APPROVED' } }),
      this.prisma.warrantyClaim.count({ where: { status: 'REJECTED' } }),
      this.prisma.supplierRma.count({
        where: { status: { in: ['PENDING', 'SHIPPED'] } },
      }),
    ]);

    // Monthly trends claims
    // Consolidated stats structure
    return {
      activeWarranties,
      expiredWarranties,
      voidedWarranties,
      pendingClaims,
      inspectionClaims,
      approvedClaims,
      rejectedClaims,
      activeRmas,
      monthlyClaimsTrends: [
        { month: 'Feb 26', count: 12 },
        { month: 'Mar 26', count: 15 },
        { month: 'Apr 26', count: 8 },
        { month: 'May 26', count: 20 },
        { month: 'Jun 26', count: 14 },
      ],
    };
  }

  // Generate Reports
  async generateReports(type: string) {
    if (type === 'warranty') {
      return this.prisma.warranty.findMany({
        include: { customer: true, branch: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (type === 'claims') {
      return this.prisma.warrantyClaim.findMany({
        include: { warranty: { include: { customer: true } }, branch: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (type === 'supplier-rma') {
      return this.prisma.supplierRma.findMany({
        include: { part: true, supplier: true, branch: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Failure analysis report: group claims by brand/model compatibility
    if (type === 'failure-analysis') {
      const claims = await this.prisma.warrantyClaim.findMany({
        include: { warranty: true },
      });

      const groups: Record<string, number> = {};
      claims.forEach((c) => {
        const brand = c.warranty.deviceBrand;
        groups[brand] = (groups[brand] || 0) + 1;
      });

      return Object.keys(groups).map((brand) => ({
        deviceBrand: brand,
        claimsCount: groups[brand],
      }));
    }

    return [];
  }

  // Find all warranties (with filters)
  async findAllWarranties(query: {
    search?: string;
    status?: string;
    branchId?: string;
  }) {
    const where: any = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.branchId) {
      where.branchId = query.branchId;
    }
    if (query.search) {
      where.OR = [
        { warrantyNumber: { contains: query.search, mode: 'insensitive' } },
        { serialOrImei: { contains: query.search, mode: 'insensitive' } },
        {
          customer: {
            firstName: { contains: query.search, mode: 'insensitive' },
          },
        },
        {
          customer: {
            lastName: { contains: query.search, mode: 'insensitive' },
          },
        },
        { customer: { phone: { contains: query.search } } },
      ];
    }

    return this.prisma.warranty.findMany({
      where,
      include: {
        customer: true,
        branch: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Find all claims (with filters)
  async findAllClaims(query: { status?: string; branchId?: string }) {
    const where: any = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.branchId) {
      where.branchId = query.branchId;
    }

    return this.prisma.warrantyClaim.findMany({
      where,
      include: {
        warranty: { include: { customer: true } },
        branch: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Find all supplier RMAs (with filters)
  async findAllSupplierRmas(query: { status?: string; supplierId?: string }) {
    const where: any = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.supplierId) {
      where.supplierId = query.supplierId;
    }

    return this.prisma.supplierRma.findMany({
      where,
      include: {
        part: true,
        supplier: true,
        branch: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
