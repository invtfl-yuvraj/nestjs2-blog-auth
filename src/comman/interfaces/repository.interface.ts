import { UserEntity, PublicUser } from '../../users/dto/user.dto';

import { CreateUserDto } from '../../users/dto/create-user.dto';
import { UpdateUserDto } from '../../users/dto/update-user.dto';

// Base Repository Interface
export interface IBaseRepository<TRead, TCreate, TUpdate = Partial<TCreate>> {
  findAll(): Promise<TRead[]>;
  findById(id: string): Promise<TRead | null>;
  create(data: TCreate): Promise<TRead>;
  update(id: string, data: TUpdate): Promise<TRead>;
  delete(id: string): Promise<void>;
}

// Extended interface for User repository
export interface IUserRepository extends IBaseRepository<
  PublicUser,
  CreateUserDto,
  UpdateUserDto
> {
  findByEmail(email: string): Promise<UserEntity | null>;
  existsByEmail(email: string): Promise<boolean>;
}

// Extended interface for Post repository
// export interface IPostRepository<T> extends IBaseRepository<T> {
//   findByAuthorId(authorId: string): Promise<T[]>;
//   findPublished(): Promise<T[]>;
// }
