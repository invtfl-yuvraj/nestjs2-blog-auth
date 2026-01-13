import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PublicUser } from './dto/user.dto';
import { JwtAuthGuard } from '../comman/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../comman/guards/roles.guard';
import { Role } from '../../generated/prisma/enums';
import { JwtPayloadDto } from '../auth/dto/jwt-payload.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<PublicUser> {
    return this.usersService.create(dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async findAll(): Promise<PublicUser[]> {
    return this.usersService.findAll();
  }

  @Get('me')
  async getMyProfile(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user = req.user as JwtPayloadDto;

    return this.usersService.findOne(user.userId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  async findOne(@Param('id') id: string): Promise<PublicUser | null> {
    return this.usersService.findOne(id);
  }

  @Patch('me')
  async updateMyProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    // Remove sensitive fields that users shouldn't change themselves
    // - Can't change their own role
    // - Can't activate/deactivate themselves

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user = req.user as JwtPayloadDto;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { role, isActive, ...safeUpdates } = updateUserDto;
    const userId = user.userId;

    return this.usersService.update(userId, safeUpdates);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() UpdateUserDto: UpdateUserDto,
  ): Promise<PublicUser> {
    return this.usersService.update(id, UpdateUserDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async remove(
    @Param('id') id: string,
    @Request() req,
  ): Promise<{ message: string }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user = req.user as JwtPayloadDto;

    if (id === user.userId) {
      throw new Error('Cannot delete your own account');
    }

    await this.usersService.delete(id);

    return {
      message: 'User deleted successfully',
    };
  }
}
