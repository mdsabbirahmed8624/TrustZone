import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('chat')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('contacts')
  @Permissions('read:support')
  async getContacts(@CurrentUser() user: any) {
    const data = await this.chatService.listContacts(user.id);
    return { success: true, data };
  }

  @Get('messages')
  @Permissions('read:support')
  async getMessages(
    @CurrentUser() user: any,
    @Query('contactId') contactId: string,
  ) {
    const data = await this.chatService.listChatMessages(user.id, contactId);
    return { success: true, data };
  }

  @Post('messages')
  @Permissions('write:support')
  async sendMessage(
    @CurrentUser() user: any,
    @Body('receiverId') receiverId: string,
    @Body('message') message: string,
    @Body('attachments') attachments?: string[],
  ) {
    const data = await this.chatService.sendChatMessage(
      user.id,
      receiverId,
      message,
      attachments,
    );
    return { success: true, data };
  }

  @Post('messages/read')
  @HttpCode(HttpStatus.OK)
  @Permissions('write:support')
  async markRead(
    @CurrentUser() user: any,
    @Body('contactId') contactId: string,
  ) {
    const data = await this.chatService.markRead(contactId, user.id);
    return { success: true, data };
  }

  @Get('unread-counts')
  @Permissions('read:support')
  async getUnreadCounts(@CurrentUser() user: any) {
    const data = await this.chatService.getUnreadCount(user.id);
    return { success: true, data };
  }
}
