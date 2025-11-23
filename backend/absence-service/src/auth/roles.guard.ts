import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; // no role restriction
    }
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    
    console.log('🔐 RolesGuard Debug:');
    console.log('  - Required roles:', requiredRoles);
    console.log('  - User object:', user);
    console.log('  - User role:', user?.role);
    
    if (!user || !user.role) {
      console.log('  ❌ Access denied: No user or no role');
      return false;
    }
    
    const hasAccess = requiredRoles.includes(user.role);
    console.log('  - Has access:', hasAccess);
    
    return hasAccess;
  }
}
