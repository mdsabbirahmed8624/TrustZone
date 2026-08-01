import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateReservationDto {
  warehouseId: string;
  partId: string;
  ticketId: string;
  technicianId: string;
  quantity: number;
}

@Injectable()
export class ReservationService {
  private readonly logger = new Logger(ReservationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async reserveParts(dto: CreateReservationDto) {
    this.logger.log(
      `Reserving ${dto.quantity} units of part ${dto.partId} for ticket ${dto.ticketId}`,
    );

    return this.prisma.$transaction(async (tx) => {
      // 1. Transactional Row-Level Locking (SELECT FOR UPDATE)
      const items: any[] = await tx.$queryRaw`
        SELECT * FROM inventory_items 
        WHERE "warehouseId" = ${dto.warehouseId}::uuid AND "partId" = ${dto.partId}::uuid AND "isDeleted" = false
        FOR UPDATE
      `;

      if (items.length === 0) {
        throw new NotFoundException(
          'InventoryItem not found in this warehouse.',
        );
      }

      const item = items[0];

      // Calculate already reserved quantity
      const reservations = await tx.inventoryReservation.findMany({
        where: {
          inventoryItemId: item.id,
          status: 'PENDING',
          isDeleted: false,
        },
      });

      const totalReserved = reservations.reduce(
        (sum, r) => sum + r.quantity,
        0,
      );
      const availableQuantity = item.quantity - totalReserved;

      // Negative stock prevention check
      if (availableQuantity < dto.quantity) {
        throw new BadRequestException(
          `Insufficient stock to reserve. Total: ${item.quantity}, Reserved: ${totalReserved}, Requested: ${dto.quantity}`,
        );
      }

      // 2. Optimistic locking check using version verification
      const updatedItem = await tx.inventoryItem.update({
        where: { id: item.id, version: item.version },
        data: {
          version: { increment: 1 },
        },
      });

      if (!updatedItem) {
        throw new BadRequestException(
          'Optimistic locking failure: Stock was concurrently modified.',
        );
      }

      // Create Reservation
      const reservation = await tx.inventoryReservation.create({
        data: {
          inventoryItemId: item.id,
          ticketId: dto.ticketId,
          technicianId: dto.technicianId,
          quantity: dto.quantity,
          status: 'PENDING',
        },
      });

      // Write Immutable Ledger Movement Log
      await tx.inventoryMovement.create({
        data: {
          inventoryItemId: item.id,
          beforeQuantity: item.quantity,
          afterQuantity: item.quantity, // Quantity doesn't decrement physically until consumption
          quantityDelta: -dto.quantity,
          type: 'RESERVED',
          sourceModule: 'RESERVATION',
          userId: dto.technicianId,
          ticketId: dto.ticketId,
          reservationId: reservation.id,
          warehouseId: dto.warehouseId,
          reference: `Reserved parts for Ticket #${dto.ticketId}`,
        },
      });

      return reservation;
    });
  }

  async releaseReservation(reservationId: string, userId: string) {
    this.logger.log(`Releasing reservation: ${reservationId}`);

    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.inventoryReservation.findFirst({
        where: { id: reservationId, isDeleted: false },
        include: { inventoryItem: true },
      });

      if (!reservation) {
        throw new NotFoundException(`Reservation ${reservationId} not found.`);
      }

      // Lock row
      await tx.$queryRaw`
        SELECT * FROM inventory_items WHERE id = ${reservation.inventoryItemId}::uuid FOR UPDATE
      `;

      // Soft delete reservation
      const released = await tx.inventoryReservation.update({
        where: { id: reservationId },
        data: {
          status: 'RELEASED',
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      // Log Ledger Release
      await tx.inventoryMovement.create({
        data: {
          inventoryItemId: reservation.inventoryItemId,
          beforeQuantity: reservation.inventoryItem.quantity,
          afterQuantity: reservation.inventoryItem.quantity,
          quantityDelta: reservation.quantity,
          type: 'RELEASED',
          sourceModule: 'RESERVATION',
          userId,
          reservationId,
          reference: `Released parts reservation for Ticket #${reservation.ticketId}`,
        },
      });

      return released;
    });
  }

  async consumeReservedParts(reservationId: string, userId: string) {
    this.logger.log(
      `Consuming reserved parts for reservation ${reservationId}`,
    );

    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.inventoryReservation.findFirst({
        where: { id: reservationId, isDeleted: false, status: 'PENDING' },
        include: { inventoryItem: true },
      });

      if (!reservation) {
        throw new BadRequestException(
          'Reservation is either already consumed, released, or invalid.',
        );
      }

      // Lock row
      const items: any[] = await tx.$queryRaw`
        SELECT * FROM inventory_items WHERE id = ${reservation.inventoryItemId}::uuid FOR UPDATE
      `;
      const item = items[0];

      if (item.quantity < reservation.quantity) {
        throw new BadRequestException(
          'Physical inventory count is lower than reservation volume.',
        );
      }

      // 1. FIFO consumption of InventoryBatches
      let remainingToDeduct = reservation.quantity;
      const batches = await tx.inventoryBatch.findMany({
        where: { inventoryItemId: item.id },
        orderBy: { receivedAt: 'asc' }, // FIFO oldest first
      });

      for (const batch of batches) {
        if (remainingToDeduct <= 0) break;

        if (batch.quantity <= remainingToDeduct) {
          remainingToDeduct -= batch.quantity;
          await tx.inventoryBatch.delete({ where: { id: batch.id } });
        } else {
          await tx.inventoryBatch.update({
            where: { id: batch.id },
            data: { quantity: { decrement: remainingToDeduct } },
          });
          remainingToDeduct = 0;
        }
      }

      // Deduct physical count
      const updated = await tx.inventoryItem.update({
        where: { id: item.id, version: item.version },
        data: {
          quantity: { decrement: reservation.quantity },
          version: { increment: 1 },
        },
      });

      // Update reservation status
      await tx.inventoryReservation.update({
        where: { id: reservationId },
        data: { status: 'CONSUMED' },
      });

      // Log Immutable Ledger Consumption
      await tx.inventoryMovement.create({
        data: {
          inventoryItemId: item.id,
          beforeQuantity: item.quantity,
          afterQuantity: updated.quantity,
          quantityDelta: -reservation.quantity,
          type: 'CONSUME',
          sourceModule: 'TICKET_CLOSURE',
          userId,
          ticketId: reservation.ticketId,
          reservationId,
          reference: `Consumed reserved parts during repair task on ticket #${reservation.ticketId}`,
        },
      });

      return updated;
    });
  }

  // Reservation aging check
  async releaseAgedReservations() {
    this.logger.log('Scanning for aged reservations to auto-release...');
    const EXPIRY_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours reservation timeout
    const cutoffDate = new Date(Date.now() - EXPIRY_THRESHOLD_MS);

    const agedReservations = await this.prisma.inventoryReservation.findMany({
      where: {
        status: 'PENDING',
        isDeleted: false,
        createdAt: { lt: cutoffDate },
      },
    });

    const results = [];
    for (const res of agedReservations) {
      const released = await this.releaseReservation(res.id, res.technicianId);
      results.push(released);
    }
    return results;
  }
}
