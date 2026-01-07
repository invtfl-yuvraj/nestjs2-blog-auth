import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
// import { JwtPayloadDto } from '../../auth/dto/jwt-payload.dto';
import { TokenPayload } from '../../comman/interfaces/token-payload.interface';
import { UsersService } from '../../users/users.service';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /**
   * This method runs AFTER token is verified
   * Whatever you return here → available as req.user
   */
  async validate(payload: TokenPayload): Promise<JwtPayloadDto> {
    const user = await this.usersService.findOne(payload.sub);

    if (!user) {
      // User was deleted after token was issued
      throw new UnauthorizedException('User no longer exists');
    }

    if (!user.isActive) {
      // User was deactivated
      throw new UnauthorizedException('User account is inactive');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
