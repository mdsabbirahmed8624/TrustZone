import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @Permissions('read:support')
  async getTasks(
    @Query('assignedToId') assignedToId?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.taskService.listTasks({
      assignedToId,
      status,
      priority,
      search,
    });
    return { success: true, data };
  }

  @Get(':id')
  @Permissions('read:support')
  async getTask(@Param('id') id: string) {
    const data = await this.taskService.getTask(id);
    return { success: true, data };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions('write:support')
  async createTask(
    @Body()
    body: {
      title: string;
      description?: string;
      assignedToId?: string;
      deadline?: string;
      priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      status?: string;
    },
  ) {
    const data = await this.taskService.createTask(body);
    return { success: true, data };
  }

  @Put(':id')
  @Permissions('write:support')
  async updateTask(@Param('id') id: string, @Body() body: any) {
    const data = await this.taskService.updateTask(id, body);
    return { success: true, data };
  }

  @Delete(':id')
  @Permissions('write:support')
  async deleteTask(@Param('id') id: string) {
    const data = await this.taskService.deleteTask(id);
    return { success: true, data };
  }

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('write:support')
  async addComment(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body('comment') comment: string,
  ) {
    const data = await this.taskService.addComment(id, user.id, comment);
    return { success: true, data };
  }

  @Post(':id/attachments')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('write:support')
  async addAttachment(
    @Param('id') id: string,
    @Body('fileName') fileName: string,
    @Body('fileUrl') fileUrl: string,
  ) {
    const data = await this.taskService.addAttachment(id, fileName, fileUrl);
    return { success: true, data };
  }
}
