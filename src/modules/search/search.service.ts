import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async globalSearch(query: string, limit = 5) {
    if (!query || query.trim() === '') {
      return {
        customers: [],
        invoices: [],
        tickets: [],
        warranties: [],
        inventory: [],
        purchases: [],
        suppliers: [],
        notifications: [],
        tasks: [],
        announcements: [],
        calendarEvents: [],
        auditTrails: [],
      };
    }

    const term = query.trim();

    const [
      customers,
      invoices,
      tickets,
      warranties,
      inventory,
      purchases,
      suppliers,
      notifications,
      tasks,
      announcements,
      calendarEvents,
      auditTrails,
    ] = await Promise.all([
      // 1. Customers
      this.prisma.customer.findMany({
        where: {
          OR: [
            { firstName: { contains: term, mode: 'insensitive' } },
            { lastName: { contains: term, mode: 'insensitive' } },
            { email: { contains: term, mode: 'insensitive' } },
            { phone: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: limit,
      }),
      // 2. Invoices
      this.prisma.invoice.findMany({
        where: { invoiceNumber: { contains: term, mode: 'insensitive' } },
        take: limit,
      }),
      // 3. Tickets
      this.prisma.ticket.findMany({
        where: {
          OR: [
            { status: { contains: term, mode: 'insensitive' } },
            { diagnosisNotes: { contains: term, mode: 'insensitive' } },
            { faults: { has: term } },
          ],
        },
        include: { customer: true, device: true },
        take: limit,
      }),
      // 4. Warranties
      this.prisma.warranty.findMany({
        where: {
          OR: [
            { warrantyNumber: { contains: term, mode: 'insensitive' } },
            { serialOrImei: { contains: term, mode: 'insensitive' } },
            { deviceBrand: { contains: term, mode: 'insensitive' } },
            { deviceModel: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: limit,
      }),
      // 5. Parts / Inventory
      this.prisma.part.findMany({
        where: {
          OR: [
            { sku: { contains: term, mode: 'insensitive' } },
            { name: { contains: term, mode: 'insensitive' } },
            { category: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: limit,
      }),
      // 6. Purchases (Purchase Orders)
      this.prisma.purchaseOrder.findMany({
        where: {
          OR: [
            { status: { contains: term, mode: 'insensitive' } },
            { paymentStatus: { contains: term, mode: 'insensitive' } },
          ],
        },
        include: { supplier: true },
        take: limit,
      }),
      // 7. Suppliers
      this.prisma.supplier.findMany({
        where: {
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { email: { contains: term, mode: 'insensitive' } },
            { phone: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: limit,
      }),
      // 8. Notifications
      this.prisma.notification.findMany({
        where: {
          OR: [
            { title: { contains: term, mode: 'insensitive' } },
            { message: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: limit,
      }),
      // 9. Tasks
      this.prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: limit,
      }),
      // 10. Announcements
      this.prisma.announcement.findMany({
        where: {
          OR: [
            { title: { contains: term, mode: 'insensitive' } },
            { content: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: limit,
      }),
      // 11. Calendar Events
      this.prisma.calendarEvent.findMany({
        where: {
          OR: [
            { title: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: limit,
      }),
      // 12. Audit Trails
      this.prisma.auditTrail.findMany({
        where: {
          OR: [
            { action: { contains: term, mode: 'insensitive' } },
            { affectedModule: { contains: term, mode: 'insensitive' } },
            { userEmail: { contains: term, mode: 'insensitive' } },
            { recordId: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: limit,
      }),
    ]);

    return {
      customers,
      invoices,
      tickets,
      warranties,
      inventory,
      purchases,
      suppliers,
      notifications,
      tasks,
      announcements,
      calendarEvents,
      auditTrails,
    };
  }
}
