import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PublicUser } from '../users/dto/user.dto';
import { LoginDto } from './dto/auth.dto';
import { RegisterDto } from './dto/auth.dto';
import { TokenPayload } from '../comman/interfaces/token-payload.interface';
import {
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    // Validate credentials (checks email + password)
    const user = await this.usersService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Generate JWT token
    const token = await this.generateToken(user);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Create user (this also hashes password)
    const user = await this.usersService.create(registerDto);

    // Generate JWT token
    const token = await this.generateToken(user);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  private generateToken(user: PublicUser): Promise<string> {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.signAsync(payload);
  }

  async validateToken(token: string): Promise<TokenPayload> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  refreshToken() {
    throw new NotImplementedException('Refresh token not implemented yet');
  }
}
