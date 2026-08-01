import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FranchiseService } from './franchise.service';
import { FranchiseController } from './franchise.controller';
import { FranchiseBook1Service } from './services/franchise-book1.service';
import { FranchiseBook1Controller } from './controllers/franchise-book1.controller';
import { FranchiseBook3Service } from './services/franchise-book3.service';
import { FranchiseBook3Controller } from './controllers/franchise-book3.controller';
import { FranchiseSettlementBook7Service } from './services/franchise-settlement-book7.service';
import { FranchiseSettlementBook7Controller } from './controllers/franchise-settlement-book7.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    FranchiseSettlementBook7Controller,
    FranchiseBook3Controller,
    FranchiseBook1Controller,
    FranchiseController,
  ],
  providers: [
    FranchiseService,
    FranchiseBook1Service,
    FranchiseBook3Service,
    FranchiseSettlementBook7Service,
  ],
  exports: [
    FranchiseService,
    FranchiseBook1Service,
    FranchiseBook3Service,
    FranchiseSettlementBook7Service,
  ],
})
export class FranchiseModule {}
