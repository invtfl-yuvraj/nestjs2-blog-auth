import { UserEntity, PublicUser } from '../../users/dto/user.dto';

import { CreateUserDtoType } from '../../users/dto/create-user.dto';
import { UpdateUserDtoType } from '../../users/dto/update-user.dto';
import {
  CreatePostType,
  PostEntity,
  UpdatePostType,
} from '../../posts/types/post.type';

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
  CreateUserDtoType,
  UpdateUserDtoType
> {
  findByEmail(email: string): Promise<UserEntity | null>;
  existsByEmail(email: string): Promise<boolean>;
}

// Extended interface for Post repository
export interface IPostRepository extends IBaseRepository<
  PostEntity,
  CreatePostType,
  UpdatePostType
> {
  findByAuthorId(authorId: string): Promise<PostEntity[]>;
  findPublished(): Promise<PostEntity[]>;
}
