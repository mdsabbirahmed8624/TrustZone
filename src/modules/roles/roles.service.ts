import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    const existing = await this.prisma.role.findUnique({
      where: { name: dto.name.toUpperCase() },
    });

    if (existing) {
      throw new ConflictException(`Role with name ${dto.name} already exists.`);
    }

    return this.prisma.role.create({
      data: {
        name: dto.name.toUpperCase(),
        description: dto.description || null,
        permissions: dto.permissions,
        isSystem: dto.isSystem || false,
      },
    });
  }

  async findAll() {
    return this.prisma.role.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found.`);
    }

    return role;
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.findOne(id);

    // Dynamic roles check
    if (role.isSystem && dto.permissions && role.name === 'SUPER_ADMIN') {
      // Keep SUPER_ADMIN override intact
      dto.permissions = ['*'];
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        description:
          dto.description !== undefined ? dto.description : role.description,
        permissions:
          dto.permissions !== undefined ? dto.permissions : role.permissions,
      },
    });
  }

  async remove(id: string) {
    const role = await this.findOne(id);

    if (role.isSystem) {
      throw new BadRequestException('System-defined roles cannot be deleted.');
    }

    // Check if any user is using this role
    const usersCount = await this.prisma.user.count({
      where: { roleId: id },
    });

    if (usersCount > 0) {
      throw new BadRequestException(
        `Cannot delete role. There are ${usersCount} users assigned to this role.`,
      );
    }

    return this.prisma.role.delete({
      where: { id },
    });
  }
}
