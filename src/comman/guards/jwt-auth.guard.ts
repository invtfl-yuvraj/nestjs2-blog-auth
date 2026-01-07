import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtPayloadDto } from '../../auth/dto/jwt-payload.dto';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /** This canActivate() Method Determines if request should proceed
   * Returns: - true: Request proceeds to controller
   *          - false: Request rejected (401 Unauthorized)
   * This calls the parent class method which handles JWT validation */

  canActivate(
    context: ExecutionContext,
  ): Promise<boolean> | Observable<boolean> | boolean {
    return super.canActivate(context);
  }

  /** handleRequest() - Called after authentication
   * @param err - Error from authentication
   * @param user - User object from JwtStrategy.validate()
   * @param info - Additional info (like token expired message)
   * You can customize error handling here */

  handleRequest<TUser = JwtPayloadDto>(
    err: any,
    user: JwtPayloadDto,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Unauthorized');
    }

    return user as TUser;
  }
}
