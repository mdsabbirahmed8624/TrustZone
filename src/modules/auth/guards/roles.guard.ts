import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }

    const userRole = user.role?.toUpperCase();
    const normalizedRequiredRoles = requiredRoles.map((r) => r.toUpperCase());

    // Super Admin automatically passes all RBAC checks
    if (userRole === 'SUPER_ADMIN') {
      return true;
    }

    return normalizedRequiredRoles.includes(userRole);
  }
}
