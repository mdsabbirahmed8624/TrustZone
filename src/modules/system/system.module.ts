import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SystemAdminService } from './services/system.service';
import { SystemAdminController } from './controllers/system.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SystemAdminController],
  providers: [SystemAdminService],
  exports: [SystemAdminService],
})
export class SystemModule {}
