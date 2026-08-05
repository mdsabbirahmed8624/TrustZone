import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  // Dashboard Stats
  async getDashboardStats(branchId?: string) {
    const where: any = { isDeleted: false };
    if (branchId) where.branchId = branchId;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000);

    const [
      totalCustomers,
      todayNewCustomers,
      vipCustomers,
      totalDevices,
      activeWarranties,
      recentCustomers,
      recentActivities,
      thisMonthCount,
      lastMonthCount,
      customersWithDevices,
    ] = await Promise.all([
      this.prisma.customer.count({ where }),
      this.prisma.customer.count({
        where: { ...where, createdAt: { gte: startOfToday } },
      }),
      this.prisma.customer.count({
        where: { ...where, tags: { has: 'VIP' } },
      }),
      this.prisma.device.count(),
      this.prisma.warranty.count({ where: { status: 'ACTIVE' } }),
      this.prisma.customer.findMany({
        where,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          devices: true,
          tickets: { select: { id: true, status: true } },
        },
      }),
      this.prisma.customerActivity.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.customer.count({
        where: { ...where, createdAt: { gte: thirtyDaysAgo } },
      }),
      this.prisma.customer.count({
        where: {
          ...where,
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
      this.prisma.customer.findMany({
        where,
        select: {
          id: true,
          _count: { select: { tickets: true, devices: true } },
        },
      }),
    ]);

    const returningCustomers = customersWithDevices.filter(
      (c) => c._count.tickets > 1 || c._count.devices > 1,
    ).length;

    const activeCustomers = customersWithDevices.filter(
      (c) => c._count.tickets > 0,
    ).length;

    const growthRate =
      lastMonthCount > 0
        ? Number(
            (
              ((thisMonthCount - lastMonthCount) / lastMonthCount) *
              100
            ).toFixed(1),
          )
        : thisMonthCount > 0
          ? 100
          : 0;

    return {
      totalCustomers,
      activeCustomers,
      returningCustomers,
      vipCustomers,
      todayNewCustomers,
      growthRate,
      totalDevices,
      activeWarranties,
      recentCustomers,
      recentActivities,
    };
  }

  // 1. List all customers with filters & pagination (search, tag, branch, status)
  async findAll(query: {
    search?: string;
    tag?: string;
    branchId?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = { isDeleted: false };

    if (query.branchId) {
      where.branchId = query.branchId;
    }

    if (query.tag) {
      where.tags = { has: query.tag };
    }

    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
        {
          devices: { some: { brand: { contains: term, mode: 'insensitive' } } },
        },
        {
          devices: { some: { model: { contains: term, mode: 'insensitive' } } },
        },
        {
          devices: {
            some: { serialNumber: { contains: term, mode: 'insensitive' } },
          },
        },
        {
          devices: { some: { imei: { contains: term, mode: 'insensitive' } } },
        },
      ];
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 25));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        include: {
          devices: true,
          tickets: {
            select: {
              id: true,
              status: true,
              estimatedCost: true,
              createdAt: true,
            },
          },
          warranties: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 2. Fetch single customer detailed profile with history, notes, timeline
  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        devices: true,
        tickets: {
          include: {
            device: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        communications: {
          orderBy: { createdAt: 'desc' },
        },
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found.`);
    }

    // Compile customer timeline
    const timeline: {
      type: string;
      title: string;
      date: Date;
      details?: string;
    }[] = [];

    // Customer registered
    timeline.push({
      type: 'registration',
      title: 'Customer Profile Created',
      date: customer.createdAt,
      details: `Profile registered with email ${customer.email} and phone ${customer.phone}.`,
    });

    // Devices registered
    customer.devices.forEach((dev) => {
      timeline.push({
        type: 'device_added',
        title: `Device Checked In: ${dev.brand} ${dev.model}`,
        date: dev.createdAt,
        details: `S/N: ${dev.serialNumber || 'N/A'}, IMEI: ${dev.imei || 'N/A'}`,
      });
    });

    // Tickets registered
    customer.tickets.forEach((ticket) => {
      timeline.push({
        type: 'ticket_created',
        title: `Repair Ticket Registered`,
        date: ticket.createdAt,
        details: `Ticket ID: ${ticket.id}. Status: ${ticket.status}. Estimated BDT ${ticket.estimatedCost}.`,
      });
    });

    // Communications registered
    customer.communications.forEach((comm) => {
      timeline.push({
        type: 'communication',
        title: `${comm.type} Message Outgoing`,
        date: comm.createdAt,
        details: `Status: ${comm.status}. Content: "${comm.message}"`,
      });
    });

    // Documents registered
    customer.documents.forEach((doc) => {
      timeline.push({
        type: 'document',
        title: `Document Uploaded: ${doc.fileName}`,
        date: doc.uploadedAt,
        details: `Size: ${(doc.fileSize / 1024).toFixed(1)} KB.`,
      });
    });

    // Sort timeline descending
    timeline.sort((a, b) => b.date.getTime() - a.date.getTime());

    return {
      ...customer,
      timeline,
    };
  }

  // 3. Create customer with duplicate check (same email or phone)
  async create(dto: CreateCustomerDto) {
    const existing = await this.prisma.customer.findFirst({
      where: {
        OR: [{ email: dto.email }, { phone: dto.phone }],
      },
    });

    if (existing) {
      throw new BadRequestException(
        'A customer with this email or phone number already exists.',
      );
    }

    const customer = await this.prisma.customer.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        branchId: dto.branchId,
        tags: dto.tags || [],
        preferredLanguage: dto.preferredLanguage || 'English',
        preferredContactTime: dto.preferredContactTime || null,
        preferredCommunicationChannel:
          dto.preferredCommunicationChannel || 'Email',
        marketingOptIn: dto.marketingOptIn ?? true,
        doNotDisturb: dto.doNotDisturb ?? false,
        notes: dto.notes || null,
      },
    });

    // Log Activity
    await this.prisma.customerActivity.create({
      data: {
        customerId: customer.id,
        type: 'CUSTOMER_CREATED',
        title: 'Customer Profile Created',
        description: `Customer profile registered. Name: ${customer.firstName} ${customer.lastName}, Email: ${customer.email}, Phone: ${customer.phone}.`,
      },
    });

    return customer;
  }

  // 4. Update customer profile
  async update(id: string, dto: UpdateCustomerDto) {
    const customer = await this.findOne(id); // Throws if not found

    // If changing email/phone, check for duplicates
    if (dto.email || dto.phone) {
      const duplicateWhere: any[] = [];
      if (dto.email) duplicateWhere.push({ email: dto.email });
      if (dto.phone) duplicateWhere.push({ phone: dto.phone });

      const duplicate = await this.prisma.customer.findFirst({
        where: {
          id: { not: id },
          OR: duplicateWhere,
        },
      });

      if (duplicate) {
        throw new BadRequestException(
          'Another customer with this email or phone number already exists.',
        );
      }
    }

    const updated = await this.prisma.customer.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        branchId: dto.branchId,
        tags: dto.tags,
        preferredLanguage: dto.preferredLanguage,
        preferredContactTime: dto.preferredContactTime,
        preferredCommunicationChannel: dto.preferredCommunicationChannel,
        marketingOptIn: dto.marketingOptIn,
        doNotDisturb: dto.doNotDisturb,
        notes: dto.notes,
      },
    });

    // Check if note was added/updated
    if (dto.notes && dto.notes !== customer.notes) {
      await this.prisma.customerActivity.create({
        data: {
          customerId: id,
          type: 'NOTE_ADDED',
          title: 'Customer Note Added',
          description: `Customer CRM note updated: "${dto.notes}"`,
        },
      });
    }

    // Log general update activity
    await this.prisma.customerActivity.create({
      data: {
        customerId: id,
        type: 'CUSTOMER_UPDATED',
        title: 'Customer Profile Updated',
        description: `Customer profile details updated.`,
      },
    });

    return updated;
  }

  // 5. Add communication log
  async logCommunication(customerId: string, type: string, message: string) {
    await this.findOne(customerId); // Validate customer exists
    return this.prisma.customerCommunication.create({
      data: {
        customerId,
        type,
        message,
        status: 'sent',
      },
    });
  }

  // 6. Add document listing log
  async uploadDocument(
    customerId: string,
    fileName: string,
    fileUrl: string,
    fileSize: number,
  ) {
    await this.findOne(customerId); // Validate customer exists
    return this.prisma.customerDocument.create({
      data: {
        customerId,
        fileName,
        fileUrl,
        fileSize,
      },
    });
  }

  // Soft Delete Customer
  async delete(id: string, deletedById?: string) {
    await this.findOne(id);
    await this.prisma.customer.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    await this.prisma.auditTrail.create({
      data: {
        userId: deletedById || null,
        action: 'DELETE',
        affectedModule: 'CUSTOMERS',
        recordId: id,
      },
    });

    return { success: true, message: `Customer ${id} soft deleted.` };
  }

  // Add Device to Customer
  async addDevice(
    customerId: string,
    dto: { brand: string; model: string; serialNumber?: string; imei?: string },
  ) {
    await this.findOne(customerId);
    const device = await this.prisma.device.create({
      data: {
        customerId,
        brand: dto.brand,
        model: dto.model,
        serialNumber: dto.serialNumber || null,
        imei: dto.imei || null,
      },
    });

    await this.prisma.customerActivity.create({
      data: {
        customerId,
        type: 'DEVICE_ADDED',
        title: 'New Device Registered',
        description: `Registered device ${dto.brand} ${dto.model} (S/N: ${dto.serialNumber || 'N/A'}, IMEI: ${dto.imei || 'N/A'}).`,
      },
    });

    return device;
  }

  // Delete Device from Customer
  async deleteDevice(customerId: string, deviceId: string) {
    await this.findOne(customerId);
    await this.prisma.device.delete({
      where: { id: deviceId },
    });

    return {
      success: true,
      message: `Device ${deviceId} removed from customer.`,
    };
  }

  // Send Communication (SMS, WhatsApp, Email, Call, Reminder, Wishes)
  async sendCommunication(
    customerId: string,
    type: string,
    channel: string,
    message: string,
  ) {
    const customer = await this.findOne(customerId);
    const comm = await this.prisma.customerCommunication.create({
      data: {
        customerId,
        type,
        message,
        status: 'sent',
      },
    });

    await this.prisma.customerActivity.create({
      data: {
        customerId,
        type: 'COMMUNICATION_SENT',
        title: `${type} Outgoing (${channel})`,
        description: `Dispatched message to ${customer.phone}: "${message}"`,
      },
    });

    return comm;
  }

  // Delete Customer Document
  async deleteDocument(customerId: string, documentId: string) {
    await this.findOne(customerId);
    await this.prisma.customerDocument.delete({
      where: { id: documentId },
    });

    return { success: true, message: `Document ${documentId} deleted.` };
  }

  // Merge Duplicate Customers
  async mergeDuplicates(primaryId: string, duplicateIds: string[]) {
    const primary = await this.findOne(primaryId);

    for (const dupId of duplicateIds) {
      if (dupId === primaryId) continue;
      // Re-assign devices and tickets
      await this.prisma.device.updateMany({
        where: { customerId: dupId },
        data: { customerId: primaryId },
      });

      await this.prisma.ticket.updateMany({
        where: { customerId: dupId },
        data: { customerId: primaryId },
      });

      await this.prisma.customerCommunication.updateMany({
        where: { customerId: dupId },
        data: { customerId: primaryId },
      });

      await this.prisma.customerDocument.updateMany({
        where: { customerId: dupId },
        data: { customerId: primaryId },
      });

      // Soft delete duplicate customer
      await this.prisma.customer.update({
        where: { id: dupId },
        data: { isDeleted: true, deletedAt: new Date() },
      });
    }

    await this.prisma.customerActivity.create({
      data: {
        customerId: primaryId,
        type: 'CUSTOMERS_MERGED',
        title: 'Duplicate Customers Merged',
        description: `Merged duplicate profiles (${duplicateIds.join(', ')}) into primary customer ${primary.firstName} ${primary.lastName}.`,
      },
    });

    return this.findOne(primaryId);
  }
}
