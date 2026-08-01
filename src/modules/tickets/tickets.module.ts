import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { FinanceModule } from '../finance/finance.module';
import { WarrantyModule } from '../warranty/warranty.module';

@Module({
  imports: [FinanceModule, WarrantyModule],
  providers: [TicketsService],
  controllers: [TicketsController],
  exports: [TicketsService],
})
export class TicketsModule {}
