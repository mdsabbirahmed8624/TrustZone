import {
  Body,
  Controller,
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('tickets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @Permissions('read:repairs')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
    @Query('assignedTechId') assignedTechId?: string,
  ) {
    return {
      success: true,
      data: await this.ticketsService.findAll({
        branchId,
        status,
        assignedTechId,
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
}
