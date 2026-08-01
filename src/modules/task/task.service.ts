import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async listTasks(filters: {
    assignedToId?: string;
    status?: string;
    priority?: string;
    search?: string;
  }) {
    const where: any = {};
    if (filters.assignedToId) where.assignedToId = filters.assignedToId;
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.task.findMany({
      where,
      orderBy: { deadline: 'asc' },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
        comments: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        attachments: true,
      },
    });
  }

  async getTask(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
        comments: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        attachments: true,
      },
    });
    if (!task) throw new NotFoundException('Task not found.');
    return task;
  }

  async createTask(dto: {
    title: string;
    description?: string;
    assignedToId?: string;
    deadline?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status?: string;
  }) {
    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description || null,
        assignedToId: dto.assignedToId || null,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        priority: dto.priority,
        status: dto.status || 'PENDING',
        progress: 0,
      },
    });

    if (dto.assignedToId) {
      await this.notificationService.sendNotification({
        userId: dto.assignedToId,
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${dto.title}. Deadline: ${dto.deadline || 'N/A'}.`,
        type: 'INFORMATION',
        priority: dto.priority,
        channel: 'IN_APP',
      });
    }

    return task;
  }

  async updateTask(id: string, dto: any) {
    const task = await this.getTask(id);

    const oldAssignedTo = task.assignedToId;

    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        deadline: dto.deadline ? new Date(dto.deadline) : task.deadline,
        progress:
          dto.progress !== undefined ? Number(dto.progress) : task.progress,
      },
    });

    // Notify new user if assignment changed
    if (dto.assignedToId && dto.assignedToId !== oldAssignedTo) {
      await this.notificationService.sendNotification({
        userId: dto.assignedToId,
        title: 'New Task Assigned',
        message: `You have been assigned an existing task: ${updated.title}. Deadline: ${updated.deadline || 'N/A'}.`,
        type: 'INFORMATION',
        priority: updated.priority as any,
        channel: 'IN_APP',
      });
    }

    return updated;
  }

  async deleteTask(id: string) {
    await this.getTask(id);
    await this.prisma.task.delete({ where: { id } });
    return { success: true };
  }

  async addComment(taskId: string, userId: string, comment: string) {
    await this.getTask(taskId);
    const newComment = await this.prisma.taskComment.create({
      data: {
        taskId,
        userId,
        comment,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return newComment;
  }

  async addAttachment(taskId: string, fileName: string, fileUrl: string) {
    await this.getTask(taskId);
    return this.prisma.taskAttachment.create({
      data: {
        taskId,
        fileName,
        fileUrl,
      },
    });
  }
}
