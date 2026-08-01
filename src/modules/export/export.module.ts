import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { SystemEnterpriseService } from './system-enterprise.service';
import { SystemEnterpriseController } from './system-enterprise.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExportController, SystemEnterpriseController],
  providers: [ExportService, SystemEnterpriseService],
  exports: [ExportService, SystemEnterpriseService],
})
export class ExportModule {}
