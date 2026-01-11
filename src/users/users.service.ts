import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { PublicUser, UserEntity } from './dto/user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll(): Promise<PublicUser[]> {
    return this.usersRepository.findAll();
  }

  async findOne(id: string): Promise<PublicUser | null> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findByEmail(email);
  }

  async create(data: CreateUserDto): Promise<PublicUser> {
    const existingUser = await this.usersRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    if (data.role === 'ADMIN' || data.role === 'EDITOR') {
      throw new ConflictException(
        'Cannot assign ADMIN or EDITOR role during registration',
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.usersRepository.create({
      ...data,
      password: hashedPassword,
    });
    return user;
  }

  async update(id: string, data: UpdateUserDto): Promise<PublicUser> {
    const existingUser = await this.findOne(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (data.email && data.email !== existingUser.email) {
      const emailTaken = await this.usersRepository.existsByEmail(data.email);
      if (emailTaken) {
        throw new ConflictException('Email is already taken by another user');
      }
    }

    const updatedUser = await this.usersRepository.update(id, data);
    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    const existingUser = await this.findOne(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.usersRepository.delete(id);
  }

  //   async changePassword(
  //     id: string,
  //     currentPassword: string,
  //     newPassword: string,
  //   ): Promise<void> {

  //     if (newPassword.length < 8) {
  //       throw new BadRequestException('Password must be at least 8 characters');
  //     }

  //     const existingUser = await this.findOne(id);
  //     if (!existingUser) {
  //       throw new NotFoundException(`User with ID ${id} not found`);
  //     }

  //     const passwordMatches = await bcrypt.compare(
  //       currentPassword,
  //       existingUser.password,
  //     );
  //     if (!passwordMatches) {
  //       throw new ConflictException('Current password is incorrect');
  //     }

  //     const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  //     await this.usersRepository.updatePassword(id, {
  //       password: hashedNewPassword,
  //     });
  //   }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserEntity | null> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
}
