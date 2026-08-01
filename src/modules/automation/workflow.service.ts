import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class WorkflowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  // ==========================================
  // 1. Approval Workflow (Expense & POs)
  // ==========================================
  async processExpenseApproval(
    expenseId: string,
    approvedById: string,
    approved: boolean,
    notes?: string,
  ) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
    });
    if (!expense) throw new NotFoundException('Expense not found.');
    if (expense.status !== 'PENDING')
      throw new BadRequestException('Expense is already processed.');

    const status = approved ? 'APPROVED' : 'REJECTED';
    const updated = await this.prisma.expense.update({
      where: { id: expenseId },
      data: {
        status,
        approvedById,
        notes: notes || expense.notes,
      },
    });

    // Notify applicant user
    await this.notificationService.sendNotification({
      userId: expense.createdById,
      title: `Expense Approval: ${status}`,
      message: `Your request for expense of ৳${expense.amount} has been ${status.toLowerCase()} by manager.`,
      type: approved ? 'SUCCESS' : 'ERROR',
      priority: 'MEDIUM',
      channel: 'IN_APP',
    });

    return updated;
  }

  async processPurchaseOrderApproval(poId: string, approved: boolean) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id: poId },
    });
    if (!po) throw new NotFoundException('Purchase order not found.');
    if (po.status !== 'DRAFT')
      throw new BadRequestException('PO is already processed.');

    const status = approved ? 'APPROVED' : 'CANCELLED';
    const updated = await this.prisma.purchaseOrder.update({
      where: { id: poId },
      data: { status },
    });

    return updated;
  }

  // ==========================================
  // 2. Escalation Workflow (SLA Breaches)
  // ==========================================
  async escalateTicketSla(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { assignedTech: true, branch: true },
    });
    if (!ticket) throw new NotFoundException('Ticket not found.');

    // Adjust status or notes
    const updated = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        internalNotes:
          `${ticket.internalNotes || ''}\n[SLA ESCALATION] Ticket breached SLA deadline. Escalated to Manager.`.trim(),
      },
    });

    // Notify Branch Managers
    const managers = await this.prisma.user.findMany({
      where: { branchId: ticket.branchId, role: 'MANAGER' },
    });

    for (const manager of managers) {
      await this.notificationService.sendNotification({
        userId: manager.id,
        title: 'SLA Escalation Alert',
        message: `Ticket #${ticket.id.substring(0, 8)} has breached SLA deadline (${ticket.slaDeadline.toLocaleDateString()}). Please assign/resolve immediately.`,
        type: 'WARNING',
        priority: 'CRITICAL',
        channel: 'IN_APP',
      });
    }

    return updated;
  }

  // ==========================================
  // 3. Assignment Workflow (Auto Assign Technician)
  // ==========================================
  async autoAssignTicket(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) throw new NotFoundException('Ticket not found.');

    // Find available technicians in the same branch
    const technicians = await this.prisma.user.findMany({
      where: {
        branchId: ticket.branchId,
        role: 'TECHNICIAN',
        availability: true,
        leaveStatus: 'active',
      },
      orderBy: [{ rating: 'desc' }],
    });

    if (technicians.length === 0) {
      console.warn(
        `[Auto Assignment] No technicians available for ticket ${ticketId} in branch ${ticket.branchId}`,
      );
      return null;
    }

    // Pick top technician (best rating)
    const bestTech = technicians[0];
    const updated = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        assignedTechId: bestTech.id,
        status: 'diagnosing', // advance to diagnosing since assigned
      },
    });

    // Notify technician
    await this.notificationService.sendNotification({
      userId: bestTech.id,
      title: 'New Ticket Auto-Assigned',
      message: `Ticket #${ticketId.substring(0, 8)} has been auto-assigned to you based on your branch availability and L1/L2 rating.`,
      type: 'INFORMATION',
      priority: 'HIGH',
      channel: 'IN_APP',
    });

    return updated;
  }
}
