import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../comman/interfaces/repository.interface';
import { PrismaService } from '../database/prisma.service';
import { PublicUser, UserEntity } from '../users/dto/user.dto';
import { CreateUserDtoType } from '../users/dto/create-user.dto';
import { UpdateUserDtoType } from './dto/update-user.dto';

@Injectable()
export class UsersRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<PublicUser[]> {
    return this.prisma.user.findMany({
      omit: { password: true },
    });
  }

  async findById(id: string): Promise<PublicUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      omit: { password: true },
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    return !!(await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    }));
  }

  async create(data: CreateUserDtoType): Promise<PublicUser> {
    return this.prisma.user.create({
      data,
      omit: { password: true },
    });
  }

  async update(id: string, data: UpdateUserDtoType): Promise<PublicUser> {
    return this.prisma.user.update({
      where: { id },
      data,
      omit: { password: true },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
