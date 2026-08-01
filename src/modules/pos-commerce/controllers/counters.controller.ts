import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('pos/counters')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CountersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Permissions('pos:read')
  async getCounters() {
    return this.prisma.pOSCounter.findMany({ orderBy: { name: 'asc' } });
  }
}
