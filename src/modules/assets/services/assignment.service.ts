import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AssignmentService {
  private readonly logger = new Logger(AssignmentService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Assigns asset to employee or department
   */
  async assignAsset(
    assetId: string,
    userId?: string,
    department?: string,
    notes?: string,
  ) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });
    if (!asset) {
      throw new NotFoundException(`Asset '${assetId}' not found.`);
    }

    const assignment = await this.prisma.assetAssignment.create({
      data: {
        assetId,
        userId: userId || null,
        department: department || null,
        assignedDate: new Date(),
        status: 'ACTIVE',
        notes: notes || null,
      },
    });

    await this.prisma.asset.update({
      where: { id: assetId },
      data: { status: 'ASSIGNED' },
    });

    this.logger.log(
      `Assigned Asset '${asset.assetTag}' to User '${userId || department}'`,
    );
    return assignment;
  }

  /**
   * Processes asset return
   */
  async returnAsset(assignmentId: string, notes?: string) {
    const assignment = await this.prisma.assetAssignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) {
      throw new NotFoundException(
        `AssetAssignment '${assignmentId}' not found.`,
      );
    }

    const updated = await this.prisma.assetAssignment.update({
      where: { id: assignmentId },
      data: {
        returnedDate: new Date(),
        status: 'RETURNED',
        notes: notes || assignment.notes,
      },
    });

    await this.prisma.asset.update({
      where: { id: assignment.assetId },
      data: { status: 'AVAILABLE' },
    });

    this.logger.log(`Returned Asset for Assignment '${assignmentId}'`);
    return updated;
  }
}
