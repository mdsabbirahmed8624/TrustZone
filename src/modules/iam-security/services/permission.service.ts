import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates or updates a Permission Group
   */
  async createPermissionGroup(
    name: string,
    permissions: string[],
    description?: string,
  ) {
    const group = await this.prisma.permissionGroup.upsert({
      where: { name },
      update: {
        permissions,
        description: description || null,
      },
      create: {
        name,
        permissions,
        description: description || null,
      },
    });

    this.logger.log(
      `Created Permission Group '${group.name}' with ${permissions.length} permissions`,
    );
    return group;
  }

  /**
   * Assigns a role to a user with department scope and optional expiration date
   */
  async assignRole(
    userId: string,
    roleName: string,
    department?: string,
    assignedBy?: string,
    expiresInDays?: number,
  ) {
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 86400000)
      : null;

    const assignment = await this.prisma.roleAssignment.create({
      data: {
        userId,
        roleName,
        department: department || null,
        assignedBy: assignedBy || null,
        expiresAt,
      },
    });

    this.logger.log(
      `Assigned role '${roleName}' to User '${userId}' [Dept: ${department || 'ALL'}]`,
    );
    return assignment;
  }

  /**
   * Evaluates active permissions for a user
   */
  async getUserPermissions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roleAssignments: {
          where: {
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User '${userId}' not found.`);
    }

    const assignedRoles = user.roleAssignments.map((r) => r.roleName);
    if (!assignedRoles.includes(user.role)) {
      assignedRoles.push(user.role);
    }

    return {
      userId,
      baseRole: user.role,
      assignedRoles,
      roleAssignments: user.roleAssignments,
    };
  }
}
