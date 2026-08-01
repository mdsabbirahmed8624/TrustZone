import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { TicketService } from '../services/ticket.service';
import { HelpDeskService } from '../services/help-desk.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('support/tickets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TicketsController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly helpDeskService: HelpDeskService,
  ) {}

  @Post()
  @Permissions('support:write')
  @HttpCode(HttpStatus.CREATED)
  async createTicket(
    @Body()
    body: {
      subject: string;
      description: string;
      priority?: string;
      channel?: string;
      department?: string;
      customerId?: string;
      assignedToId?: string;
    },
  ) {
    return this.ticketService.createTicket(body);
  }

  @Get()
  @Permissions('support:read')
  async getTickets(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.ticketService.getTickets({
      status,
      priority,
      search,
      page,
      limit,
    });
  }

  @Post(':id/status')
  @Permissions('support:write')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Request() req: any,
  ) {
    return this.ticketService.updateStatus(id, status, req.user?.id);
  }

  @Post(':id/comments')
  @Permissions('support:write')
  @HttpCode(HttpStatus.CREATED)
  async addComment(
    @Param('id') id: string,
    @Body()
    body: { comment: string; authorName?: string; isInternal?: boolean },
    @Request() req: any,
  ) {
    const authorName =
      body.authorName ||
      `${req.user?.firstName || 'Staff'} ${req.user?.lastName || 'Member'}`;
    return this.ticketService.addComment(
      id,
      body.comment,
      authorName,
      body.isInternal,
    );
  }

  @Post(':id/assign')
  @Permissions('support:write')
  @HttpCode(HttpStatus.OK)
  async assignTicket(
    @Param('id') id: string,
    @Body() body: { assignedToId: string; reason?: string },
    @Request() req: any,
  ) {
    return this.helpDeskService.assignTicket(
      id,
      body.assignedToId,
      body.reason,
      req.user?.id,
    );
  }
}
