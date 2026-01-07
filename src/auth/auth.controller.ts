import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../comman/guards/jwt-auth.guard';
import { JwtPayloadDto } from './dto/jwt-payload.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return req.user as JwtPayloadDto;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout() {
    // In a basic JWT setup, we don't need server-side logout - Client just deletes the token
    return {
      message: 'Logged out successfully',
    };
  }
}
