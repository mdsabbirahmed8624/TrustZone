import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { BulkUserActionDto } from './dto/bulk-user.dto';
import * as bcrypt from 'bcrypt';

export const MODULE_PERMISSIONS = [
  'dashboard', 'booking', 'customer', 'repair', 'inventory', 'invoice', 
  'finance', 'reports', 'crm', 'marketing', 'branch', 'settings', 
  'users', 'roles', 'audit_logs', 'api'
];

export const ACTION_TYPES = [
  'create', 'read', 'update', 'delete', 'approve', 'export', 'print', 'assign'
];

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // STEP 2 & 9: USER CRUD & SEARCH
  // ==========================================
  async getUsers(query?: {
    search?: string;
    role?: string;
    branchId?: string;
    status?: string;
    department?: string;
  }) {
    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.role) where.role = query.role;
    if (query?.branchId) where.branchId = query.branchId;
    if (query?.department) where.department = { contains: query.department, mode: 'insensitive' };
    if (query?.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { username: { contains: query.search, mode: 'insensitive' } },
        { employeeId: { contains: query.search, mode: 'insensitive' } },
        { mobile: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        mobile: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        roleId: true,
        roleRelation: { select: { id: true, name: true } },
        branchId: true,
        branch: { select: { id: true, name: true, code: true } },
        department: true,
        designation: true,
        status: true,
        joiningDate: true,
        mfaEnabled: true,
        lastLogin: true,
        lastLoginIp: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        branch: true,
        roleRelation: true,
        sessions: { where: { isValid: true }, take: 10, orderBy: { createdAt: 'desc' } },
        auditLogs: { take: 15, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!user) throw new NotFoundException(`User ${id} not found`);
    
    // Omit password hash
    const { password, mfaSecret, ...userWithoutSecrets } = user;
    return userWithoutSecrets;
  }

  async createUser(dto: CreateUserDto) {
    // STEP 14: Duplicate checks
    const existingEmail = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingEmail) throw new ConflictException(`Email "${dto.email}" is already registered.`);

    if (dto.username) {
      const existingUsername = await this.prisma.user.findUnique({ where: { username: dto.username } });
      if (existingUsername) throw new ConflictException(`Username "${dto.username}" is already in use.`);
    }

    if (dto.employeeId) {
      const existingEmpId = await this.prisma.user.findUnique({ where: { employeeId: dto.employeeId } });
      if (existingEmpId) throw new ConflictException(`Employee ID "${dto.employeeId}" is already assigned.`);
    }

    // Weak password check
    if (!dto.password || dto.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username || dto.email.split('@')[0],
        mobile: dto.mobile,
        employeeId: dto.employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        avatar: dto.avatar,
        role: dto.role,
        roleId: dto.roleId,
        branchId: dto.branchId,
        department: dto.department || 'General',
        designation: dto.designation || 'Staff Member',
        status: dto.status || 'ACTIVE',
        joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : new Date(),
      },
    });

    // Create Audit Log
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_CREATED',
        details: `User account ${user.email} (${user.role}) created successfully.`,
      },
    });

    const { password: _, ...result } = user;
    return result;
  }

  async updateUser(id: string, dto: Partial<CreateUserDto>) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`User ${id} not found`);

    const data: any = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      mobile: dto.mobile,
      avatar: dto.avatar,
      role: dto.role,
      roleId: dto.roleId,
      branchId: dto.branchId,
      department: dto.department,
      designation: dto.designation,
      status: dto.status,
    };

    if (dto.joiningDate) data.joiningDate = new Date(dto.joiningDate);

    if (dto.password && dto.password.trim() !== '') {
      if (dto.password.length < 8) throw new BadRequestException('Password must be at least 8 characters long.');
      data.password = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
    });

    const { password: _, ...result } = updated;
    return result;
  }

  async updateUserStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED') {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);

    return this.prisma.user.update({
      where: { id },
      data: {
        status,
        failedLoginAttempts: status === 'ACTIVE' ? 0 : undefined,
        lockoutUntil: status === 'ACTIVE' ? null : undefined,
      },
    });
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);

    return this.prisma.user.delete({ where: { id } });
  }

  // ==========================================
  // STEP 3 & 4: ROLE & PERMISSION MATRIX
  // ==========================================
  async getRoles() {
    return this.prisma.role.findMany({
      include: {
        _count: { select: { users: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createRole(name: string, description?: string, permissions: string[] = []) {
    const existing = await this.prisma.role.findUnique({ where: { name } });
    if (existing) throw new ConflictException(`Role "${name}" already exists.`);

    return this.prisma.role.create({
      data: {
        name,
        description,
        permissions,
        isSystem: false,
      },
    });
  }

  async updateRole(id: string, data: { name?: string; description?: string; permissions?: string[] }) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException(`Role ${id} not found`);

    return this.prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        permissions: data.permissions,
      },
    });
  }

  async deleteRole(id: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException(`Role ${id} not found`);
    if (role.isSystem) throw new BadRequestException('System core roles cannot be deleted.');

    return this.prisma.role.delete({ where: { id } });
  }

  getPermissionMatrix() {
    const matrix: any[] = [];
    for (const module of MODULE_PERMISSIONS) {
      const actions: Record<string, string> = {};
      for (const action of ACTION_TYPES) {
        actions[action] = `${action}:${module}`;
      }
      matrix.push({
        module,
        label: module.toUpperCase().replace('_', ' '),
        actions,
      });
    }
    return matrix;
  }

  // ==========================================
  // STEP 5: USER PROFILE & SECURITY
  // ==========================================
  async updateProfile(userId: string, data: {
    firstName?: string;
    lastName?: string;
    mobile?: string;
    avatar?: string;
    language?: string;
    theme?: string;
    notificationPref?: any;
  }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isValid = await bcrypt.compare(currentPass, user.password);
    if (!isValid) throw new BadRequestException('Current password does not match.');

    if (newPass.length < 8) throw new BadRequestException('New password must be at least 8 characters long.');

    const hashedPassword = await bcrypt.hash(newPass, 10);
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  // ==========================================
  // STEP 7: SESSION MANAGEMENT
  // ==========================================
  async getUserSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId, isValid: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async terminateSession(sessionId: string) {
    return this.prisma.session.update({
      where: { id: sessionId },
      data: { isValid: false, logoutAt: new Date() },
    });
  }

  async logoutAllDevices(userId: string) {
    return this.prisma.session.updateMany({
      where: { userId, isValid: true },
      data: { isValid: false, logoutAt: new Date() },
    });
  }

  // ==========================================
  // STEP 8: ACTIVITY LOGS
  // ==========================================
  async getActivityLogs(query?: { userId?: string; action?: string }) {
    const where: any = {};
    if (query?.userId) where.userId = query.userId;
    if (query?.action) where.action = query.action;

    return this.prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  // ==========================================
  // STEP 10 & 11: BULK OPERATIONS & EXPORT
  // ==========================================
  async handleBulkUserAction(dto: BulkUserActionDto) {
    if (!dto.userIds || dto.userIds.length === 0) {
      throw new BadRequestException('No user IDs specified for bulk action.');
    }

    switch (dto.action) {
      case 'ACTIVATE':
        return this.prisma.user.updateMany({
          where: { id: { in: dto.userIds } },
          data: { status: 'ACTIVE', failedLoginAttempts: 0, lockoutUntil: null },
        });

      case 'DEACTIVATE':
        return this.prisma.user.updateMany({
          where: { id: { in: dto.userIds } },
          data: { status: 'INACTIVE' },
        });

      case 'SUSPEND':
        return this.prisma.user.updateMany({
          where: { id: { in: dto.userIds } },
          data: { status: 'SUSPENDED' },
        });

      case 'ASSIGN_ROLE':
        if (!dto.targetValue) throw new BadRequestException('Target role name required.');
        return this.prisma.user.updateMany({
          where: { id: { in: dto.userIds } },
          data: { role: dto.targetValue },
        });

      case 'ASSIGN_BRANCH':
        if (!dto.targetValue) throw new BadRequestException('Target branch ID required.');
        return this.prisma.user.updateMany({
          where: { id: { in: dto.userIds } },
          data: { branchId: dto.targetValue },
        });

      case 'RESET_PASSWORD':
        const defaultHash = await bcrypt.hash('TrustZone@2026', 10);
        return this.prisma.user.updateMany({
          where: { id: { in: dto.userIds } },
          data: { password: defaultHash },
        });

      case 'DELETE':
        return this.prisma.user.deleteMany({
          where: { id: { in: dto.userIds } },
        });

      default:
        throw new BadRequestException('Invalid bulk action requested.');
    }
  }
}
