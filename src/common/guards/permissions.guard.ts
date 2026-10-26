import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Generates equivalent permission representations across 'action:resource',
   * 'resource:action', and 'resource.action' formats so all modules interoperate.
   */
  private getEquivalentPermissions(perm: string): string[] {
    const normalized = perm.trim().toLowerCase();
    const equivalents = new Set<string>([perm, normalized]);

    const sep = normalized.includes(':')
      ? ':'
      : normalized.includes('.')
        ? '.'
        : null;
    if (sep) {
      const [first, second] = normalized.split(sep);
      if (first && second) {
        const pluralVariants = (s: string) =>
          s.endsWith('s') ? [s, s.slice(0, -1)] : [s, `${s}s`];
        for (const f of pluralVariants(first)) {
          for (const s of pluralVariants(second)) {
            equivalents.add(`${f}:${s}`);
            equivalents.add(`${s}:${f}`);
            equivalents.add(`${f}.${s}`);
            equivalents.add(`${s}.${f}`);
          }
        }
      }
    }
    return Array.from(equivalents);
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }

    const roleUpper = (user.role || '').toUpperCase();
    if (
      roleUpper === 'SUPER_ADMIN' ||
      roleUpper === 'OWNER' ||
      user.permissions?.includes('*')
    ) {
      return true;
    }

    const userPermSet = new Set<string>(
      (user.permissions || []).map((p: string) => p.toLowerCase()),
    );

    const hasAllPermissions = requiredPermissions.every((requiredPerm) =>
      this.getEquivalentPermissions(requiredPerm).some((eq) =>
        userPermSet.has(eq.toLowerCase()),
      ),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        'Insufficient permissions to access this resource.',
      );
    }

    return true;
  }
}
