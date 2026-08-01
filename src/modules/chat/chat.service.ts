import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async sendChatMessage(
    senderId: string,
    receiverId: string,
    message: string,
    attachments?: string[],
  ) {
    const chatMsg = await this.prisma.chatMessage.create({
      data: {
        senderId,
        receiverId,
        message,
        attachments: attachments || null,
        isRead: false,
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
        receiver: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
      },
    });

    // Push real-time event to receiver
    this.notificationService.emitRealtimeEvent(
      receiverId,
      'CHAT_MESSAGE_RECEIVED',
      chatMsg,
    );
    // Push confirmation to sender
    this.notificationService.emitRealtimeEvent(
      senderId,
      'CHAT_MESSAGE_SENT',
      chatMsg,
    );

    return chatMsg;
  }

  async listChatMessages(userId: string, contactId: string) {
    return this.prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: contactId },
          { senderId: contactId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
        receiver: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async markRead(senderId: string, receiverId: string) {
    await this.prisma.chatMessage.updateMany({
      where: {
        senderId,
        receiverId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    this.notificationService.emitRealtimeEvent(senderId, 'CHAT_MESSAGES_READ', {
      readBy: receiverId,
    });
    return { success: true };
  }

  async getUnreadCount(userId: string) {
    const counts = await this.prisma.chatMessage.groupBy({
      by: ['senderId'],
      where: {
        receiverId: userId,
        isRead: false,
      },
      _count: {
        id: true,
      },
    });

    return counts.reduce(
      (acc, curr) => {
        acc[curr.senderId] = curr._count.id;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  async listContacts(userId: string) {
    // List all users in the system to start chat
    const users = await this.prisma.user.findMany({
      where: {
        id: { not: userId },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        branchId: true,
        branch: { select: { name: true } },
        isOnline: true,
      },
      orderBy: [{ branchId: 'asc' }, { firstName: 'asc' }],
    });

    return users;
  }
}
