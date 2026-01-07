// Custom decorator to specify required roles

import {
  ExecutionContext,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '../../../generated/prisma/enums';
import { Injectable as InjectableDecorator, CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayloadDto } from '../../auth/dto/jwt-payload.dto';

interface AuthenticatedRequest extends Request {
  user: JwtPayloadDto;
}

// ROLES_KEY - Metadata key for storing role requirements
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

/**
 * RolesGuard : Checks if authenticated user has required role(s)
 * MUST be used AFTER JwtAuthGuard (need authenticated user first!)
 * Usage: @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN)
 */

@InjectableDecorator()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * canActivate() - Determines if request should proceed
   * @param context - Execution context (contains request, handler, etc.)
   * @returns true if user has required role, false otherwise
   */

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(), // Method level
      context.getClass(), // Controller level
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedRequest;

    if (!user) {
      throw new UnauthorizedException();
    }

    return requiredRoles.includes(user.user.role);
  }
}
