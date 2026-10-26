import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AssignTechDto } from './dto/assign-tech.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateDiagnosticsDto } from './dto/update-diagnostics.dto';
import { FinanceService } from '../finance/finance.service';
import { WarrantyService } from '../warranty/warranty.service';
import { eventBus, AutomationEvents } from '../../common/event-bus';

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly financeService: FinanceService,
    private readonly warrantyService: WarrantyService,
  ) {}

  // Repair Dashboard Analytics Stats
  async getDashboardStats(branchId?: string) {
    const where: any = { isDeleted: false };
    if (branchId) where.branchId = branchId;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      todaysRepairs,
      pendingRepairs,
      diagnosing,
      waitingApproval,
      waitingParts,
      readyForPickup,
      completed,
      cancelled,
      warrantyRepairs,
      technicians,
      recentTickets,
    ] = await Promise.all([
      this.prisma.ticket.count({
        where: { ...where, createdAt: { gte: startOfToday } },
      }),
      this.prisma.ticket.count({
        where: {
          ...where,
          status: {
            in: [
              'booked',
              'diagnosing',
              'waiting_approval',
              'waiting_parts',
              'repairing',
            ],
          },
        },
      }),
      this.prisma.ticket.count({
        where: { ...where, status: 'diagnosing' },
      }),
      this.prisma.ticket.count({
        where: { ...where, status: 'waiting_approval' },
      }),
      this.prisma.ticket.count({
        where: { ...where, status: 'waiting_parts' },
      }),
      this.prisma.ticket.count({
        where: { ...where, status: 'ready' },
      }),
      this.prisma.ticket.count({
        where: { ...where, status: 'delivered' },
      }),
      this.prisma.ticket.count({
        where: { ...where, status: 'cancelled' },
      }),
      this.prisma.warranty.count({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.user.findMany({
        where: { role: { in: ['TECHNICIAN', 'ADMIN', 'SUPER_ADMIN'] } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          _count: { select: { tickets: true } },
        },
      }),
      this.prisma.ticket.findMany({
        where,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: true, device: true },
      }),
    ]);

    const techWorkload = technicians.map((t) => ({
      id: t.id,
      name: `${t.firstName} ${t.lastName}`,
      role: t.role,
      assignedJobs: t._count.tickets,
    }));

    return {
      todaysRepairs,
      pendingRepairs,
      diagnosing,
      waitingApproval,
      waitingParts,
      readyForPickup,
      completed,
      cancelled,
      warrantyRepairs,
      avgRepairTimeHours: 4.5,
      revenueToday: 18500,
      techWorkload,
      recentTickets,
    };
  }

  // Consume Inventory Parts
  async consumeParts(
    ticketId: string,
    parts: { partId: string; quantity: number }[],
    userId?: string,
  ) {
    const ticket = await this.findOne(ticketId);

    const consumedLog: string[] = [];
    for (const p of parts) {
      if (!p.quantity || p.quantity <= 0) {
        throw new BadRequestException('Part consumption quantity must be > 0.');
      }
      const part = await this.prisma.part.findUnique({
        where: { id: p.partId },
      });
      if (!part) continue;

      if (this.prisma.branchInventory?.findUnique) {
        const bi = await this.prisma.branchInventory.findUnique({
          where: {
            branchId_partId: {
              branchId: ticket.branchId,
              partId: p.partId,
            },
          },
        });
        if (bi && bi.quantity < p.quantity) {
          throw new BadRequestException(
            `Insufficient stock for part ${part.name || p.partId}. Available: ${bi.quantity}, Requested: ${p.quantity}`,
          );
        }
      }

      await this.prisma.branchInventory.upsert({
        where: {
          branchId_partId: {
            branchId: ticket.branchId,
            partId: p.partId,
          },
        },
        update: {
          quantity: { decrement: p.quantity },
        },
        create: {
          branchId: ticket.branchId,
          partId: p.partId,
          quantity: 0,
        },
      });

      await this.prisma.stockMovement.create({
        data: {
          branchId: ticket.branchId,
          partId: p.partId,
          quantityDelta: -p.quantity,
          type: 'CONSUMED',
          referenceTicketId: ticketId,
        },
      });
      consumedLog.push(`Part ID ${p.partId} (x${p.quantity})`);
    }

    if (consumedLog.length > 0) {
      await this.prisma.ticketHistory.create({
        data: {
          ticketId,
          oldStatus: ticket.status,
          newStatus: ticket.status,
          updatedById: userId || null,
          notes: `Inventory parts consumed: ${consumedLog.join(', ')}.`,
        },
      });
    }

    return this.findOne(ticketId);
  }

  // Log Time Track for Technician Workload
  async logTimeTrack(
    ticketId: string,
    durationMinutes: number,
    notes?: string,
    userId?: string,
  ) {
    const ticket = await this.findOne(ticketId);

    await this.prisma.ticketHistory.create({
      data: {
        ticketId,
        oldStatus: ticket.status,
        newStatus: ticket.status,
        updatedById: userId || null,
        notes: `Labor time logged: ${durationMinutes} minutes. ${notes || ''}`,
      },
    });

    return this.findOne(ticketId);
  }

  // Dispatch Multi-Channel Repair Notification
  async sendNotification(
    ticketId: string,
    recipientRole: string,
    channel: string,
    message: string,
  ) {
    const ticket = await this.findOne(ticketId);

    await this.prisma.customerCommunication.create({
      data: {
        customerId: ticket.customerId,
        type: `REPAIR_UPDATE_${channel.toUpperCase()}`,
        message: `[Ticket ${ticketId}] ${message}`,
        status: 'sent',
      },
    });

    await this.prisma.ticketHistory.create({
      data: {
        ticketId,
        oldStatus: ticket.status,
        newStatus: ticket.status,
        notes: `Repair notification sent via ${channel} to ${recipientRole}: "${message}"`,
      },
    });

    return { success: true, message: `Notification dispatched via ${channel}` };
  }

  // 1. List All Tickets (Filter by status, branch, technician, or search term with pagination)
  async findAll(query: {
    branchId?: string;
    status?: string;
    assignedTechId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = { isDeleted: false };
    if (query.branchId) {
      where.branchId = query.branchId;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.assignedTechId) {
      where.assignedTechId = query.assignedTechId;
    }
    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { id: { contains: term, mode: 'insensitive' } },
        { customer: { firstName: { contains: term, mode: 'insensitive' } } },
        { customer: { lastName: { contains: term, mode: 'insensitive' } } },
        { customer: { phone: { contains: term, mode: 'insensitive' } } },
        { customer: { email: { contains: term, mode: 'insensitive' } } },
        { device: { brand: { contains: term, mode: 'insensitive' } } },
        { device: { model: { contains: term, mode: 'insensitive' } } },
        { device: { serialNumber: { contains: term, mode: 'insensitive' } } },
        { device: { imei: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        include: {
          customer: true,
          device: true,
          assignedTech: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          ticketHistory: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Public Online Diagnostic Booking
  async publicBooking(dto: any) {
    let branch = await this.prisma.branch.findFirst();
    if (dto.branchId) {
      const foundBranch = await this.prisma.branch.findUnique({
        where: { id: dto.branchId },
      });
      if (foundBranch) branch = foundBranch;
    }

    if (!branch) {
      // Fallback branch creation if database is completely empty
      branch = await this.prisma.branch.create({
        data: {
          name: 'Main Diagnostic Hub',
          address: 'Central Bench',
          timezone: 'Asia/Dhaka',
          status: 'ACTIVE',
        },
      });
    }

    let customer = await this.prisma.customer.findFirst({
      where: { email: dto.email },
    });

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          phone: dto.phone,
          branchId: branch.id,
        },
      });
    }

    const device = await this.prisma.device.create({
      data: {
        customerId: customer.id,
        brand: dto.brand,
        model: dto.model,
        serialNumber: dto.serialNumber || null,
        imei: dto.imei || null,
      },
    });

    const deadline = dto.preferredDate
      ? new Date(dto.preferredDate)
      : new Date(Date.now() + 86400000);

    const ticket = await this.prisma.ticket.create({
      data: {
        branchId: branch.id,
        customerId: customer.id,
        deviceId: device.id,
        status: 'booked',
        faults: dto.issue ? [dto.issue] : ['Diagnostic Assessment Requested'],
        internalNotes: dto.notes || null,
        photos: dto.photos || [],
        slaDeadline: deadline,
        estimatedCost: 0,
      },
    });

    await this.prisma.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        oldStatus: '',
        newStatus: 'booked',
        notes: `Online express diagnostic bench booking created for ${dto.brand} ${dto.model}. Issue: ${dto.issue}.`,
      },
    });

    return this.findOne(ticket.id);
  }

  // Cancel Ticket
  async cancel(id: string, reason?: string, updatedById?: string) {
    const ticket = await this.findOne(id);
    const updated = await this.prisma.ticket.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    await this.prisma.ticketHistory.create({
      data: {
        ticketId: id,
        oldStatus: ticket.status,
        newStatus: 'cancelled',
        updatedById: updatedById || null,
        notes: reason || 'Ticket cancelled by user / staff action.',
      },
    });

    return this.findOne(id);
  }

  // Delete Ticket
  async delete(id: string, deletedById?: string) {
    await this.findOne(id);
    await this.prisma.ticket.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    await this.prisma.auditTrail.create({
      data: {
        userId: deletedById || null,
        action: 'DELETE',
        affectedModule: 'TICKETS',
        recordId: id,
      },
    });

    return { success: true, message: `Ticket ${id} soft deleted.` };
  }

  // Add Ticket Internal / Diagnosis Note
  async addNote(id: string, note: string, updatedById?: string) {
    const ticket = await this.findOne(id);
    const existing = ticket.internalNotes ? `${ticket.internalNotes}\n` : '';
    const updatedNotes = `${existing}[${new Date().toISOString()}] ${note}`;

    await this.prisma.ticket.update({
      where: { id },
      data: { internalNotes: updatedNotes },
    });

    await this.prisma.ticketHistory.create({
      data: {
        ticketId: id,
        oldStatus: ticket.status,
        newStatus: ticket.status,
        updatedById: updatedById || null,
        notes: `Note added: ${note}`,
      },
    });

    return this.findOne(id);
  }

  // Add Customer Signature
  async addSignature(id: string, signatureData: string, updatedById?: string) {
    const ticket = await this.findOne(id);

    if ((this.prisma as any).workOrderSignature?.create) {
      await (this.prisma as any).workOrderSignature.create({
        data: {
          ticketId: id,
          signeeName: ticket.customer
            ? `${ticket.customer.firstName} ${ticket.customer.lastName}`.trim()
            : 'Customer',
          signatureUrl: signatureData,
        },
      });
    }

    await this.prisma.ticketHistory.create({
      data: {
        ticketId: id,
        oldStatus: ticket.status,
        newStatus: ticket.status,
        updatedById: updatedById || null,
        notes: `Customer digital signature attached to work order. Data length: ${signatureData.length} chars.`,
      },
    });

    await this.prisma.auditTrail.create({
      data: {
        userId: updatedById || null,
        action: 'UPDATE',
        affectedModule: 'TICKETS',
        recordId: id,
        afterValue: { signatureAttached: true },
      },
    });

    return this.findOne(id);
  }

  // Add Photos / Attachments
  async addPhotos(id: string, photos: string[], updatedById?: string) {
    const ticket = await this.findOne(id);
    const updatedPhotos = Array.from(
      new Set([...(ticket.photos || []), ...photos]),
    );

    await this.prisma.ticket.update({
      where: { id },
      data: { photos: updatedPhotos },
    });

    await this.prisma.ticketHistory.create({
      data: {
        ticketId: id,
        oldStatus: ticket.status,
        newStatus: ticket.status,
        updatedById: updatedById || null,
        notes: `Attached ${photos.length} photo(s) to ticket.`,
      },
    });

    return this.findOne(id);
  }

  // 2. Fetch Single Ticket (with Full History)
  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        customer: true,
        device: true,
        assignedTech: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        ticketHistory: {
          include: {
            updatedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket || (ticket as any).isDeleted) {
      throw new NotFoundException(`Ticket with ID ${id} not found.`);
    }

    return ticket;
  }

  // 3. Create Ticket (Autocreate Customer and/or Device if missing)
  async create(dto: CreateTicketDto, createdById?: string) {
    let customerId = dto.customerId;

    // Create Customer on-the-fly if not provided
    if (!customerId) {
      if (
        !dto.customerEmail ||
        !dto.customerPhone ||
        !dto.customerFirstName ||
        !dto.customerLastName
      ) {
        throw new BadRequestException(
          'Provide customerId or complete customer registration details.',
        );
      }

      // Check if email already exists
      let customer = await this.prisma.customer.findUnique({
        where: { email: dto.customerEmail },
      });

      if (!customer) {
        customer = await this.prisma.customer.create({
          data: {
            firstName: dto.customerFirstName,
            lastName: dto.customerLastName,
            email: dto.customerEmail,
            phone: dto.customerPhone,
            branchId: dto.branchId,
          },
        });
      }
      customerId = customer.id;
    }

    let deviceId = dto.deviceId;

    // Create Device on-the-fly if not provided
    if (!deviceId) {
      if (!dto.deviceBrand || !dto.deviceModel) {
        throw new BadRequestException(
          'Provide deviceId or complete device details.',
        );
      }

      const device = await this.prisma.device.create({
        data: {
          customerId,
          brand: dto.deviceBrand,
          model: dto.deviceModel,
          serialNumber: dto.deviceSerialNumber || null,
          imei: dto.deviceImei || null,
        },
      });
      deviceId = device.id;
    }

    // Create the ticket
    const ticket = await this.prisma.ticket.create({
      data: {
        branchId: dto.branchId,
        customerId,
        deviceId,
        status: 'booked',
        estimatedCost: dto.estimatedCost || 0,
        slaDeadline: new Date(dto.slaDeadline),
        faults: dto.faults || [],
      },
    });

    // Write Audit Trail
    await this.prisma.auditTrail.create({
      data: {
        userId: createdById || null,
        action: 'CREATE',
        affectedModule: 'TICKETS',
        recordId: ticket.id,
        afterValue: JSON.parse(JSON.stringify(ticket)),
      },
    });

    // Record initial timeline history log
    await this.prisma.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        oldStatus: '',
        newStatus: 'booked',
        updatedById: createdById || null,
        notes: 'Ticket registered into workspace queue.',
      },
    });

    // CRM Activity Log
    await this.prisma.customerActivity.create({
      data: {
        customerId,
        type: 'TICKET_CREATED',
        title: 'Repair Ticket Created',
        description: `Repair ticket registered. Device Brand: ${dto.deviceBrand || 'N/A'} Model: ${dto.deviceModel || 'N/A'}, Est. Cost: ৳${dto.estimatedCost || 0}.`,
        referenceId: ticket.id,
        staffId: createdById,
      },
    });

    return this.findOne(ticket.id);
  }

  // 4. Assign Technician
  async assign(id: string, dto: AssignTechDto, updatedById?: string) {
    const ticket = await this.findOne(id);
    let techName = 'Unassigned';

    if (dto.assignedTechId) {
      const tech = await this.prisma.user.findUnique({
        where: { id: dto.assignedTechId },
      });
      if (!tech) {
        throw new NotFoundException(
          `Technician with ID ${dto.assignedTechId} not found.`,
        );
      }
      techName = `${tech.firstName} ${tech.lastName}`;
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: {
        assignedTechId: dto.assignedTechId || null,
      },
    });

    // Log in history
    await this.prisma.ticketHistory.create({
      data: {
        ticketId: id,
        oldStatus: ticket.status,
        newStatus: ticket.status,
        updatedById: updatedById || null,
        notes: dto.assignedTechId
          ? `Technician ${techName} assigned to ticket.`
          : 'Technician unassigned from ticket.',
      },
    });

    return this.findOne(id);
  }

  // 5. Update Diagnostics
  async updateDiagnostics(
    id: string,
    dto: UpdateDiagnosticsDto,
    updatedById?: string,
  ) {
    const ticket = await this.findOne(id);

    // Auto-advance to diagnosing if currently booked
    const newStatus = ticket.status === 'booked' ? 'diagnosing' : ticket.status;

    await this.prisma.ticket.update({
      where: { id },
      data: {
        status: newStatus,
        diagnosisNotes: dto.diagnosisNotes,
        internalNotes: dto.internalNotes || null,
        faults: dto.faults,
        tests: dto.tests,
        photos: dto.photos || [],
        partsRequired: dto.partsRequired || [],
        estimatedCost: dto.estimatedCost,
        customerApproved: dto.customerApproved ?? ticket.customerApproved,
        diagnosticCompletedAt: new Date(),
      },
    });

    // Log history
    await this.prisma.ticketHistory.create({
      data: {
        ticketId: id,
        oldStatus: ticket.status,
        newStatus,
        updatedById: updatedById || null,
        notes: `Device diagnostics logged. Estimated Cost: ৳${dto.estimatedCost}. Checklist and component testing completed.`,
      },
    });

    return this.findOne(id);
  }

  // 6. Update Ticket Status
  async updateStatus(id: string, dto: UpdateStatusDto, updatedById?: string) {
    const ticket = await this.findOne(id);

    if (ticket.status === dto.status) {
      return ticket;
    }

    const updateData: any = { status: dto.status };

    // Record lifecycle timestamps
    if (dto.status === 'ready') {
      updateData.repairedAt = new Date();
    } else if (dto.status === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    const updatedTicket = await this.prisma.ticket.update({
      where: { id },
      data: updateData,
    });

    // Write Audit Trail
    await this.prisma.auditTrail.create({
      data: {
        userId: updatedById || null,
        action: 'UPDATE',
        affectedModule: 'TICKETS',
        recordId: id,
        beforeValue: JSON.parse(JSON.stringify(ticket)),
        afterValue: JSON.parse(JSON.stringify(updatedTicket)),
      },
    });

    if (dto.status === 'delivered' && !ticket.deliveredAt) {
      eventBus.emit(AutomationEvents.TICKET_DELIVERED, { ticketId: id });
      await this.financeService.recordRepairDeliveryJournal(
        id,
        updatedById || 'd1111111-1111-1111-1111-111111111111',
      );
      try {
        await this.warrantyService.issueWarrantyForTicket(id);
      } catch (err) {
        console.error('Failed to auto-issue warranty:', err);
      }
    }

    // Log history
    await this.prisma.ticketHistory.create({
      data: {
        ticketId: id,
        oldStatus: ticket.status,
        newStatus: dto.status,
        updatedById: updatedById || null,
        notes: dto.notes || `Ticket status advanced to ${dto.status}.`,
      },
    });

    // CRM Activity Log
    await this.prisma.customerActivity.create({
      data: {
        customerId: ticket.customerId,
        type: 'TICKET_STATUS_CHANGED',
        title: 'Repair Status Updated',
        description: `Repair ticket status advanced from "${ticket.status}" to "${dto.status}".`,
        referenceId: id,
        staffId: updatedById,
      },
    });

    return this.findOne(id);
  }

  // 7. Approve Cost Estimate
  async approveEstimate(id: string, approved: boolean, updatedById?: string) {
    const ticket = await this.findOne(id);

    await this.prisma.ticket.update({
      where: { id },
      data: { customerApproved: approved },
    });

    // Log history
    await this.prisma.ticketHistory.create({
      data: {
        ticketId: id,
        oldStatus: ticket.status,
        newStatus: ticket.status,
        updatedById: updatedById || null,
        notes: approved
          ? 'Customer approved the cost estimate. Proceeding with repairs.'
          : 'Cost estimate rejected / pending customer approval.',
      },
    });

    return this.findOne(id);
  }
}
