import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { QuantumMeshBook1Service } from './services/quantum-mesh-book1.service';
import { QuantumMeshBook1Controller } from './controllers/quantum-mesh-book1.controller';

@Module({
  imports: [PrismaModule],
  controllers: [QuantumMeshBook1Controller],
  providers: [QuantumMeshBook1Service],
  exports: [QuantumMeshBook1Service],
})
export class IamModule {}
