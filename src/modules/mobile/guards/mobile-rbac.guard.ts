import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class MobileRbacGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    const userRole = user.role?.toUpperCase();

    // Super Admin passes all RBAC checks
    if (userRole === 'SUPER_ADMIN') {
      return true;
    }

    // Role verification
    if (requiredRoles && requiredRoles.length > 0) {
      const normalizedRoles = requiredRoles.map((r) => r.toUpperCase());
      if (!normalizedRoles.includes(userRole)) {
        throw new ForbiddenException('Insufficient role permissions.');
      }
    }

    // Custom Permissions verification
    if (requiredPermissions && requiredPermissions.length > 0) {
      const userPermissions = (user.permissions || []).map((p: string) =>
        p.toUpperCase(),
      );
      const normalizedPermissions = requiredPermissions.map((p) =>
        p.toUpperCase(),
      );
      const hasAllPermissions = normalizedPermissions.every((p) =>
        userPermissions.includes(p),
      );
      if (!hasAllPermissions) {
        throw new ForbiddenException('Insufficient custom permissions.');
      }
    }

    return true;
  }
}
