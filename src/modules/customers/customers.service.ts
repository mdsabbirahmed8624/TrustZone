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

  // 1. List all customers with filters (search, tag, branch)
  async findAll(query: { search?: string; tag?: string; branchId?: string }) {
    const where: any = {};

    if (query.branchId) {
      where.branchId = query.branchId;
    }

    if (query.tag) {
      where.tags = { has: query.tag };
    }

    if (query.search) {
      const searchLower = query.search.trim();
      where.OR = [
        { firstName: { contains: searchLower, mode: 'insensitive' } },
        { lastName: { contains: searchLower, mode: 'insensitive' } },
        { email: { contains: searchLower, mode: 'insensitive' } },
        { phone: { contains: searchLower, mode: 'insensitive' } },
      ];
    }

    return this.prisma.customer.findMany({
      where,
      include: {
        devices: true,
        tickets: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
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
}
