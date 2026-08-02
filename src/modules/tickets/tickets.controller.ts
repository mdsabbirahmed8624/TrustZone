import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AssignTechDto } from './dto/assign-tech.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateDiagnosticsDto } from './dto/update-diagnostics.dto';
import { PublicBookingDto } from './dto/public-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('tickets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Public()
  @Post('public-booking')
  @HttpCode(HttpStatus.CREATED)
  async publicBooking(@Body() dto: PublicBookingDto) {
    return {
      success: true,
      data: await this.ticketsService.publicBooking(dto),
    };
  }

  @Get()
  @Permissions('read:repairs')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
    @Query('assignedTechId') assignedTechId?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return {
      success: true,
      data: await this.ticketsService.findAll({
        branchId,
        status,
        assignedTechId,
        search,
        page,
        limit,
      }),
    };
  }

  @Get(':id')
  @Permissions('read:repairs')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return {
      success: true,
      data: await this.ticketsService.findOne(id),
    };
  }

  @Post()
  @Permissions('write:repairs')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateTicketDto,
    @CurrentUser('id') createdById: string,
  ) {
    return {
      success: true,
      data: await this.ticketsService.create(dto, createdById),
    };
  }

  @Patch(':id/assign')
  @Permissions('write:repairs')
  @HttpCode(HttpStatus.OK)
  async assign(
    @Param('id') id: string,
    @Body() dto: AssignTechDto,
    @CurrentUser('id') updatedById: string,
  ) {
    return {
      success: true,
      data: await this.ticketsService.assign(id, dto, updatedById),
    };
  }

  @Patch(':id/diagnostics')
  @Permissions('write:repairs')
  @HttpCode(HttpStatus.OK)
  async updateDiagnostics(
    @Param('id') id: string,
    @Body() dto: UpdateDiagnosticsDto,
    @CurrentUser('id') updatedById: string,
  ) {
    return {
      success: true,
      data: await this.ticketsService.updateDiagnostics(id, dto, updatedById),
    };
  }

  @Patch(':id/status')
  @Permissions('write:repairs')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser('id') updatedById: string,
  ) {
    return {
      success: true,
      data: await this.ticketsService.updateStatus(id, dto, updatedById),
    };
  }

  @Patch(':id/approve')
  @Permissions('write:repairs')
  @HttpCode(HttpStatus.OK)
  async approveEstimate(
    @Param('id') id: string,
    @Body('approved') approved: boolean,
    @CurrentUser('id') updatedById: string,
  ) {
    return {
      success: true,
      data: await this.ticketsService.approveEstimate(
        id,
        approved,
        updatedById,
      ),
    };
  }

  @Patch(':id/cancel')
  @Permissions('write:repairs')
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Param('id') id: string,
    @Body('reason') reason?: string,
    @CurrentUser('id') updatedById?: string,
  ) {
    return {
      success: true,
      data: await this.ticketsService.cancel(id, reason, updatedById),
    };
  }

  @Delete(':id')
  @Permissions('write:repairs')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') deletedById?: string,
  ) {
    return await this.ticketsService.delete(id, deletedById);
  }

  @Post(':id/notes')
  @Permissions('write:repairs')
  @HttpCode(HttpStatus.OK)
  async addNote(
    @Param('id') id: string,
    @Body('note') note: string,
    @CurrentUser('id') updatedById?: string,
  ) {
    return {
      success: true,
      data: await this.ticketsService.addNote(id, note, updatedById),
    };
  }

  @Patch(':id/signature')
  @Permissions('write:repairs')
  @HttpCode(HttpStatus.OK)
  async addSignature(
    @Param('id') id: string,
    @Body('signatureData') signatureData: string,
    @CurrentUser('id') updatedById?: string,
  ) {
    return {
      success: true,
      data: await this.ticketsService.addSignature(id, signatureData, updatedById),
    };
  }

  @Patch(':id/photos')
  @Permissions('write:repairs')
  @HttpCode(HttpStatus.OK)
  async addPhotos(
    @Param('id') id: string,
    @Body('photos') photos: string[],
    @CurrentUser('id') updatedById?: string,
  ) {
    return {
      success: true,
      data: await this.ticketsService.addPhotos(id, photos, updatedById),
    };
  }
}
